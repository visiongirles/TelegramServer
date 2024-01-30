select m.id as message_id, m.txt, m.status, m.chat_id, u.username 
from messages as m 
left join users u on m.author_id = u.id
where m.chat_id = 1;

select m.id, m.txt, m.chat_id, m.status, m.created_at, u.username, u.photo 
    from 
    (
        select distinct on (chat_id) chat_id, id, author_id, txt, status, created_at
        from messages
        order by chat_id, created_at desc
    ) as m
    inner join chats c on c.id = m.chat_id
    inner join users u on c.owner_id = u.id;