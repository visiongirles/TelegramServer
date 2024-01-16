

INSERT INTO users (username, status, photo) VALUES ('Kate', 1, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/RedCat_8727.jpg/800px-RedCat_8727.jpg');
INSERT INTO users (username, status, photo) VALUES ('Сутулая собака', 1, 'https://gameguru.ru/clf/44/04/c0/01/news.1610973258596.jpg');
INSERT INTO users (username, status, photo) VALUES ('Капитан Чеснок', 0, 'https://sun9-58.userapi.com/impf/c845524/v845524992/117955/E_B_jAs7RdI.jpg?size=901x911&quality=96&sign=574945e12af151018fa1c6e4372df78e&type=album');


INSERT INTO chats (owner_id) VALUES (2);
INSERT INTO chats (owner_id) VALUES (3);


DELETE FROM messages;
INSERT INTO messages (chat_id, date, author_id, message, status) VALUES (1, 1702033343, 2, 'Привет, любители мурлыкающих созданий! Как ваш кот сегодня?', 2);
INSERT INTO messages (chat_id, date, author_id, message, status) VALUES (1, 1703033343, 1, 'Мой кот вчера залез на верхнюю полку и теперь не может спуститься. Стоит ли мне купить ему карту?', 2);
INSERT INTO messages (chat_id, date, author_id, message, status) VALUES (2, 1700033343, 3, 'Капитан, я потерял свой трезубец. Возможно, он прячется в пучине моего пальто.', 2);
INSERT INTO messages (chat_id, date, author_id, message, status) VALUES (2, 1703033343, 1, 'Трезубец в пальто?! Какой чудной путь выбрал он для своих приключений!', 0);
