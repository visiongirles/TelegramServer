

-- Внешний запрос начинается с SELECT distinct on (chat_info.chat_id). 
-- Это означает, что для каждого уникального значения chat_id в таблице chat_info мы выбираем только одну строку. 
-- При этом выбирается та строка, для которой значение chat_id является первым в порядке сортировки.

SELECT DISTINCT ON (chat_info.chat_id) 
messages.txt, 
messages.id, 
messages.status, 
messages.created_at, 
messages.author_id, 
chat_info.username, 
chat_info.chat_id, 
chat_info.photo

FROM  (
    select 
    u.username, 
    usr_chats.chat_id, 
    u.photo 
        from 
        users u 
        inner join 
            (select user_id, uc1.chat_id 
                from (
                    select chat_id from user_chats where user_id = $1
                    ) as uc1
                inner join user_chats uc2 on uc1.chat_id = uc2.chat_id 
                where uc2.user_id <> $1) as usr_chats
        on u.id = usr_chats.user_id
) as chat_info 
-- Внутренний запрос создает временную таблицу chat_info, 
-- которая содержит информацию о чатах, в которых пользователь участвует, но не является их создателем. 
-- Это достигается через внутреннее соединение (INNER JOIN) с таблицей user_chats, 
-- где выбираются записи, не принадлежащие пользователю, 
-- но соответствующие чатам, где пользователь участвует. 
-- В результате в chat_info включаются username, chat_id и photo для этих чатов.

LEFT JOIN messages ON messages.chat_id=chat_info.chat_id 
-- Внешний запрос объединяет временную таблицу chat_info с таблицей messages по chat_id с помощью LEFT JOIN. 
-- Это позволяет включить сообщения из чатов, в которых участвует пользователь.

ORDER BY chat_info.chat_id, messages.created_at DESC`;

-- Результат сортируется сначала по chat_info.chat_id в возрастающем порядке, а затем по messages.created_at в убывающем порядке. 
-- Это делается с помощью ORDER BY chat_info.chat_id, messages.created_at DESC.

-- В конечном результате каждый чат представлен только одной строкой (из-за DISTINCT ON (chat_info.chat_id)), 
-- и для каждого чата выбрано одно сообщение с наибольшей датой created_at.


--  я бы переписал в виде select (<subselect for unread count>), (<subselect for last message as json>) from chats where chats.id in (<user's chats>)

-- (<subselect for unread count>)
 `SELECT COUNT(*) FROM messages WHERE chat_id=$1 AND author_id <>$2 AND status='hasNotRead';`;

 SELECT chats.id, (
    SELECT COUNT(*) FROM messages WHERE chat_id=chats.id AND author_id <>$1 AND status='hasNotRead'
 ) AS unread_count FROM chats ;
