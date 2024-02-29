import jwt from 'jsonwebtoken';
import { createHash } from 'node:crypto';
import { webSocketConnection } from './server.js';

const EXPIRATION_PERIOD = 60 * 60 * 48;

// export function addSocket(webSocket, userId) {
//   webSocketConnection.set(webSocket, userId);
// }

//  if(!webSocketSet){ webSocketSet=new Set() webSocketConnections.set(userId, webSocketSet) } webSocketSet.add(wsConnection)

export function addSocket(webSocket, userId) {
  let webSocketArray = webSocketConnection.get(userId);
  webSocketArray.add(webSocket);
  webSocketConnection.set(userId, webSocketArray);
}

export function removeSocket(webSocket, userId) {
  let webSocketArray = webSocketConnection.get(userId);
  webSocketArray.delete(webSocket);
  webSocketConnection.set(userId, webSocketArray);
}

// export function removeSocket(webSocket) {
//   webSocketConnection.delete(webSocket);
// }

// jwt-encode
export function createToken(userId, secret) {
  const dateNow = Date.now() / 1000;
  const token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + EXPIRATION_PERIOD, // in seconds
      user_id: {
        userId,
      },
    },
    secret
  );
  // const exp = parseJwt(token).exp;

  return token;
}

// token parse
export function parseJwt(token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

// hash
export function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}