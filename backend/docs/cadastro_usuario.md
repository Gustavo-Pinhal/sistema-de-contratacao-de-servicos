## Cadastrar Cliente

Este endpoint permite o registro de um novo usuário com o perfil de Cliente no sistema.

```bash
curl -k -X POST https://localhost/api/cadastro-usuario/cliente \
     -H "Content-Type: application/json" \
     -d '{
        "nome": "João Silva",
        "email": "joao@email.com",
        "telefone": "11999999999",
        "senha": "password123"
     }'
```

#### Respostas possíveis:

- **Sucesso (200 OK):** O usuário e o perfil de cliente foram criados com sucesso.

```json
{
    "success": true
}
```

- **Erro de Validação (422 Unprocessable Content):** Retornado quando os dados enviados não atendem às restrições (ex: e-mail inválido ou nome muito curto).

```json
{
    "title": "Validation Failed",
    "status": 422,
    "detail": "nome: This value is too short. It should have 3 characters or more.",
    "violations": [
        {
            "propertyPath": "nome",
            "title": "This value is too short. It should have 3 characters or more.",
            "template": "This value is too short. It should have {{ limit }} characters or more.",
            "parameters": {
                "{{ limit }}": "3"
            },
            "type": "urn:uuid:9ff3fdc4-b214-49db-868d-40cdec664fb2"
        }
    ]
}
```

- **Conflito (409 Conflict):** Retornado quando o e-mail informado já está cadastrado no sistema.

```json
{
    "message": "O usuário com e-mail joao@email.com já existe."
}
```

## Cadastrar Prestador

Este endpoint permite o registro de um novo usuário com o perfil de Prestador, vinculando-o a uma profissão e a um CEP.

```json
curl -k -X POST https://localhost/api/cadastro-usuario/prestador \
     -H "Content-Type: application/json" \
     -d '{
        "nome": "Carlos Marceneiro",
        "email": "carlos@prestador.com",
        "telefone": "11988887777",
        "profissao": 1,
        "cep": "01001000",
        "senha": "securepassword"
     }'
```

#### Repostas possíveis

- **Sucesso (200 OK):** O usuário e o perfil de prestador foram criados com sucesso.

```json
{
    "success": true
}
```

- **Profissão Não Encontrada (400 Bad Request):** Quando o ID da profissão enviado no campo profissao não existe no banco de dados.

```json
{
    "message": "Erro de validação",
    "errors": {
        "profissao": "A profissão informada não existe."
    }
}
```

- **Cep Inválido (400 Bad Request):** Quando o valor enviado no campo cep não existe.

```json
{
    "message": "Erro de validação",
    "errors": {
        "cep": "CEP inválido."
    }
}
```

- **Erro de Validação (422 Unprocessable Content):** Quando campos obrigatórios estão ausentes ou o formato do CEP é inválido (deve ter 8 dígitos numéricos).

```json
{
    "title": "Validation Failed",
    "status": 422,
    "detail": "cep: This value should have exactly 8 characters.",
    "violations": [ { ... } ]
}
```

- **Conflito (409 Conflict):** Retornado quando o e-mail informado já está em uso por outro usuário.

```
{
    "message": "O usuário com e-mail carlos@prestador.com já existe."
}
```
