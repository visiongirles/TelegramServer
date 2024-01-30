-- INSERT INTO messages (chat_id, created_at, author_id, txt, status) 
--         VALUES (1, 1706540225, author_id, 'ЭТО ТЕСТ', 0)
--         SELECT u.id AS author_id FROM users AS u 
--         JOIN messages m ON u.id = m.author_id
--         WHERE u.username = 'Сутулая собака';

  



-- INSERT INTO messages (chat_id, created_at, author_id, txt, status) 
-- 	SELECT ${chat_id}, ${created_at}, id FROM users WHERE username = ${username}, , ${txt}, ${status};

INSERT INTO messages (chat_id, created_at, txt, status, author_id) 
	SELECT 1, 1706540225, 'ЭТО ТЕСТ', 0, id FROM users WHERE username = 'Сутулая собака';