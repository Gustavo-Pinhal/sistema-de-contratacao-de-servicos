## Listar Prestadores Vinculados

Retorna a lista de prestadores atualmente vinculados e ativos na empresa autenticada.

```bash
curl -k -X GET https://localhost/api/empresarial/prestador \
     -H "Authorization: Bearer $TOKEN"
```

A requisição responde com um array de objetos no seguinte formato:

```json
[
    {
        "id": "019e3aba-1ee4-7627-98ad-d7233540c340",
        "nome": "João Silva",
        "premium": true
    }
]
```

## Criar e Vincular Prestador

Cadastra um novo usuário, cria seu perfil de prestador e o vincula diretamente à empresa autenticada.

```bash
curl -k -X POST https://localhost/api/empresarial/prestador/criar \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "prestador@exemplo.com",
       "nome": "Carlos Henrique",
       "senha": "SenhaSegura123",
       "profissao": 1,
       "cep": "01001000"
     }'
```

## Respostas possíveis:

- **Sucesso (200 OK):** Operação realizada com sucesso. `{"success": true}`.

- **Conflito (409 Conflict):** Quando o e-mail informado já está cadastrado no sistema.

- **Erro de Validação (400 Bad Request):** Quando a profissão informada não existe ou o CEP é inválido.

## Convidar Prestador Existente

Dispara uma notificação interna de convite para filiação de um prestador que já possui cadastro ativo no sistema.

```bash
curl -k -X POST https://localhost/api/empresarial/prestador/convidar \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"email": "prestador.existente@exemplo.com"}'
```

#### Respostas possíveis:

- **Sucesso (200 OK):** Convite gerado e enviado com sucesso. `{"success": true}`.

- **Proibido (403 Forbidden):** A conta empresarial autenticada está excluída.

- **Não Encontrado (404 Not Found):** Nenhum usuário foi localizado com o e-mail informado.

- **Requisição Inválida (400 Bad Request):** O usuário foi encontrado, mas não possui um perfil ativo de prestador.

- **Conflito (409 Conflict):** O prestador já possui um vínculo ativo com outra empresa no sistema.

## Desfiliar Prestador

Remove o vínculo existente entre a empresa autenticada e o prestador especificado via exclusão lógica (soft delete).

```bash
curl -k -X POST https://localhost/api/empresarial/prestador/desfiliar \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"prestadorId": "019e3aba-1ee4-7627-98ad-d7233540c340"}'
```

#### Respostas possíveis:

- **Sucesso (200 OK):** Desfiliação concluída com sucesso. `{"success": true}`.

- **Não Encontrado (404 Not Found):** O vínculo não existe, já foi desfeito anteriormente, ou o prestador pertence a outra corporação.

## Listar Convites Pendentes

Retorna todas as notificações de convites enviadas pela empresa autenticada que ainda não foram visualizadas pelos respectivos prestadores de serviço.

```bash
curl -k -X GET https://localhost/api/empresarial/prestador/pendentes \
     -H "Authorization: Bearer $TOKEN"
```

#### Respostas possíveis:

- **Sucesso (200 OK):** Retorna um array de objetos contendo os detalhes do convite e os dados básicos do destinatário que ainda não visualizou a mensagem.

Exemplo de resposta:

```json
[
    {
        "id": "019e3aba-1ee4-7627-98ad-d7233540c340",
        "destinatario": {
            "id": "019e3aba-1ee4-7627-98ad-d7233540c345",
            "nome": "Carlos Henrique",
            "email": "prestador@exemplo.com"
        },
        "criadoEm": "2026-05-20T21:44:54-04:00"
    }
]
```
