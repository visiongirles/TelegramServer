import { createServer } from 'http';
import { app } from 'express';
import { WebSocketServer } from 'ws';

const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  // ...
});

server.on('upgrade', function upgrade(request, socket, head) {
  const { pathname } = parse(request.url);

  if (pathname === '/foo') {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(8080);
