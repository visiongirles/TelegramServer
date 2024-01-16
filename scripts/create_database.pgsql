CREATE DATABASE telegram;


CREATE TABLE users (
    id        BIGSERIAL PRIMARY KEY,
    username  varchar(64) NOT NULL,
    status    varchar(64)  NOT NULL,
    photo     varchar(256)
);

CREATE TABLE chats (
    id        BIGSERIAL PRIMARY KEY,
    owner_id  BIGINT NOT NULL references users(id)
);

CREATE TABLE messages (
    id        BIGSERIAL PRIMARY KEY,
    chat_id   BIGINT references chats(id),
    date      BIGINT NOT NULL,
    author_id BIGINT NOT NULL references users(id),
    message   text,
    status    varchar(64) 
);