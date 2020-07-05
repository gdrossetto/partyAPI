create table categoria
(
    id serial primary key,
    nome varchar(300) unique
);

create table post
(
    id serial primary key,
    titulo varchar(100),
    descricao varchar(1000),
    resumo varchar(500),
    criado_em date,
    categoria_id int references categoria (id)
);


/* Para buscar todos os posts mostrando do mais novo para o mais antigo:  done*/
select *
from post
order by criado_em desc;

/* Para buscar todos os posts mostrando do mais antigo para o mais novo: done*/
select *
from post
order by criado_em asc;

/* Para buscar por categoria */
select p.* , c.nome
from post as p inner join categoria as c on p.categoria_id = c.id
where p.categoria_id = 4
order by criado_em desc;

/* Criar post done*/
insert into post
    (titulo,descricao,resumo,criado_em,categoria_id)
values
    ($1, $2, $3, $4 , $5);

/* Criar categoria done*/
insert into categoria
    (nome)
values
    ($1);

/* Listar categorias done*/
select *
from categorias
order by nome ASC;

/* Deletar post done*/
delete from post where id = $1;

/* Deletar categoria done*/
delete from categoria where id = $1;

/* Editar post done*/
update post set title = $1, descricao = $2, resumo = $3, categoria_id = $4 where id = $5;

/* Editar categoria done*/
update categoria set nome = $1 where id = $2;