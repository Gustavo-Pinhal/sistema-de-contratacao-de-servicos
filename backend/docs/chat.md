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
curl -k -X GET https://localhost/api/chat/1 \
     -H "Authorization: Bearer $TOKEN"
```

Troque o id da sala pelo id correto.

A resposta desta requisição será um json no formato

```json
{
     "id_sala": 1,
     "topico": "http://chat/com/sala/1",
     "mercure_token": JWT_GERADO_PELO_SYMFONY_PARA_O_MERCURE,
     "participantes": [
          {
               "nome": "fulano",
               "id":  "8be4df61-93ca-11d2-aa0d-00e098032b8c",
          }, 
          {
               "nome": "beltrano",
               "id":  "9be4df61-73ca-11e4-aa0d-00e098032baa",
          }
     ],
     "messages": [
          {
               "id": "060ab53c-0bb2-7482-8000-ab029e8fa2ea",
               "enviado_por": "8be4df61-93ca-11d2-aa0d-00e098032b8c",
               "tipo": "texto",
               "texto": "olá",
               "referencia": "060ab53d-0bb2-7482-8000-ab029e8fa2eb",
               "enviado_em": "04/11/2025 22:14"
          },
          {
               "id": "060ab53c-0bb2-7482-8000-ab029e8fa2bb",
               "enviado_por": "8be4df61-93ca-11d2-aa0d-00e098032b8c",
               "tipo": "audio",
               "arquivo": {
                    "id": "060ab53e-0bb2-7482-8000-ab029e8fa2ea",
                    "url": "url-assinada-pelo-service",
                    "mime_type": "xxx"
               },
               "enviado_em": "04/11/2025 22:14"
          }
     ]
}
```

onde `"tipo"` pode ser *texto*, *audio*, *foto* ou *vídeo*.

Mensagens com arquivo não possuem `"referencia"`.

### Conexão Mercure

Para abrir uma conexão com o mercury, utilize

```bash
curl -i -k -N \
     -H "Authorization: Bearer JWT_GERADO_PELO_SYMFONY_PARA_O_MERCURE" \
     "https://localhost/.well-known/mercure?topic=http://chat/com/sala/1"
```

substitua JWT_GERADO_PELO_SYMFONY_PARA_O_MERCURE pela chave retornada no campo `"mercure_token"` da requisição anterior.

substitua o tópico pelo tópico retornado na requisição anterior.

substitua também o id da sala

Note que o terminal ficou travado nesta requisição, isto pois está escutando continuamente o servidor de eventos.

### Enviar mensagem de texto

Abra um novo terminal

```bash
curl -k -X POST https://localhost/api/chat/1 \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"texto": "Olá, esta é uma mensagem de teste!", "responde": "060ab53d-0bb2-7482-8000-ab029e8fa2eb"}'
```

substitua o id da sala

a requisição responde com um json no seguinte formato

```json
{
     "id": "060ab53c-0bb2-7482-8000-ab029e8fa2ea",
     "enviado_por": "8be4df61-93ca-11d2-aa0d-00e098032b8c",
     "tipo": "texto",
     "texto": "olá",
     "referencia": "060ab53d-0bb2-7482-8000-ab029e8fa2eb",
     "enviado_em": "04/11/2025 22:14"
}
```

### Enviar mensagem com arquivo

Envie um arquivo com

```bash
curl -k -X POST "https://localhost/api/chat/1/upload" \
     -H "Authorization: Bearer $TOKEN" \
     -F "file=@/home/gustavo/Documentos/DSW/teste.jpeg"
```

a requisição responde com um json no seguinte formato

```json
{
     "id": "060ab53c-0bb2-7482-8000-ab029e8fa2bb",
     "enviado_por": "8be4df61-93ca-11d2-aa0d-00e098032b8c",
     "tipo": "audio",
     "arquivo": {
          "id": "060ab53e-0bb2-7482-8000-ab029e8fa2ea",
          "url": "URL_ASSINADA",
     },
     "referencia": "060ab53d-0bb2-7482-8000-ab029e8fa2eb",
     "enviado_em": "04/11/2025 22:14"
}
```

### Recuperar a mensagem

Recupere a imagem com

```bash
curl -o -k foto_baixada.jpg "URL_ASSINADA"
```
