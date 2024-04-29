 SELECT chats.id, (
    SELECT COUNT(*) FROM messages WHERE chat_id=chats.id AND author_id <>1 AND status='hasNotRead'
 ) AS unread_count,
 
 
  FROM chats ;