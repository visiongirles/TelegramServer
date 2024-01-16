import http from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
import fs from 'node:fs';
import path from 'node:path';
import { pool } from './connection.js';
// import url from 'node:url';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

// const dirnameSomething = dirname(fileURLToPath(import.meta.url)); // /path/spmething/
// const filenameSomething = fileURLToPath(import.meta.url); // server.json

const app = express();
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log('Server is listening');
  if (process.send) {
    process.send(`Server running at http://localhost:${port}\n\n`);
  }
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
    const requestChatsPreview = `select m.id, m.message, chat_id, u.username 
    from 
    (
        select distinct on (chat_id) chat_id, id, author_id, message
        from messages
        order by chat_id, date desc
    ) as m
    left join users u on m.author_id = u.id;`;
    pool.query(requestChatsPreview, (err, result) => {
      if (err) {
        console.error('Error executing query', err);
        return;
      }

      console.log('Query result:', result.rows);
      const json = JSON.stringify(result.rows);
      ws.send(json);
    });

    // console.log(`Received message '${data}' from user`);
    // const filePath = path.resolve(
    //   dirname(fileURLToPath(import.meta.url)),
    //   './data/messanger.json'
    // );
    // const filePath = './data/messanger.json';
    // './data/chatOne.json'
    // const messanger = fs.readFileSync(filePath, { encoding: 'utf8' });
    // ws.send(messanger);
    // const response = { event: 'chat-message', payload: { messages } };
    // ws.send(response);
    // console.log(response);
  });
});

// при коннекте тебе нужно положить ws-коннект куда-нибудь в список коннектов, при дисконнекте - удалять этот коннект..
// на сообщении - бродкастить сообщение всем подключенным клиентам по списку

// FROM client:  write new message
// file.write(JSON.stringify(messages));

// TO  client
// const someMessage = JSON.parse(fileContent);

// fs.writeFileSync(file, JSON.stringify(messages), { encoding: 'utf8' });
