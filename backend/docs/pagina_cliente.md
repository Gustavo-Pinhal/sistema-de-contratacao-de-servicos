## Listar Meus Serviços (Cliente)

Retorna uma lista de todos os serviços e orçamentos vinculados ao cliente autenticado. A listagem é ordenada de forma decrescente pela data de início (mais recentes primeiro).

```bash
curl -k -X GET https://localhost/api/cliente/servicos \
     -H "Authorization: Bearer $TOKEN"
```

Para filtrar e retornar apenas os serviços **ativos** (aqueles que ainda não possuem uma data de encerramento definida):

```bash
curl -k -X GET "https://localhost/api/cliente/servicos?apenasAtivos=true" \
     -H "Authorization: Bearer $TOKEN"
```

A requisição responde com um array de objetos no seguinte formato:

```json
[
    {
        "id": "019e21b5-7395-7b2b-810e-fbce049cb295",
        "prestador": {
            "id": "019e2140-37ff-7018-a7d5-73fca936f836",
            "nome": "André Oliveira"
        },
        "endereco": "Rua das Flores, 123 - Centro",
        "data": "13/05/2026",
        "status": "Orçamento"
    }
]
```

#### Respostas possíveis:

- **Sucesso (200 OK):** Retorna a lista de serviços. Caso o cliente não possua registros, retorna um array vazio `[]`.

- **Não Autorizado (401 Unauthorized):** Quando o token JWT é inválido ou ausente.

- **Acesso Negado (403 Forbidden):** Quando o usuário autenticado não possui a role `ROLE_CLIENTE`.
