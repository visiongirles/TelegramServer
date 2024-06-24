import {
  getChatByIdSQLRequest,
  createNewMessageSQLRequest,
  deleteMessageByIdSQLRequest,
  getChatsSQLRequest,
  setMessageReadSQLRequest,
  updateMessageSQLRequest,
  getChatsPreviewSQLRequest,
} from './SQLRequests/index.js';

import { pool } from './connection.js';

export async function getChatsPreview(userId) {
  const values = [userId];

  try {
    const result = await pool.query(getChatsPreviewSQLRequest, values);
    console.log('New preview result: ', result.rows);
    return result.rows;
  } catch (error) {
    console.error('[getChatsPreview] Error executing query', error);
    return;
  }
}

export async function setMessagesRead(chatId, userId) {
  const values = [chatId, userId]; // messageId in SQL query
  console.log('values: ', values);

  try {
    await pool.query(setMessageReadSQLRequest, values);
    return;
  } catch (error) {
    console.error('[setMessagesRead] Error executing query', error);
    return;
  }
}

export async function updateEditedMessage(chatId, userId, messageId, txt) {
  const values = [chatId, userId, messageId, txt];
  try {
    const result = await pool.query(updateMessageSQLRequest, values);
    return result.rows[0];
  } catch (error) {
    console.error('[updateEditedMessage] Error executing query', error);
    return;
  }
}

export async function getChatById(chatId) {
  const values = [chatId];
  const requestChatById = getChatByIdSQLRequest;

  try {
    const result = await pool.query(requestChatById, values);

    return result.rows;
  } catch (error) {
    console.error('[getChatById] Error executing query', error);
    return;
  }
}

export async function findChatsToUpdate(chat_id, userId) {
  const values = [chat_id, userId];

  try {
    const result = await pool.query(getChatsSQLRequest, values);

    const userIds = result.rows.map((item) => item.user_id);
    return userIds;
  } catch (error) {
    console.error('[findChatsToUpdate] Error executing query', error);
    return;
  }
}

export async function createNewMessage(chat_id, userId, txt) {
  const values = [chat_id, userId, txt, 'hasNotRead'];

  const requestCreateNewMessage = createNewMessageSQLRequest;

  try {
    const result = await pool.query(requestCreateNewMessage, values);
    const object = {
      message: result.rows[0],
    };
    return object;
  } catch (error) {
    console.error('[createNewMessage] Error executing query', error);
    return;
  }
}

export async function deleteMessageById(chatId, messageId) {
  const values = [chatId, messageId];

  try {
    await pool.query(deleteMessageByIdSQLRequest, values);
    const result = {
      deletedMessage: {
        messageId: messageId,
        chatId: chatId,
      },
    };
    return result;
  } catch (error) {
    console.error('[deleteMessageById] Error executing query', error);
  }
}
