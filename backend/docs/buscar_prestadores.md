## Buscar Prestadores

Retorna uma lista de prestadores ativos no sistema. É possível filtrar os resultados por uma profissão específica através dos parâmetros da URL. Caso nenhum filtro seja enviado, o endpoint retorna todos os prestadores cadastrados que estão ativos.

#### Listar todos os prestadores

```bash
curl -k -X GET https://localhost/api/prestadores/buscar \
     -H "Authorization: Bearer $TOKEN"
```

#### Filtrar por profissão

Para filtrar, envie o ID da profissão no parâmetro ´profissao´:

```bash
curl -k -X GET "https://localhost/api/prestadores/buscar?profissao=55" \
     -H "Authorization: Bearer $TOKEN"
```

A requisição responde com um array de objetos no seguinte formato:

```json
[
    {
        "usuario": { "id": "019e2140-3d13-7547-864e-05536c20bcf9" },
        "nome": "João Augusto",
        "profissoes": [
            {
                "id": 55,
                "descricao": "Eletricista"
            }
        ]
    },
    {
        "usuario": { "id": "019e2140-3d13-7547-864e-05536c20bcf2" },
        "nome": "Lucas Mendes",
        "profissoes": [
            {
                "id": 55,
                "descricao": "Eletricista"
            }
        ]
    }
]
```

#### Respostas possíveis:

- **Sucesso (200 OK):** Retorna a lista de prestadores (pode ser um array vazio [] caso nenhum prestador atenda ao critério).

- **Não Autorizado (401 Unauthorized):** Quando o token JWT é inválido ou não foi enviado.
