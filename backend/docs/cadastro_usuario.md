```bash
curl -k -X POST https://localhost/api/cadastro-usuario/prestador -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"nome":"PedroPedreiro","email":"pedropedras@exemplo.com","profissao":3,"cep":"78280000","senha":"123456"}'
```
