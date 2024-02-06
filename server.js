import express from 'express';
import { WebSocketServer } from 'ws';
import { pool } from './connection.js';
import cors from 'cors';
import {
  requestChatsPreviewSQLRequest,
  requestChatByIdSQLRequest,
  requestCreateNewMessageSQLRequest,
  requestDeleteMessageByIdSQLRequest,
} from './SQLRequests/index.js';

// MOCK DATA
const username = 'duckate';
const password = '123';
let authorization = true;
const socketUpgradeURL = 'ws://localhost:3000/websockets';

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

// Check authorization
app.post('/auth', express.json(), (req, res) => {
  if (req.body.username === username && req.body.password === password) {
    console.log('authorization is changed to TRUE');
    authorization = true;
    res.status(200).send({});
  } else {
    res.status(401).end();
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

websocketServer.on('connection', function connection(ws) {
  ws.on('error', console.error);
  ws.on('message', async function message(data) {
    const request = JSON.parse(data);

    switch (request.type) {
      case 'get-chats-preview': {
        const result = await getChatsPreview();
        const data = {
          chatsPreview: [...result],
          type: request.type,
        };
        sendData(data, ws);
        break;
      }
      case 'get-chat-by-id': {
        const result = await getChatById(request.chatId, ws);
        console.log(result);
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
          message: { ...result.message },
          type: request.type,
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
});
