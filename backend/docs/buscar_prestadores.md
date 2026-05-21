## Buscar Prestadores

Retorna uma lista de prestadores ativos no sistema. É possível filtrar os resultados por uma profissão específica através dos parâmetros da URL. Caso nenhum filtro seja enviado, o endpoint retorna todos os prestadores cadastrados que estão ativos.

#### Listar todos os prestadores

```bash
curl -k -X GET https://localhost/api/busca
```

#### Filtrar por profissão

Para filtrar, envie o ID da profissão no parâmetro ´profissao´:

```bash
curl -k -X GET "https://localhost/api/busca?profissao=55"
```

A requisição responde com status code **Sucesso (200 OK)** e um array de objetos no seguinte formato:

```json
[
    {
        "usuario": { "id": "019e2140-3d13-7547-864e-05536c20bcf9" },
        "urlPerfil": "https://localhost/storage/app-public/perfis/019e2140-3d13-7547-864e-05536c20bcf9.jpg",
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
        "urlPerfil": "https://localhost/storage/app-public/perfis/019e2140-3d13-7547-864e-05536c20bcf2.jpg",
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
