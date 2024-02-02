ALTER TABLE users
ALTER COLUMN id TYPE SERIAL PRIMARY KEY;

ALTER TABLE chats
ALTER COLUMN id TYPE SERIAL PRIMARY KEY,
ALTER COLUMN owner_id TYPE INT references users(id);



ALTER TABLE messages
ALTER COLUMN id TYPE SERIAL PRIMARY KEY,
ALTER COLUMN chat_id TYPE INT references chats(id),
ALTER COLUMN created_at TYPE TIMESTAMP NOT NULL,
ALTER COLUMN author_id TYPE BIGINT references users(id),
ALTER COLUMN status TYPE text NOT NULL

;





