-- DROP DATABASE IF EXISTS telegram;
-- CREATE DATABASE telegram;

DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS chats;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id        BIGSERIAL PRIMARY KEY,
    username  varchar(64) NOT NULL,
    status    integer NOT NULL,
    photo     varchar(256)
);

CREATE TABLE chats (
    id        BIGSERIAL PRIMARY KEY,
    owner_id  BIGINT references users(id)
);

CREATE TABLE messages (
    id        BIGSERIAL PRIMARY KEY,
    chat_id   BIGINT references chats(id),
    date      BIGINT NOT NULL,
    author_id BIGINT references users(id),
    txt       text NOT NULL,
    status    integer NOT NULL
);