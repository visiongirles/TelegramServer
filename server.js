import http from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';

const app = express();
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log('ALLO?');
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

websocketServer.on('connection', function connection(ws, request, client) {
  ws.on('error', console.error);
  ws.on('message', function message(data) {
    console.log(`Received message ${data} from user ${client}`);
  });
});
