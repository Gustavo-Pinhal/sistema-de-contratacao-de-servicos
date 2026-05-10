## Ler mensagens

```bash
curl -k https://localhost/api/servico/019e134d-e21c-78a0-a004-a772f82b114a/chat \
-H "Authorization: Bearer $TOKEN"
```

onde o uuid pertence ao serviço.

resposta:

```json
{
    "idServico": "019e134d-e21c-78a0-a004-a772f82b114a",
    "mercureToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL21hcmlkb2RlYWx1Z3VlbC5jb20iLCJzdWIiOiIwMTllMTI4YS0wOWM1LTdjMTctYTE1Yy0xYmZiNDUzODIwODMiLCJpYXQiOjE3Nzg0NDU0NjkuNzE3MjQsImV4cCI6MTc3ODUzMTg2OS43MTcyNCwibWVyY3VyZSI6eyJzdWJzY3JpYmUiOlsiaHR0cHM6Ly9tYXJpZG9kZWFsdWd1ZWwuY29tL2NoYXQvc2FsYS80Il19fQ.UnzM715X5rcd-PU7aekzg2KB0QM2B3U3YLY6Nuh8R4k",
    "topico": "http://chat/com/servico/019e134d-e21c-78a0-a004-a772f82b114a",
    "participantes": {
        "cliente": {
            "id": "019e128a-09c5-7c17-a15c-1bfb45382083",
            "nome": "Usu\u00e1rio Cliente"
        },
        "prestador": {
            "id": "019e128a-0756-7c01-9a7e-f15f2be59ed7",
            "nome": "Prestador Comum"
        }
    },
    "messagens": [
        {
            "id": "019e136c-afa9-7aaa-9a4f-4aaddf5ae418",
            "enviado_por": "019e128a-09c5-7c17-a15c-1bfb45382083",
            "tipo": "foto",
            "texto": null,
            "referencia": "",
            "arquivo": {
                "id": "019e136c-afa9-7aaa-9a4f-4aaddf5ae418",
                "url": "https://localhost/storage/app-private/chats/019e136c-afa9-7aaa-9a4f-4aaddf5ae418.jpg?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=any%2F20260510%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260510T203749Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1200&X-Amz-Signature=414cd03a878b1057bb17948f6cdeff32222b5677a2287df2de49086222d12cd6",
                "mime_type": "image/jpeg"
            },
            "enviado_em": "10/05/2026 \u00e050 19:45"
        },
        {
            "id": "019e134d-e21c-7934-a004-a772f878f09c",
            "enviado_por": "019e128a-09c5-7c17-a15c-1bfb45382083",
            "tipo": "text",
            "texto": null,
            "referencia": "",
            "arquivo": null,
            "enviado_em": "10/05/2026 \u00e011 19:12"
        }
    ]
}
```

## Conexão com o mercure

Para abrir uma conexão com o mercury, utilize

```bash
curl -i -k -N \
     -H "Authorization: Bearer JWT_GERADO_PELO_SYMFONY_PARA_O_MERCURE" \
     "https://localhost/.well-known/mercure?topic=TOPICO_DO_MERCURE"
```

substitua JWT_GERADO_PELO_SYMFONY_PARA_O_MERCURE pela chave retornada no campo `"mercure_token"` da requisição anterior.

substitua o tópico pelo tópico retornado na resposta anterior.

substitua TOPICO_DO_MERCURE pelo topico da resposta anterior.

## Enviar mensagem

```bash
curl -k -X POST https://localhost/api/servico/019e134d-e21c-78a0-a004-a772f82b114a/chat \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{"texto":"Olá","referencia":"019e134d-e21c-7934-a004-a772f878f09c"}'
```

Responde com status 201

```json
{ "status": "success" }
```

O usuário que estiver com a conexão aberta no mercure receberá o seguinte json

```json
{
    "id": "019e13d1-f209-7a0e-90b1-2c7b279cece2",
    "enviado_por": "019e128a-0756-7c01-9a7e-f15f2be59ed7",
    "tipo": "texto",
    "texto": "Ol\u00e1",
    "referencia": "",
    "arquivo": null,
    "enviado_em": "10\/05\/2026 \u00e026 21:36"
}
```

## Upload de imagens:

Upload de imagem gera uma mensagem nova.

A requisição segue o seguinte formato:

```bash
curl -k -X POST https://localhost/api/servico/019e134d-e21c-78a0-a004-a772f82b114a/chat/upload \
-H "Authorization: Bearer $TOKEN" \
-F "file=@/home/gustavo/Documentos/DSW/teste.jpeg"
```

Responde com status 201

```json
{ "status": "success" }
```

O usuário que estiver conectado ao mercure receberá o seguinte json

```json
{
    "id": "019e13d6-6c83-73f1-ae76-023b31753b8a",
    "enviado_por": "019e128a-0756-7c01-9a7e-f15f2be59ed7",
    "tipo": "foto",
    "texto": null,
    "referencia": "",
    "arquivo": {
        "id": "019e13d6-6c83-73f1-ae76-023b31753b8a",
        "url": "https://localhost/storage/app-private/chats/019e13d6-6c83-73f1-ae76-023b31753b8a.jpg?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=any%2F20260510%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260510T214120Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1200&X-Amz-Signature=0ac80a62d6ea784ade035fd7d3e3a34707b20d58f66f5dbd14eb43cfc800f331",
        "mime_type": "image/jpeg"
    },
    "enviado_em": "10/05/2026 \u00e020 21:41"
}
```
