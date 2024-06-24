
SELECT user_info.username,
       user_info.photo,
       user_info.chat_id,
       unread_message.unread_message_count
FROM   (SELECT users.username,
               chat_info.chat_id,
               users.photo
        FROM   users
               INNER JOIN (SELECT user_id,
                                  our_chats.chat_id
                           FROM   (SELECT chat_id
                                   FROM   user_chats
                                   WHERE  user_id = 1) AS our_chats
                                  INNER JOIN user_chats
                                          ON our_chats.chat_id =
                                             user_chats.chat_id
                           WHERE  user_chats.user_id <> 1) AS chat_info
                       ON users.id = chat_info.user_id) AS user_info
       LEFT JOIN (SELECT chat_id,
                         Count(*) AS unread_message_count
                  FROM   messages
                  WHERE  author_id <> 1
                         AND status = 'hasNotRead'
                  GROUP  BY chat_id) AS unread_message
              ON user_info.chat_id = unread_message.chat_id; 