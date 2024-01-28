import express from 'express';
import { WebSocketServer } from 'ws';
import { pool } from './connection.js';

const app = express();
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log('Server is listening');
});

const websocketServer = new WebSocketServer({
  noServer: true,
  path: '/websockets',
});

server.on('upgrade', (request, socket, head) => {
  websocketServer.handleUpgrade(request, socket, head, (websocket) => {
    websocketServer.emit('connection', websocket, request);
  });
});

websocketServer.on('connection', function connection(ws, request) {
  ws.on('error', console.error);
  ws.on('message', function message(data) {
    const request = JSON.parse(data);

    switch (request.type) {
      case 'get-chats-preview': {
        const requestChatsPreview = `select m.id, m.txt, m.chat_id, m.status, m.date, u.username, u.photo 
        from 
        (
            select distinct on (chat_id) chat_id, id, author_id, txt, status, date
            from messages
            order by chat_id, date desc
        ) as m
        inner join chats c on c.id = m.chat_id
        inner join users u on c.owner_id = u.id;`;
        pool.query(requestChatsPreview, (err, result) => {
          if (err) {
            console.error('Error executing query', err);
            return;
          }

          // console.log('Query result:', result.rows);
          const object = {
            type: request.type,
            id: request.id,
            chatsPreview: result.rows,
          };
          const json = JSON.stringify(object);
          // console.log(json);
          ws.send(json);
        });
        break;
      }
      case 'get-chat-by-id': {
        const requestChatById =
          `select m.id, m.txt, m.status, m.chat_id, u.username, m.date 
        from messages as m 
        left join users u on m.author_id = u.id
        where m.chat_id = ` +
          request.chatId +
          ';';
        pool.query(requestChatById, (err, result) => {
          if (err) {
            console.error('Error executing query', err);
            return;
          }

          console.log('Query result:', result.rows);
          const object = {
            id: request.id,
            type: request.type,
            messages: result.rows,
          };
          // const object = { chatsPreview: result.rows, id: request.id };
          const json = JSON.stringify(object);
          // console.log(json);
          ws.send(json);
        });
        break;
      }
      case 'create-new-message': {
        // const messageId = request.id;
        const { chat_id, date, username, txt, status } = request;
        const requestDeleteMessageById = `INSERT INTO messages 
        (${chat_id}, ${date}, author_id, ${txt}, status) 
        VALUES (1, 1702033300, 2, 'Привет, любители мурлыкающих созданий! Как ваш кот сегодня?', 2);
        `;
        pool.query(requestDeleteMessageById, (err, result) => {
          if (err) {
            console.error('Error executing query', err);
            return;
          }

          // console.log('Query result:', result.rows);
          const object = {
            type: request.type,
            id: request.id,
            chatsPreview: result.rows,
          };
          const json = JSON.stringify(object);
          // console.log(json);
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

          // console.log('Query result:', result.rows);
          const object = {
            type: request.type,
            id: request.id,
            chatsPreview: result.rows,
          };
          const json = JSON.stringify(object);
          // console.log(json);
          ws.send(json);
        });
        break;
      }
    }
  });
});
