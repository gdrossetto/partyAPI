create table category
(
    id serial primary key,
    nome varchar(300) unique
);

create table event
(
    id serial primary key,
    title varchar(100),
    details varchar(1000),
    subtitle varchar(500),
    event_date date,
    created_at date,
    category_id int references categoria (id),
    creator_id int references app_user(id),
    local_id int references local (id),
    price float,
    photo VARCHAR(1000)
);

create table app_user
(
    id serial primary key,
    user_name varchar(300),
    user_handle varchar(50) unique,
    email varchar(300) unique,
    birthday date,
    auth_token varchar(2000),
    photo varchar(1000),
    password varchar(1000),
);

create table presence
(
    user_id int references app_user(id),
    event_id int references event(id)
);

create table local
(
    id serial primary key,
    nome varchar(300),
    capacidade int,
    endereco varchar(1000),
    estado varchar(50),
    cidade varchar(100)
);

-- Select com nome do local

select e.* , l.nome
from event as e inner join local as l on p.local_id = l.id
order by e.title desc;