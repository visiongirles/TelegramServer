SELECT DISTINCT ON (chat_info.chat_id) 
    messages.txt, 
    messages.id, 
    messages.status, 
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
        uc.user_id <> 1
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
            chat_id IN (SELECT chat_id FROM user_chats WHERE user_id = 1) 
            AND author_id <> 1 
            AND status = 'hasNotRead' 
        GROUP BY 
            chat_id
    ) AS unread_messages
ON 
    chat_info.chat_id = unread_messages.chat_id
ORDER BY 
    chat_info.chat_id, 
    messages.created_at DESC;