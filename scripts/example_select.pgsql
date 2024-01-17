select m.id as message_id, m.message, m.status, m.chat_id, u.username 
from messages as m 
left join users u on m.author_id = u.id
where m.chat_id = 1;

select m.id, m.txt, m.chat_id, m.status, m.date, u.username, u.photo 
    from 
    (
        select distinct on (chat_id) chat_id, id, author_id, txt, status, date
        from messages
        order by chat_id, date desc
    ) as m
    inner join chats c on c.id = m.chat_id
    inner join users u on c.owner_id = u.id;