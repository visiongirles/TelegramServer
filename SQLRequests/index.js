export const requestChatByIdSQLRequest = `SELECT m.id, m.txt, m.status, m.chat_id, m.author_id, u.username, m.created_at 
FROM messages AS m 
LEFT JOIN users u on m.author_id = u.id
WHERE m.chat_id = $1
ORDER BY m.created_at asc;`;

export const requestChatsPreviewSQLRequest = `SELECT distinct on (chat_info.chat_id) messages.txt, messages.id, messages.status, messages.created_at, messages.author_id, chat_info.username, chat_info.chat_id, chat_info.photo
FROM  (
    select u.username, usr_chats.chat_id, u.photo 
        from users u 
        inner join 
            (select user_id, uc1.chat_id 
            from (select chat_id from user_chats where user_id = $1) as uc1
            inner join user_chats uc2 on uc1.chat_id = uc2.chat_id 
            where uc2.user_id <> $1) as usr_chats
        on u.id = usr_chats.user_id
) as chat_info 
INNER JOIN messages ON messages.chat_id=chat_info.chat_id 
ORDER BY chat_info.chat_id, messages.created_at DESC`;

export const requestCreateNewMessageSQLRequest = `INSERT INTO messages (chat_id, created_at, author_id, txt, status)
VALUES ($1, now(), $2, $3, $4) RETURNING *;`;

export const requestSelectUpdatedChatsSQLRequest = `SELECT user_id FROM user_chats WHERE chat_id=$1 AND user_id <>$2;`;

export const requestDeleteMessageByIdSQLRequest = `DELETE FROM messages WHERE chat_id=$1 AND id=$2`;

// inner join user_chats uc on uc.user_id = $1

export const requestUserPasswordSQLRequest = `SELECT sha256($2 || salt)=password FROM users WHERE username=$1`;
// export const requestUserPasswordSQLRequest = `SELECT ($2 || salt)=password FROM users WHERE username=$1`;

export const requestCreateNewUserSQLRequest = `INSERT INTO users (username, status, password, salt)
VALUES ($1, 'Online', $2, $3) RETURNING id;`;

export const requestPasswordAndSaltSQLRequest = `SELECT password, salt, id FROM users WHERE username=$1;`;

`SELECT password FROM user WHERE password=sha256($2 || salt)`;

`SELECT password FROM user from 
(SELECT salt FROM user WHERE username=$1) 
as salt
WHERE password=sha256($2 || salt)`;

`SELECT sha256($1 || salt)=password FROM users WHERE username=$1`;

export const reuqestUserInfoSQLRequest = `SELECT username, photo, id FROM users WHERE id=$1;`;
