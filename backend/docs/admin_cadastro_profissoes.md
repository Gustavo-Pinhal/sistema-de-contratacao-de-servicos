## Listar Profissões

Retorna uma lista de profissões cadastradas. Por padrão, retorna apenas as profissões ativas.

```bash
curl -k -X GET https://localhost/api/admin/cadastro/profissoes \
     -H "Authorization: Bearer $TOKEN"
```

Para listar as profissões que foram excluídas (soft delete):

```bash
curl -k -X GET "https://localhost/api/admin/cadastro/profissoes?excluidos=true" \
     -H "Authorization: Bearer $TOKEN"
```

A requisição responde com um array de objetos no seguinte formato:

```json
[
    {
        "id": 1,
        "descricao": "Desenvolvedor PHP",
        "criadoEm": "2026-05-09T13:00:00+00:00",
        "excluidoEm": null
    }
]
```

## Criar Nova Profissão

Cadastra uma nova profissão no sistema. A descrição deve ser única.

```bash
curl -k -X POST https://localhost/api/admin/cadastro/profissoes \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"descricao": "Eletricista"}'
```

#### Respostas possíveis:

- Sucesso (201 Created): Retorna o objeto criado.

- Erro de Validação (422 Unprocessable Content): Quando a descrição está vazia ou excede 60 caracteres.

- Conflito (409 Conflict): Quando a descrição informada já existe no banco de dados.

Exemplo de resposta de erro (409):

```json
{
    "message": "Erro de validação",
    "errors": {
        "descricao": "Já existe uma profissão cadastrada com esta descrição."
    }
}
```

## Atualizar Profissão

Altera a descrição de uma profissão existente através do ID.

```bash
curl -k -X PUT https://localhost/api/admin/cadastro/profissoes/1 \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"descricao": "Eletricista Industrial"}'
```

#### Respostas possíveis:

- Sucesso (200 OK): Retorna o objeto atualizado.

- Não Encontrado (404 Not Found): Se o ID informado não existir.

- Conflito (409 Conflict): Se a nova descrição já estiver em uso por outra profissão.

## Restaurar Profissão:

Remove a data de exclusão de uma profissão, tornando-a ativa novamente.

```bash
curl -k -X POST https://localhost/api/admin/cadastro/profissoes/1/restaurar \
     -H "Authorization: Bearer $TOKEN"
```

#### Respostas possíveis:

- Sucesso (200 OK): Retorna o objeto restaurado (`excluidoEm` será `null`).

- Não Encontrado (404 Not Found): Se o ID informado não existir.

## Excluir Profissão (Soft Delete)

Marca uma profissão como excluída definindo a data atual no campo `excluidoEm`.

```bash
curl -k -X DELETE https://localhost/api/admin/cadastro/profissoes/1 \
     -H "Authorization: Bearer $TOKEN"
```

#### Respostas possíveis:

- Sucesso (204 No Content): A operação foi realizada com sucesso (corpo vazio).

- Não Encontrado (404 Not Found): Se o ID informado não existir.
