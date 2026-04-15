### Pré requisitos

Para abrir um chat, é necessário ter primeiro uma **Sala** no banco.

```SQL
insert into servico.clientes (id, nome) values
((select id from auth.usuarios where email = 'teste@exemplo.com'), 'Jõao Cliente');

insert into servico.prestadores (id, nome) values
((select id from auth.usuarios where email = 'beto.carreiro@example.com'), 'Beto Carreiro');

insert into servico.servicos (id, id_cliente, id_prestador) values
(
	gen_random_uuid(),
	(select id from servico.clientes where nome = 'Jõao Cliente'),
	(select id from servico.prestadores where nome = 'Beto Carreiro')
);

insert into chat.sala (id_servico, id_cliente, id_prestador) values
(
	(select id from servico.servicos order by inicio desc limit 1),
	(select id from servico.clientes where nome = 'Jõao Cliente'),
	(select id from servico.prestadores where nome = 'Beto Carreiro')
);
```

Caso usuários não existam, utilize a cli `app:create-app-user`.

### Abrir chat

Com a sala criada, abra o chat com

```bash
curl -X GET http://localhost:8080/api/chat/sala/1 \
     -H "Authorization: Bearer $TOKEN"
```

### Conexão Mercure

Para abrir uma conexão com o mercury, utilize

```bash
curl -i -N \
     -H "Authorization: Bearer JWT_GERADO_PELO_SYMFONY_PARA_O_MERCURE" \
     "http://localhost:3000/.well-known/mercure?topic=http://chat/com/sala/1"
```

substitua JWT_GERADO_PELO_SYMFONY_PARA_O_MERCURE pela chave retornada no campo `"mercure_token"` da requisição anterior.

substitua também o id da sala

Note que o terminal ficou travado nesta requisição, isto pois está escutando continuamente o servidor de eventos.

### Enviar mensagem

Abra um novo terminal

```bash
curl -X POST http://localhost:8080/api/chat/sala/1 \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"conteudo": {"texto": "Olá, esta é uma mensagem de teste!"}}'
```

substitua o id da sala
