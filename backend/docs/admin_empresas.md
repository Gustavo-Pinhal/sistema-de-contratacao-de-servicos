## Listar Empresas

Retorna uma lista de empresas cadastradas no sistema que estão ativas.

```bash
curl -k -X GET https://localhost/api/admin/empresas \
     -H "Authorization: Bearer $TOKEN"
```

A requisição responde com um array de objetos no seguinte formato:

```json
[
    {
        "id": "019e3aba-1ee4-7627-98ad-d7233540c340",
        "nome": "Oficina Central LTDA",
        "email": "contato@oficinacentral.com",
        "criadoEm": "2026-05-20T19:50:00+00:00"
    }
]
```

## Criar Nova Empresa

Cadastra uma nova empresa no ecossistema. Este processo cria simultaneamente uma credencial de usuário vinculada ao e-mail fornecido. O endereço de e-mail deve ser único no sistema.

```bash
curl -k -X POST https://localhost/api/admin/empresas \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"nome": "Oficina Central LTDA", "email": "contato@oficinacentral.com", "senha": "senhaSegura123"}'
```

#### Respostas possíveis:

- **Sucesso (201 Created):** Retorna o objeto da empresa recém-criada.

```json
{
    "id": "019e3aba-1ee4-7627-98ad-d7233540c340",
    "nome": "Oficina Central LTDA",
    "email": "contato@oficinacentral.com",
    "criadoEm": "2026-05-20T19:52:00+00:00"
}
```

- **Erro de Validação (422 Unprocessable Content):** Quando as regras de tamanho ou formato dos campos não são atendidas (nome vazio/menor que 3 caracteres, e-mail inválido ou senha menor que 6 caracteres).

- **Conflito (409 Conflict):** Quando o e-mail informado já está em uso por outra conta no banco de dados.
