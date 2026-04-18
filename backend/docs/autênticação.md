### Autenticar usuário

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/login_check \
  -H "Content-Type: application/json" \
  -d '{"username":"teste@exemplo.com", "password":"123456"}' | jq -r .token)
```

Esta requisição salva o JWT ta variável `TOKEN` no terminal aberto 

### Usar token nas requisições

Este exemplo mostra como utilizar o JWT para autenticar as requisições:

```bash
curl -X GET http://localhost:8080/api/admin/cadastro/profissoes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```
