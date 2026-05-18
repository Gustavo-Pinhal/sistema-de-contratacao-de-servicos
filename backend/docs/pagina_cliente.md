## Listar Meus Serviços (Cliente)

Retorna uma lista de todos os serviços e orçamentos vinculados ao cliente autenticado. A listagem é ordenada de forma decrescente pela data de início (mais recentes primeiro).

```bash
curl -k -X GET https://localhost/api/cliente/servicos \
     -H "Authorization: Bearer $TOKEN"
```

A requisição responde com um array de objetos no seguinte formato:

```json
[
    {
        "id": "019e21b5-7395-7b2b-810e-fbce049cb295",
        "prestador": {
            "id": "019e2140-37ff-7018-a7d5-73fca936f836",
            "nome": "André Oliveira",
            "nomeComercial": "Andr\u00e9 Oliveira"
        },
        "endereco": "Rua das Flores, 123 - Centro",
        "data": "13/05/2026",
        "status": "Orçamento",
        "encerradoEm": null
    },
    {
        "id": "019e39a4-0b14-763e-80a1-bec1699cc602",
        "prestador": {
            "id": "019e37ce-0bca-7498-8ce2-b43affbd787e",
            "nome": "Andr\u00e9 Oliveira",
            "nomeComercial": "Andr\u00e9 Oliveira"
        },
        "endereco": "28 out, 12 - ",
        "data": "18\/05\/2026",
        "status": "Finalizado",
        "encerradoEm": "2026-05-18T05:06:56+00:00"
    },
    {
        "id": "019e3990-7684-71c7-96d0-23cdc62697d6",
        "prestador": {
            "id": "019e37ce-0bca-7498-8ce2-b43affbd787e",
            "nome": "Andr\u00e9 Oliveira",
            "nomeComercial": "Andr\u00e9 Oliveira"
        },
        "endereco": "28 out, 12 - ",
        "data": "18\/05\/2026",
        "status": "Finalizado",
        "encerradoEm": "2026-05-18T05:06:56+00:00"
    }
]
```

#### Respostas possíveis:

- **Sucesso (200 OK):** Retorna a lista de serviços. Caso o cliente não possua registros, retorna um array vazio `[]`.

- **Não Autorizado (401 Unauthorized):** Quando o token JWT é inválido ou ausente.

- **Acesso Negado (403 Forbidden):** Quando o usuário autenticado não possui a role `ROLE_CLIENTE`.
