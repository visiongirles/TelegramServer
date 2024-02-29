import {
  requestChatsPreviewSQLRequest,
  requestChatByIdSQLRequest,
  requestCreateNewMessageSQLRequest,
  requestDeleteMessageByIdSQLRequest,
} from './SQLRequests/index.js';

import { pool } from './connection.js';

export async function fetchUserInfo(userId) {
  const requestUserInfo = requestChatsPreviewUserInfoSQLRequest;
  const values = [userId];
  try {
    const result = await pool.query(requestUserInfo, values);
    return result.rows;
  } catch (error) {
    console.error('Error executing query', error);
    return;
  }
}

export async function getChatsPreview(userId) {
  const requestChatsPreview = requestChatsPreviewSQLRequest;
  const values = [userId];

  try {
    const result = await pool.query(requestChatsPreview, values);

    return result.rows;
  } catch (error) {
    console.error('Error executing query', error);
    return;
  }
}

export async function getChatById(chatId) {
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

export async function createNewMessage(chat_id, userId, txt) {
  const values = [chat_id, userId, txt, 'hasNotRead'];

  const requestCreateNewMessage = requestCreateNewMessageSQLRequest;

  try {
    const result = await pool.query(requestCreateNewMessage, values);
    // console.log('[Create message result: ]', result.rows[0]);
    const object = {
      message: result.rows[0],
    };
    return object;
  } catch (error) {
    console.error('Error executing query', error);
    return;
  }
}

export async function deleteMessageById(chatId, messageId) {
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
