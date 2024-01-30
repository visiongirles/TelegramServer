-- DROP DATABASE IF EXISTS telegram;
-- CREATE DATABASE telegram;

DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS chats;
DROP TABLE IF EXISTS users;

create type user_status as enum (
  'Online',
  'Offline'
);


CREATE TABLE users (
    id        SERIAL PRIMARY KEY,
    username  varchar(64) NOT NULL,
    status    user_status NOT NULL,
    photo     varchar(256)
);

CREATE TABLE chats (
    id        SERIAL PRIMARY KEY,
    owner_id  INT references users(id)
);


create type message_status as enum (
  'hasRead',
  'hasNotRead'
);

CREATE TABLE messages (
    id        SERIAL PRIMARY KEY,
    chat_id   integer references chats(id),
    created_at TIMESTAMP NOT NULL,
    author_id integer references users(id),
    txt       text NOT NULL,
    status    message_status NOT NULL
);

