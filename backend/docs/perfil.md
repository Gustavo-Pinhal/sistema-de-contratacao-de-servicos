## Obter Dados do Perfil (Prestador)

Retorna as informações atuais do perfil do prestador autenticado para preenchimento de formulários de edição.

```bash
curl -k -X GET https://localhost/api/prestador/perfil/editar \
     -H "Authorization: Bearer $TOKEN"
```

A requisição responde com um objeto no seguinte formato:

```json
{
    "urlPerfil": "https://cdn.exemplo.com/perfis/foto.jpg",
    "nome": "André Oliveira",
    "nomeProfissional": "André Oliveira Pro",
    "email": "andre.oliveira@exemplo.com",
    "profissoes": [55, 56],
    "cep": "78280000",
    "numero": ""
}
```

## Atualizar Dados do Perfil

Atualiza as informações textuais, localização e especialidades do prestador.

```bash
curl -k -X POST https://localhost/api/prestador/perfil/editar \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
        "nome": "André Oliveira",
        "nomeProfissional": "André Reparos",
        "cep": "78280000",
        "profissoes": [55]
     }'
```

#### Respostas possíveis:

- **Sucesso (200 OK):** Dados atualizados com sucesso.

- **Erro de Validação (422 Unprocessable Content):** Quando o nome ou CEP estão em branco, ou nenhuma profissão foi selecionada.

- **Não Encontrado (404 Not Found):** Se o registro de prestador não for localizado para o usuário atual.

Exemplo de erro de validação (422):

```bash
{
    "title": "Constraint Violation",
    "status": 422,
    "detail": "profissoes: Selecione ao menos uma profissão.",
    "violations": [
        {
            "propertyPath": "profissoes",
            "title": "Selecione ao menos uma profissão."
        }
    ]
}
```

## Atualizar Foto de Perfil

Realiza o upload ou substituição da imagem de perfil do prestador. Este endpoint aceita apenas dados no formato `multipart/form-data`.

```bash
curl -k -X POST https://localhost/api/prestador/perfil/foto \
     -H "Authorization: Bearer $TOKEN" \
     -F "perfil=@/caminho/para/sua/foto.jpg"
```

#### Respostas possíveis:

- **Sucesso (200 OK):** Retorna a confirmação e o caminho relativo do arquivo.

- **Erro de Requisição (400 Bad Request):** Quando o arquivo não é enviado ou o campo não se chama `perfil`.

- **Erro de Servidor (500 Internal Server Error):** Falha no processamento da imagem ou comunicação com o storage.

Exemplo de resposta de sucesso:

```json
{
    "message": "Foto de perfil atualizada com sucesso!",
    "url": "perfis/019e2140-37ff-7018-a7d5-73fca936f836.jpg"
}
```
