// export const requestChatsPreviewSQLRequestOLD = `SELECT m.id, m.txt, m.chat_id, m.status, m.created_at, u.username, u.photo
// from
// (
//     SELECT distinct on (chat_id) chat_id, id, author_id, txt, status, created_at
//     FROM messages
//     ORDER BY chat_id, created_at DESC
// ) AS m
// INNER JOIN chats c ON c.id = m.chat_id
// INNER JOIN users u ON c.owner_id = u.id
// WHERE u.id=$1;`;

// user_chats -> по каждому user_id какие есть номера чатов, у которых моей user_id напротив
// из messages берём только чаты этого пользователя. сортируется и берём последнеий месседж
// мне нужно фото и username собеседника
// user_chats -> номер user_id у людей , у которых chat_id такое

export const requestChatsPreviewSQLRequest = `SELECT distinct on (user_chats.chat_id) messages.txt, messages.id, messages.status, messages.created_at, user_chats.chat_id FROM user_chats
INNER JOIN messages ON messages.chat_id=user_chats.chat_id 
WHERE user_id=$1
ORDER BY user_chats.chat_id, messages.created_at DESC
;`;

export const requestChatsPreviewUserInfoSQLRequest = `SELECT username, photo, id FROM users 
JOIN user_chats ON user_chats.user_id = users.id 
WHERE chat_id in (SELECT chat_id FROM user_chats WHERE user_id = $1) AND id <> $1;`; // по всем пользотелям , с которым у нас есть чаты, включая нас самих

// `SELECT username, photo FROM users
// JOIN user_chats ON user_chats.user_id = users.id
// WHERE chat_id in (SELECT chat_id FROM user_chats WHERE user_id = $1) AND id <> $1
// ` // по всем пользотелям , с которым у нас есть чаты, включая нас самих
// `select * from users u
// join user_chats uc on u.id=uc.user_id
// join user_chats my_chats on uc.chat_id=my_chats.chat_id
// where my_chats.user_id = $1 AND u.id <> $1
// `;

export const requestChatByIdSQLRequest = `SELECT m.id, m.txt, m.status, m.chat_id, u.username, m.created_at 
FROM messages AS m 
LEFT JOIN users u on m.author_id = u.id
WHERE m.chat_id = $1
ORDER BY m.created_at asc;`;

export const sqlrequest = `SELECT distinct on (chat_info.chat_id) messages.txt, messages.id, messages.status, messages.created_at, chat_info.username, chat_info.chat_id, chat_info.photo
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
