## Solicitar Orçamento

Realiza solicitação de orçamento para um prestador.

Para que a solicitação possa ser feita, o usuário _deve_ ser do tipo _cliente_.

```bash
curl -k -X POST https://localhost/api/prestadores/019e128a-0756-7c01-9a7e-f15f2be59ed7/solicitar \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{"descricao":"arruma umas calha","cep":"78280000","rua":"28 De Outubro","numero":"100","complemento":"2º andar"}'
```

Onde o uuid da url é o id do prestador.

Caso o usuário já possua um endereço cadastrado e queira reutiliza-lo, a requisição pode ser feita da seguinte forma:

```bash
curl -k -X POST https://localhost/api/prestadores/019e128a-0756-7c01-9a7e-f15f2be59ed7/solicitar \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{"descricao":"arruma umas calha","idEndereco":"019e12c7-5ca2-7ac3-8b8d-22361bacebe7"}'
```

A requisição responde com um json no seguinte formato:

```json
{
    "success": true,
    "idServico": "019e12c9-3d0d-703a-93b9-46914afcb219"
}
```

## Upload de imagens:

Imagens devem ter o upload feito apenas após a requisição anterior for concluída com sucesso.

A requisição segue o seguinte formato:

```bash
curl -k -X POST https://localhost/api/servico/019e134d-e21c-78a0-a004-a772f82b114a/chat/upload \
-H "Authorization: Bearer $TOKEN" \
-F "file=@/home/gustavo/Documentos/DSW/teste.jpeg"
```

Onde o uuid da url é o id do serviço.
