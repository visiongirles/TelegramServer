// export const update

export const getChatByIdSQLRequest = `SELECT m.id, m.txt, m.status, m.chat_id, m.author_id, u.username, m.created_at 
FROM messages AS m 
LEFT JOIN users u on m.author_id = u.id
WHERE m.chat_id = $1
ORDER BY m.created_at asc;`;

export const getChatsPreviewAndUnreadMessagesCountSQLRequest = `SELECT DISTINCT ON (chat_info.chat_id) messages.txt, messages.id, messages.status,
messages.created_at, 
messages.author_id, 
chat_info.username, 
chat_info.chat_id, 
chat_info.photo,
unread_message_count
FROM  
(
SELECT 
    u.username, 
    uc.chat_id, 
    u.photo 
FROM 
    users u 
INNER JOIN 
    user_chats uc
ON 
    u.id = uc.user_id
WHERE 
    uc.user_id <> $1
) AS chat_info 
LEFT JOIN 
messages 
ON 
messages.chat_id = chat_info.chat_id 
LEFT JOIN 
(
    SELECT 
        chat_id, 
        COUNT(*) AS unread_message_count 
    FROM 
        messages 
    WHERE 
        chat_id IN (SELECT chat_id FROM user_chats WHERE user_id = $1) 
        AND author_id <> $1 
        AND status = 'hasNotRead' 
    GROUP BY 
        chat_id
) AS unread_messages
ON 
chat_info.chat_id = unread_messages.chat_id
ORDER BY 
chat_info.chat_id, 
messages.created_at DESC;`;

export const getChatsPreviewSQLRequest = `SELECT DISTINCT ON (chat_info.chat_id) 
messages.txt, 
messages.id, 
messages.status, 
messages.created_at, 
messages.author_id, 
chat_info.username, 
chat_info.chat_id, 
chat_info.photo
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
LEFT JOIN messages ON messages.chat_id=chat_info.chat_id 
ORDER BY chat_info.chat_id, messages.created_at DESC`;

export const unreadMessagesCountSQLRequest = `SELECT COUNT(*) FROM messages WHERE chat_id=$1 AND author_id <>$2 AND status='hasNotRead';`;

export const createNewMessageSQLRequest = `INSERT INTO messages (chat_id, created_at, author_id, txt, status)
VALUES ($1, now(), $2, $3, $4) RETURNING *;`;

export const getChatsSQLRequest = `SELECT user_id FROM user_chats WHERE chat_id=$1 AND user_id <>$2;`;

export const deleteMessageByIdSQLRequest = `DELETE FROM messages WHERE chat_id=$1 AND id=$2`;

// inner join user_chats uc on uc.user_id = $1

// export const getUserPasswordSQLRequest = `SELECT sha256($2 || salt)=password FROM users WHERE username=$1`;
// export const requestUserPasswordSQLRequest = `SELECT ($2 || salt)=password FROM users WHERE username=$1`;

export const createNewUserSQLRequest = `INSERT INTO users (username, status, password, salt)
questCVALUES ($1, 'Online', $2, $3) RETURNING id;`;

export const getPasswordAndSaltSQLRequest = `SELECT password, salt, id FROM users WHERE username=$1;`;

`SELECT password FROM user WHERE password=sha256($2 || salt)`;

`SELECT password FROM user from 
(SELECT salt FROM user WHERE username=$1) 
as salt
WHERE password=sha256($2 || salt)`;

`SELECT sha256($1 || salt)=password FROM users WHERE username=$1`;

export const getUserInfoSQLRequest = `SELECT username, photo, id FROM users WHERE id=$1;`;

export const setMessageReadSQLRequest = `UPDATE messages SET status ='hasRead' WHERE chat_id=$1 AND author_id <> $2`;

export const updateMessageSQLRequest = `UPDATE messages SET txt=$4 WHERE chat_id=$1 AND author_id=$2 AND id=$3 RETURNING *`;
