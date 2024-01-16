select m.id as message_id, m.message, m.status, m.chat_id as chat_id, u.username as username 
from messages as m 
left join users u on m.author_id = u.id
where m.chat_id = 1;

select m.id, m.message, chat_id, u.username 
from 
(
    select distinct on (chat_id) chat_id, id, author_id, message
    from messages
    order by chat_id, date desc
) as m
left join users u on m.author_id = u.id;