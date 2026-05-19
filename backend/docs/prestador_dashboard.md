## Visualizar Dashboard do Prestador

Retorna o fluxo de trabalho e o histórico de serviços do prestador autenticado, agrupados em abas operacionais (Ativos, Pendentes, Concluídos e Cancelados). Este endpoint consolida informações sobre clientes, status de faturamento, dados de localização e se o serviço prestado já foi transformado em um projeto publicado no portfólio profissional. O acesso é restrito a prestadores homologados (`ROLE_PRESTADOR`).

```bash
curl -k -X GET https://localhost/api/areaprestador/dashboard \
     -H "Authorization: Bearer $TOKEN"
```

A requisição responde com um objeto contendo coleções divididas pelo estado operacional dos serviços no seguinte formato:

```json
{
    "ativos": [],
    "pendentes": [
        {
            "id": "019e3dc0-99d0-7152-81cb-fcf31936e08a",
            "prestador": {
                "id": "019e3aba-1ee4-7627-98ad-d7233540c340",
                "nome": "André Oliveira",
                "nomeComercial": "André Oliveira"
            },
            "endereco": "28 d out, 12 - ",
            "data": "19/05/2026",
            "status": "Orçamento",
            "encerradoEm": null,
            "avaliacao": null,
            "cliente": {
                "id": "019e3aba-275e-7d12-86e7-21148dd4aa4e",
                "nome": "Usuário Cliente"
            },
            "enderecoCompleto": {
                "id": "019e3aba-c875-74fc-a35a-ea4267865bb3",
                "endereco": "28 d out, 12 - ",
                "cep": "78280000 ",
                "municipio": "Mirassol D'Oeste"
            },
            "projeto": false
        }
    ],
    "concluidos": [
        {
            "id": "019e3ad1-2422-7667-9923-d3291b3af9bc",
            "prestador": {
                "id": "019e3aba-1ee4-7627-98ad-d7233540c340",
                "nome": "André Oliveira",
                "nomeComercial": "André Oliveira"
            },
            "endereco": "28 d out, 12 - ",
            "data": "18/05/2026",
            "status": "Finalizado",
            "encerradoEm": "2026-05-18T11:29:15+00:00",
            "avaliacao": {
                "nota": 10.0,
                "data": "2026-05-18T11:29:38+00:00"
            },
            "cliente": {
                "id": "019e3aba-275e-7d12-86e7-21148dd4aa4e",
                "nome": "Usuário Cliente"
            },
            "enderecoCompleto": {
                "id": "019e3aba-c875-74fc-a35a-ea4267865bb3",
                "endereco": "28 d out, 12 - ",
                "cep": "78280000 ",
                "municipio": "Mirassol D'Oeste"
            },
            "projeto": true
        }
    ],
    "cancelados": []
}
```

#### Regras de Negócio Importantes:

- **Omissão de Serviços Expirados:** Serviços que atingiram o tempo limite sem interação assumem o estado interno de expirados e são totalmente omitidos do dashboard, não constando em nenhuma das chaves de retorno.

- **Indicador de Portfólio (`projeto`):** O campo `projeto` retorna como `true` exclusivamente na aba de concluídos se o prestador já tiver utilizado o histórico daquele serviço específico para gerar e publicar um caso de sucesso em seu portfólio. Caso contrário, permanece como `false`.

- **Avaliações Residuais:** O nó `avaliacao` conterá a nota dada pelo cliente e o respectivo timestamp da ação. O nó constará como `null` caso o serviço não pertença à aba de concluídos ou ainda não tenha recebido uma nota do cliente.

#### Respostas possíveis:

- **Sucesso (200 OK):** Retorna as listas de serviços segmentadas nas quatro chaves do dashboard operacionais do prestador autenticado.

- **Acesso Negado (403 Forbidden):** Caso o token de autenticação enviado esteja ausente ou pertença a um usuário que não possua perfil ou papel de prestador cadastrado no ecossistema.
