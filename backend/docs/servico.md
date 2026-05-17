## Obter Detalhes do Serviço

Retorna as informações completas de um serviço específico, incluindo seus agendamentos, orçamentos e valor total. O acesso é restrito aos participantes do serviço (cliente e prestador).

```bash
curl -k -X GET https://localhost/api/servico/019e134d-e21c-78a0-a004-a772f82b114a \
     -H "Authorization: Bearer $TOKEN"
```

A requisição responde com um objeto contendo os detalhes do serviço no seguinte formato.

```json
{
    "servico": {
        "id": "019e134d-e21c-78a0-a004-a772f82b114a",
        "prestador": {
            "id": "019e128a-0756-7c01-9a7e-f15f2be59ed7",
            "nome": "Carlos Silva",
            "nomeComercial": "Carlos Eletricista"
        },
        "endereco": "28 out, 123 - Mirassol",
        "data": "17/05/2026",
        "status": "Ativo",
        "cliente": {
            "id": "019e128a-09c5-7c17-a15c-1bfb45382083",
            "nome": "João Santos"
        },
        "enderecoCompleto": {
            "id": "019e1290-1a2b-7c3d-a4e5-f67890123456",
            "endereco": "Rua das Flores, 123 - Mirassol",
            "cep": "14801-100",
            "municipio": "Araraquara"
        }
    },
    "agendamentos": [
        {
            "id": "019e1234-e21c-78a0-a004-a772f82b114b",
            "criadoEm": "2026-05-20 09:00",
            "data": "20/05/2026 às 09:00",
            "status": "confirmado"
        },
        {
            "id": "019e1234-e21c-78a0-a004-a772f82b114c",
            "criadoEm": "2026-05-25 14:30",
            "data": "25/05/2026 às 14:30",
            "status": "proposta"
        }
    ],
    "orcamentos": [
        {
            "criadoEm": "2026-05-15 10:30",
            "valor": 450.0,
            "observacoes": "Instalação de luminárias"
        },
        {
            "criadoEm": "2026-05-16 11:00",
            "valor": 300.0,
            "observacoes": "Serviço de mão de obra"
        }
    ],
    "total": 750.0
}
```

#### Respostas possíveis:

- **Sucesso (200 OK):** Retorna os detalhes completos do serviço com agendamentos, orçamentos e valor total.

- **Não Encontrado (404 Not Found):** Se o ID do serviço informado não existir.

- **Acesso Negado (403 Forbidden):** Se o usuário autenticado não for o cliente nem o prestador deste serviço.
