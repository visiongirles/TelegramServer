// export const update

export const getChatByIdSQLRequest = `
SELECT m.id,
       m.txt,
       m.status,
       m.chat_id,
       m.author_id,
       u.username,
       m.created_at
FROM   messages AS m
       LEFT JOIN users u
              ON m.author_id = u.id
WHERE  m.chat_id = $1
ORDER  BY m.created_at ASC;`;

export const getChatsPreviewSQLRequest = `
SELECT DISTINCT On (user_info.chat_id) messages.txt,
                messages.id,
                messages.status,
                messages.created_at,
                messages.author_id,
                user_info.username,
                user_info.photo,
                user_info.chat_id,
                COALESCE(unread_message.unread_message_count, 0) AS unread_message_count
FROM   (SELECT users.username,
               chat_info.chat_id,
               users.photo
        FROM   users
               INNER JOIN (SELECT user_id,
                                  our_chats.chat_id
                           FROM   (SELECT chat_id
                                   FROM   user_chats
                                   WHERE  user_id = $1) AS our_chats
                                  INNER JOIN user_chats
                                          ON our_chats.chat_id =
                                             user_chats.chat_id
                           WHERE  user_chats.user_id <> $1) AS chat_info
                       ON users.id = chat_info.user_id) AS user_info
       LEFT JOIN (SELECT chat_id,
                         Count(*) AS unread_message_count
                  FROM   messages
                  WHERE  author_id <> $1
                         AND status = 'hasNotRead'
                  GROUP  BY chat_id) AS unread_message
              ON user_info.chat_id = unread_message.chat_id
       LEFT JOIN messages
              ON messages.chat_id = user_info.chat_id
ORDER  BY user_info.chat_id,
          messages.created_at DESC;`;

export const createNewMessageSQLRequest = `
INSERT INTO messages
            (
                        chat_id,
                        created_at,
                        author_id,
                        txt,
                        status
            )
            VALUES
            (
                        $1,
                        Now(),
                        $2,
                        $3,
                        $4
            )
            returning *;`;

export const getChatsSQLRequest = `
SELECT user_id
FROM   user_chats
WHERE  chat_id = $1
       AND user_id <> $2; `;

export const deleteMessageByIdSQLRequest = `
SELECT user_id
FROM   user_chats
WHERE  chat_id = $1
       AND user_id <>$ 2; `;

export const createNewUserSQLRequest = `
INSERT INTO users
            (
                        username,
                        status,
                        password,
                        salt
            )
            questcvalues
            (
                        $1,
                        'Online',
                        $2,
                        $3
            )
            returning id;`;

export const getPasswordAndSaltSQLRequest = `
SELECT password,
       salt,
       id
FROM   users
WHERE  username = $1; `;

export const getUserInfoSQLRequest = `
SELECT username,
       photo,
       id
FROM   users
WHERE  id = $1; `;

export const setMessageReadSQLRequest = `
UPDATE messages
SET    status = 'hasRead'
WHERE  chat_id = $1
       AND author_id <> $2; `;

export const updateMessageSQLRequest = `
UPDATE messages
SET    txt=$4
WHERE  chat_id=$1
AND    author_id=$2
AND    id=$3 returning *;`;
