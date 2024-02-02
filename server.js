import express from 'express';
import { WebSocketServer } from 'ws';
import { pool } from './connection.js';
import cors from 'cors';

// MOCK DATA
const username = 'duckate';
const password = '123';
let authorization = false;
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

// app.use(express.json());

//
const server = app.listen(port, () => {
  console.log('Server is listening');
});

// check authorization
app.post('/auth', express.json(), (req, res) => {
  if (req.body.username === username && req.body.password === password) {
    console.log('authorization is changed');
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
  console.log('UPGRADE');
  if (authorization) {
    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
      websocketServer.emit('connection', websocket, request);
    });
  }
});

websocketServer.on('connection', function connection(ws, request) {
  ws.on('error', console.error);
  ws.on('message', function message(data) {
    const request = JSON.parse(data);

    switch (request.type) {
      case 'get-chats-preview': {
        const requestChatsPreview = `select m.id, m.txt, m.chat_id, m.status, m.created_at, u.username, u.photo 
        from 
        (
            select distinct on (chat_id) chat_id, id, author_id, txt, status, created_at
            from messages
            order by chat_id, created_at desc
        ) as m
        inner join chats c on c.id = m.chat_id
        inner join users u on c.owner_id = u.id;`;
        pool.query(requestChatsPreview, (err, result) => {
          if (err) {
            console.error('Error executing query', err);
            return;
          }

          const object = {
            type: request.type,
            id: request.id,
            chatsPreview: result.rows,
          };
          const json = JSON.stringify(object);
          ws.send(json);
        });
        break;
      }
      case 'get-chat-by-id': {
        const values = [request.chatId];
        const requestChatById = `select m.id, m.txt, m.status, m.chat_id, u.username, m.created_at 
        from messages as m 
        left join users u on m.author_id = u.id
        where m.chat_id = $1
        ORDER BY m.created_at asc;`;

        pool.query(requestChatById, values, (err, result) => {
          if (err) {
            console.error('Error executing query', err);
            return;
          }

          const object = {
            id: request.id,
            type: request.type,
            messages: result.rows,
          };
          const json = JSON.stringify(object);
          ws.send(json);
        });
        break;
      }
      case 'create-new-message': {
        const values = [
          request.message.chat_id,
          1,
          request.message.txt,
          'hasNotRead',
        ];
        const requestCreateNewMessage = `INSERT INTO messages (chat_id, created_at, author_id, txt, status)
        VALUES ($1, now(), $2, $3, $4) RETURNING *;`;

        pool.query(requestCreateNewMessage, values, (err, result) => {
          if (err) {
            console.error('Error executing query', err);
            return;
          }

          const object = {
            id: request.id,
            type: request.type,
            message: result.rows[0],
          };
          const json = JSON.stringify(object);
          ws.send(json);
        });

        break;
      }
      case 'delete-message-by-id': {
        const messageId = request.id;
        const chatId = request.chatId;
        const requestDeleteMessageById = `DELETE FROM messeges WHERE id=${messageId} AND chat_id=${chatId}`;
        pool.query(requestDeleteMessageById, (err, result) => {
          if (err) {
            console.error('Error executing query', err);
            return;
          }

          const object = {
            type: request.type,
            id: request.id,
            deletedMessage: { messageId, chatId },
          };
          const json = JSON.stringify(object);
          ws.send(json);
        });
        break;
      }
    }
  });
});
