import express from 'express';
import { WebSocketServer } from 'ws';
import { pool } from './connection.js';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import {
  requestCreateNewUserSQLRequest,
  requestPasswordAndSaltSQLRequest,
  reuqestUserInfoSQLRequest,
} from './SQLRequests/index.js';

import config from './config.json'  with { type: "json" };

import { addSocket, removeSocket, createToken, sha256} from './utils.js';


import { getChatsPreview, getChatById, createNewMessage, deleteMessageById, findChatsToUpdate as findUserIdToUpdate } from './DBfunctions.js'

// MOCK DATA
let authorization = false;
// const SECRET = 'secret';
const SECRET = config.secret;
const socketUpgradeURL = config.socketUpgradeURL;
const socketUpgradeURLShort = config.socketUpgradeURLShort;

// export let webSocketConnection = new Map();
export let webSocketConnection = new Map(); //  Map<UserId,SetWSConnection[]>
export let userIdWebSocketConnection = new Map(); //  Map<WSConnection,UserId>


// create HTTP server
const app = express();

// setup port for listening
const port = process.env.PORT || config.port;

const corsConfig = config.cors;

// allow CORS
app.use(
  cors({
    origin: corsConfig.origin, // Разрешенный источник
    methods: corsConfig.methods, // Разрешенные методы
    allowedHeaders: corsConfig.allowedHeaders, // Разрешенные заголовки
    credentials: corsConfig.credentials, // Разрешение передачи куки и заголовков аутентификации через CORS
  })
);

// Start listening
const server = app.listen(port, async () => {
  console.log('Server is listening');
});

// TODO: перенести все настйроки в json файл
// не пароли , а хэши паролей
//  readFileSync('.env', {encoding: 'utf-8' }).split('\n').map(s => s.indexOf()s.split('=').map(([k, v]) => process.env[k] = v)

// Check authorization by Login and Password
app.post('/auth', express.json(), async (req, res) => {
  // 1. check hashed + salted password in request VS in database
  // 2. OK -> token
  const username = req.body.username;
  const password = req.body.password;

  const values = [username];
  const sqlRequest = requestPasswordAndSaltSQLRequest; // TODO: SQL salt && hashed password

  //
  try {
    const result = await pool.query(sqlRequest, values);

    const hashedPasswordFromDB = result.rows[0].password;
    const salt = result.rows[0].salt;
    const userId = result.rows[0].id;
    const hashedPasswordFromUser = sha256(password + salt);
    if (hashedPasswordFromUser === hashedPasswordFromDB) {
 
      const token = createToken(userId, SECRET);
      console.log('[/auth] authorization is changed to TRUE');
      const values = [result.rows[0].id]
      const userInfo = await pool.query(reuqestUserInfoSQLRequest, values);
      authorization = true;
      res.status(200).send({ token: token, user: userInfo.rows[0] });
    } else {
      throw Error;
    }
  } catch (error) {
    console.log(error);
    res.status(401).end('Incorrect Login or Password');
  }
});

// Check authorization by Access Token
app.post('/authByToken', express.json(), async (req, res) => {
  // TODO: проверить валидность токена
  const token = req.body.token;
  try {
    const userId = jwt.verify(token, SECRET).user_id.userId;
    const values = [userId];
    const userInfo = await pool.query(reuqestUserInfoSQLRequest, values);

    authorization = true;
    console.log('[/authByToken] authorization is changed to TRUE');
    res.status(200).send({ token: token, user: userInfo.rows[0] });
  } catch (err) {
    console.log(err.message);
    res.status(401).end('Invalid token');
  }
});

// Create new user
app.post('/register', express.json(), async (req, res) => {
  // TODO: проверить валидность токена
  const username = req.body.username;
  const password = req.body.password;
  const salt = Math.random();
  const hashedPassword = sha256(password + salt);
  const values = [username, hashedPassword, salt];
  const sqlRequest = requestCreateNewUserSQLRequest;
  try {
    const result = await pool.query(sqlRequest, values);
    const user = { userId: result.id }; // TODO: user_id
    const token = createToken(user);

    authorization = true;
    console.log('[/register] authorization is changed to TRUE');
    res.status(200).send({ token: token });
    //
  } catch (err) {
    res.status(401).end('Login is occupied');
  }
});

const websocketServer = new WebSocketServer({
  noServer: true,
  path: socketUpgradeURLShort,
});

//Upgrade to sockets
server.on('upgrade', (request, socket, head) => {
  console.log('Update to socket is made');
    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
      websocketServer.emit('connection', websocket, request);
    });
  
});

// send data to particular webSocket
function sendData(data, ws) {
  const json = JSON.stringify(data);
  ws.send(json);
}

websocketServer.on('connection', function connection(ws, request) {
  ws.on('error', console.error);
  ws.on('message', async function message(data) {
    const request = JSON.parse(data);

    switch (request.type) {
      case 'set-token': {
        const userId = jwt.verify(request.token, SECRET).user_id.userId;
        userIdWebSocketConnection.set(ws, userId);
        addSocket(ws, userId);
        break;
      }

      case 'get-chats-preview': {
        const result = await getChatsPreview(request.userId);

        const data = {
          chatsPreview: [...result],
          type: request.type,
        };
        sendData(data, ws);
        break;
      }

      case 'get-chat-by-id': {
        const result = await getChatById(request.chatId, ws);
        const data = {
          messages: [...result],
          type: request.type,
        };
        sendData(data, ws);
        break;
      }

      case 'create-new-message': {
        // userId of current websocket connection
        const userId = userIdWebSocketConnection.get(ws); 
        const result = await createNewMessage(
          request.message.chat_id,
          userId, 
          request.message.txt
        );

        // new message info
        const data = {
          type: request.type,
          chatId: request.message.chat_id,
          message: { ...result.message },
        };

        // update current client
        sendData(data, ws);

        // array of all userId in relation to this conversation
        const userIds = await findUserIdToUpdate(request.message.chat_id, userId);
        userIds.map((userId) => {
          // set of all websockets for each userId
          const webSocketSet = webSocketConnection.get(userId.user_id);

          // notify all active clients (websocket connections)
          if (webSocketSet) {
            for (let ws of webSocketSet) {
              sendData(data, ws);
            }
          }
        })
  
        break;
      }
      case 'delete-message-by-id': {
        let result = await deleteMessageById(request.chatId, request.messageId);
        const data = { ...result, type: request.type };

        // update current client
        sendData(data, ws);

        const userId = userIdWebSocketConnection.get(ws);

        // array of all userId in relation to this conversation
        const userIds = await findUserIdToUpdate(request.chatId, userId);
        userIds.map((userId) => {
          // set of all websockets for each userId
          const webSocketSet = webSocketConnection.get(userId.user_id);

          // notify all active clients (websocket connections)
          if (webSocketSet) {
            for (let ws of webSocketSet) {
              sendData(data, ws);
            }
          }
        })

        break;
      }
    }
  });
  ws.on('close', function close() {
    const userId = userIdWebSocketConnection.get(ws);
    removeSocket(ws, userId);
    userIdWebSocketConnection.delete(ws);
    console.log('[Closed websocket: ]', webSocketConnection);
  });
});
