import express from 'express';
import { WebSocketServer } from 'ws';
import { pool } from './connection.js';
import cors from 'cors';
import { createHash } from 'node:crypto';
import jwt from 'jsonwebtoken';
import {
  requestChatsPreviewSQLRequest,
  requestChatByIdSQLRequest,
  requestCreateNewMessageSQLRequest,
  requestDeleteMessageByIdSQLRequest,
  requestCreateNewUserSQLRequest,
  requestPasswordAndSaltSQLRequest,
} from './SQLRequests/index.js';

// MOCK DATA
const EXPIRATION_PERIOD = 60 * 60 * 48;
let authorization = false;
const SECRET = 'secret';
const WRONG_SECRET = 'secret_WRONGGGGGG';
const socketUpgradeURL = 'ws://localhost:3000/websockets';

let webSocketConnection = new Map();

//  URL_WEBSOCKET обычно вытаскивают в .env файлы, хороший тон ( на будущее)

// create HTTP server
const app = express();

// setup port for listening
const port = process.env.PORT || 3000;

// allow CORS
app.use(
  cors({
    origin: 'http://localhost:5173', // Разрешенный источник
    methods: ['GET', 'POST'], // Разрешенные методы
    allowedHeaders: ['Content-Type'], // Разрешенные заголовки
    credentials: true, // Разрешение передачи куки и заголовков аутентификации через CORS
  })
);

// Start listening
const server = app.listen(port, () => {
  console.log('Server is listening');
});

// jwt-encode
function createToken(userId) {
  const dateNow = Date.now();
  const token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + EXPIRATION_PERIOD, // in seconds
      user_id: {
        userId,
      },
    },
    SECRET
  );
  const exp = parseJwt(token).exp;
  console.log('dateNow: ', dateNow, '[ createToken. exp: ]', exp);

  return token;
}
// TODO: перенести все настйроки в json файл
// не пароли , а хэши паролей
//  readFileSync('.env', {encoding: 'utf-8' }).split('\n').map(s => s.indexOf()s.split('=').map(([k, v]) => process.env[k] = v)

// token parse
function parseJwt(token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

function addSocket(webSocket, userId) {
  webSocketConnection.set(webSocket, userId);
}

function removeSocket(webSocket) {
  webSocketConnection.delete(webSocket);
}

// Check authorization
app.post('/auth', express.json(), async (req, res) => {
  // 1. check hashed + salted password in request VS in database
  // 2. OK -> token
  const username = req.body.username;
  const password = req.body.password;
  console.log(
    'username from Client: ',
    username,
    'password from Client:: ',
    password
  );
  const values = [username];
  const sqlRequest = requestPasswordAndSaltSQLRequest; // TODO: SQL salt && hashed password

  //
  try {
    const result = await pool.query(sqlRequest, values);

    const hashedPasswordFromDB = result.rows[0].password;
    const salt = result.rows[0].salt;
    const hashedPasswordFromUser = sha256(password + salt);
    if (hashedPasswordFromUser === hashedPasswordFromDB) {
      const userId = result.rows[0].id;
      const token = createToken(userId);
      console.log('authorization is changed to TRUE');

      authorization = true;
      res.status(200).send({ token: token });
    } else {
      throw Error;
    }
  } catch (error) {
    res.status(401).end('Incorrect Login or Password');
  }
});

app.post('/authByToken', express.json(), (req, res) => {
  // TODO: проверить валидность токена
  const token = req.body.token;
  console.log(req.body.token);
  try {
    jwt.verify(token, SECRET);
    authorization = true;
    console.log('authorization is changed to TRUE');
    res.status(200).send({ token: token });
  } catch (err) {
    console.log(err.message);
    res.status(401).end('Invalid token');
  }
});

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

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
    res.status(200).send({ token });
    //
  } catch (err) {
    res.status(401).end('Login is occupied');
  }
});

const websocketServer = new WebSocketServer({
  noServer: true,
  path: '/websockets',
});

server.on('upgrade', (request, socket, head) => {
  console.log('Update to socket is made');
  if (authorization) {
    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
      websocketServer.emit('connection', websocket, request);
    });
  }
});

// to check if broken = https://www.npmjs.com/package/ws#how-to-detect-and-close-broken-connections

// суть - создать слой с необходимым интерфейсом независящий от реализации протокола (ws в данном случае)
// const user = connection;

// можно сделать словарь
// const requestDictionary = ['get-chats-preview', requestChatsPreview(..)]

function sendData(data, ws) {
  const json = JSON.stringify(data);
  ws.send(json);
}

async function getChatsPreview() {
  const requestChatsPreview = requestChatsPreviewSQLRequest;

  try {
    const result = await pool.query(requestChatsPreview);
    return result.rows;
  } catch (error) {
    console.error('Error executing query', error);
    return;
  }
}

async function getChatById(chatId, ws) {
  const values = [chatId];
  const requestChatById = requestChatByIdSQLRequest;

  try {
    const result = await pool.query(requestChatById, values);

    return result.rows;
  } catch (error) {
    console.error('Error executing query', err);
    return;
  }
}

async function createNewMessage(chat_id, txt) {
  const values = [chat_id, 1, txt, 'hasNotRead'];

  const requestCreateNewMessage = requestCreateNewMessageSQLRequest;

  try {
    const result = await pool.query(requestCreateNewMessage, values);
    const object = {
      message: result.rows[0],
    };
    return object;
  } catch (error) {
    console.error('Error executing query', error);
    return;
  }
}

async function deleteMessageById(chatId, messageId) {
  const values = [chatId, messageId];
  const requestDeleteMessageById = requestDeleteMessageByIdSQLRequest;

  try {
    await pool.query(requestDeleteMessageById, values);
    const result = {
      deletedMessage: {
        messageId: messageId,
        chatId: chatId,
      },
    };
    return result;
  } catch (error) {
    console.error('Error executing query', error);
  }
}

websocketServer.on('connection', function connection(ws, request) {
  console.log('request: ', request);
  ws.on('error', console.error);
  ws.on('message', async function message(data) {
    const request = JSON.parse(data);

    switch (request.type) {
      case 'set-token': {
        const userId = jwt.verify(request.token, SECRET).user_id.userId;
        console.log('[set-token]: ', userId);
        addSocket(ws, userId);
        console.log(webSocketConnection.keys());
        break;
      }

      case 'get-chats-preview': {
        const result = await getChatsPreview();
        // console.log(result);
        const data = {
          chatsPreview: [...result],
          type: request.type,
        };
        sendData(data, ws);
        break;
      }
      case 'get-chat-by-id': {
        const result = await getChatById(request.chatId, ws);
        // console.log(result);
        const data = {
          messages: [...result],
          type: request.type,
        };
        sendData(data, ws);
        break;
      }
      case 'create-new-message': {
        const result = await createNewMessage(
          request.message.chat_id,
          request.message.txt
        );
        const data = {
          type: request.type,
          chatId: request.message.chat_id,
          message: { ...result.message },
        };

        sendData(data, ws);
        break;
      }
      case 'delete-message-by-id': {
        let result = await deleteMessageById(request.chatId, request.messageId);
        // result.type = request.type;
        const data = { ...result, type: request.type };
        sendData(data, ws);
        break;
      }
    }
  });
  ws.on('close', function close() {
    removeSocket(ws);
    console.log('[Closed websocket: ]', webSocketConnection);
  });
});
