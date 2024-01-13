import http from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';

const app = express();
const PORT_HTTP = 3000;
// const PORT_WEBSOCKET = 80;

const server = http.createServer(app);

const webSocketServer = new WebSocketServer({ server });
// const webSocketServer = new Server({ port: PORT_WEBSOCKET });

var clients = new Array();

// this runs after the http server successfully starts:
function serverStart() {
  var port = this.address().port;
  console.log('Server listening on port ' + port);
}

// this handles websocket connections:
function handleClient(thisClient, request) {
  // you have a new client
  console.log('New Connection');
  // add this client to the clients array

  clients.push(thisClient);

  function endClient() {
    // when a client closes its connection
    // get the client's position in the array
    // and delete it from the array:
    var position = clients.indexOf(thisClient);
    clients.splice(position, 1);
    console.log('connection closed');
  }

  // if a client sends a message, print it out:
  function clientResponse(data) {
    console.log(data.toString());
    broadcast(data.toString());
  }

  // This function broadcasts messages to all webSocket clients
  function broadcast(data) {
    // iterate over the array of clients & send data to each
    for (let c in clients) {
      clients[c].send(data);
    }
  }

  // set up client event listeners:
  thisClient.on('message', clientResponse);
  thisClient.on('close', endClient);
}

// 4 websocket events: connection, error, messagem close
// webSocketServer.on('connection', (ws) => {
//   ws.on('message', (message) => {
//     webSocketServer.clients.forEach((client) => client.send(m));
//   });

//   ws.on('error', (error) => ws.send(e));

//   ws.send('Hi there, I am a WebSocket server');
// });

server.listen(PORT_HTTP, serverStart);

// start the websocket server listening for clients:
webSocketServer.on('connection', handleClient);

// GET method route
// app.get('/state', (req, res) => {
//   res.send('hello world');
// });

// POST method route
// app.post('/', (req, res) => {
//   res.send('POST request to the homepage');
// });

// DELETE method route
// app.delete('/', (req, res) => {
//   res.send('POST request to the homepage');
// });
