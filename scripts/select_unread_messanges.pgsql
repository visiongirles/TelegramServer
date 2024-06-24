SELECT chat_id,
       Count(*) AS unread_message_count
FROM   messages
WHERE  chat_id = 1
       AND author_id <> 1
       AND status = 'hasNotRead'
GROUP  BY chat_id; 