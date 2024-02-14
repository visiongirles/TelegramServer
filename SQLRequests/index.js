export const requestChatsPreviewSQLRequest = `SELECT m.id, m.txt, m.chat_id, m.status, m.created_at, u.username, u.photo 
from 
(
    SELECT distinct on (chat_id) chat_id, id, author_id, txt, status, created_at
    from messages
    order by chat_id, created_at desc
) as m
inner join chats c on c.id = m.chat_id
inner join users u on c.owner_id = u.id;`;

export const requestChatByIdSQLRequest = `SELECT m.id, m.txt, m.status, m.chat_id, u.username, m.created_at 
FROM messages AS m 
LEFT JOIN users u on m.author_id = u.id
WHERE m.chat_id = $1
ORDER BY m.created_at asc;`;

export const requestCreateNewMessageSQLRequest = `INSERT INTO messages (chat_id, created_at, author_id, txt, status)
VALUES ($1, now(), $2, $3, $4) RETURNING *;`;

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
