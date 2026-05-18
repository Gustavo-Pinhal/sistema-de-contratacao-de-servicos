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
        },
        "avaliacao": { "nota": 8.5, "data": "2026-05-18T11:00:58+00:00" }
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

o campo `servico.avaliacao` possui valor `nulo` caso o serviço não esteja finalizado ou ainda não possua avaliação.

#### Status de agendamento:

Um agendamento assumir os seguintes status:

- `proposta`

- `confirmado`

- `recusado`

#### Status do serviço

O serviço assumir os seguintes status:

- `Orçamento`

- `Ativo`

- `Finalizado`

- `Cancelado`

#### Respostas possíveis:

- **Sucesso (200 OK):** Retorna os detalhes completos do serviço com agendamentos, orçamentos e valor total.

- **Não Encontrado (404 Not Found):** Se o ID do serviço informado não existir.

- **Acesso Negado (403 Forbidden):** Se o usuário autenticado não for o cliente nem o prestador deste serviço.

## Criar Proposta de Agendamento

Envia uma nova proposta de data e hora para a realização do serviço. Esta ação é de uso exclusivo do Prestador vinculado ao respectivo serviço.

```bash
curl -k -X POST https://localhost/api/servico/019e134d-e21c-78a0-a004-a772f82b114a/agendamento \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
         "data": "2026-05-20T14:30:00Z",
         "observacoes": "Disponibilidade no período da tarde."
     }'
```

#### Regras de Payload:

- `data` (obrigatório): Deve ser uma string contendo uma estrutura de data e hora válida baseada no padrão ISO 8601 (Ex: `YYYY-MM-DDTHH:mm:ssZ`). Não são aceitas datas retroativas (anteriores ao dia atual).

- `observacoes` (opcional): Texto com limite de no máximo 1000 caracteres.

#### Respostas possíveis:

- **Sucesso (200 OK):** `{"success": true}`.

- **Erro de Validação (422 Unprocessable Content):** Retornado quando a data está ausente, em formato inválido, no passado ou se as observações excederem 1000 caracteres.

- **Acesso Negado (403 Forbidden):** Se a tentativa de envio partir do Cliente do serviço.

## Confirmar Agendamento

Aprova uma proposta de agendamento em aberto recebida do Prestador. Esta ação é de uso exclusivo do Cliente do serviço.

```bash
curl -k -X POST https://localhost/api/servico/019e134d-e21c-78a0-a004-a772f82b114a/agendamento/019e1234-e21c-78a0-a004-a772f82b114c/confirmar \
     -H "Authorization: Bearer $TOKEN"
```

#### Respostas possíveis:

- **Sucesso (200 OK):** `{"success": true}`. O status interno da proposta é alterado para confirmado.

- **Acesso Negado (403 Forbidden):** Caso o usuário autenticado na requisição seja o prestador.

- **Não Encontrado (404 Not Found):** Caso o ID do serviço ou do agendamento informado não exista.

## Declinar Agendamento

Recusa uma proposta de agendamento em aberto recebida do Prestador. Esta ação é de uso exclusivo do Cliente do serviço.

```bash
curl -k -X POST https://localhost/api/servico/019e134d-e21c-78a0-a004-a772f82b114a/agendamento/019e1234-e21c-78a0-a004-a772f82b114c/declinar \
     -H "Authorization: Bearer $TOKEN"
```

#### Respostas possíveis:

- **Sucesso (200 OK):** `{"success": true}`. O status interno da proposta é alterado para recusado.

- **Acesso Negado (403 Forbidden):** Caso o usuário autenticado na requisição seja o cliente ou um terceiro.

- **Não Encontrado (404 Not Found):** Caso o ID do serviço ou do agendamento informado não exista.

## Adicionar Orçamento ou Desconto

Adiciona um novo lançamento financeiro (orçamento de custos ou concessão de desconto) ao serviço. Esta ação é de uso exclusivo do Prestador do serviço.

```bash
curl -k -X POST https://localhost/api/servico/019e134d-e21c-78a0-a004-a772f82b114a/orcamento \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
         "descricao": "Instalação de disjuntor adicional",
         "valor": 150.00,
         "observacoes": "Material incluso no valor."
     }'
```

#### Regras de Payload:

- `descricao` (obrigatório): String que descreve o item do orçamento. Máximo de 255 caracteres.

- `valor` (obrigatório): Numérico (ponto flutuante). Representa o impacto financeiro no serviço.

- **Valores positivos:** Incrementam o custo total do serviço (mão de obra, materiais, etc).

- **Valores negativos:** São processados e computados pelo sistema como um desconto sobre o valor final do serviço.

- `observacoes` (opcional): Texto livre para detalhes adicionais com limite de 1000 caracteres.

#### Respostas possíveis:

- **Sucesso (200 OK):** `{"success": true}`. O lançamento é inserido e o cálculo do valor total do serviço é atualizado.

- **Erro de Validação (422 Unprocessable Content):** Retornado se os campos obrigatórios estiverem ausentes, se o formato do campo `valor` não for estritamente numérico, ou se os limites de caracteres de `descricao` (255) e `observacoes` (1000) forem ultrapassados.

- **Acesso Negado (403 Forbidden):** Se o usuário autenticado for o Cliente do serviço ou qualquer outro usuário que não seja o prestador contratado.

- **Não Encontrado (404 Not Found):** Se o ID do serviço informado na rota não existir.

## Finalizar Serviço

Encerra oficialmente a execução do serviço e consolida os valores para faturamento. Esta ação é de uso exclusivo do **Prestador** do serviço.

```bash
curl -k -X POST https://localhost/api/servico/019e134d-e21c-78a0-a004-a772f82b114a/finalizar \
     -H "Authorization: Bearer $TOKEN"
```

#### Regras de Negócio:

O serviço precisa estar obrigatoriamente com o status `Ativo` (em decorrência) para que possa ser finalizado.

#### Respostas possíveis:

- **Sucesso (200 OK):** `{"success": true}`. O status do serviço é alterado para Finalizado.

- **Transição de Estado Inválida (422 Unprocessable Content):** Retornado se o serviço não estiver em andamento (por exemplo, se ainda estiver em fase de `Orçamento`, se já estiver `Cancelado` ou `Finalizado`).

- **Acesso Negado (403 Forbidden):** Se o usuário autenticado for o Cliente do serviço ou um terceiro não participante.

- **Não Encontrado (404 Not Found):** Se o ID do serviço informado na rota não existir.

## Cancelar Serviço

Interrompe o fluxo do serviço definitivamente. Esta ação pode ser realizada por qualquer um dos participantes (Cliente ou Prestador).

```bash
curl -k -X POST https://localhost/api/servico/019e134d-e21c-78a0-a004-a772f82b114a/cancelar \
     -H "Authorization: Bearer $TOKEN"
```

#### Regras de Negócio:

Não é permitido cancelar um serviço que já atingiu um estado terminal. O cancelamento será bloqueado se o status atual for `Finalizado`, `Cancelado` ou `Expirado`.

Respostas possíveis:

- **Sucesso (200 OK):** `{"success": true}`. O status do serviço é atualizado para `Cancelado`.

- **Transição de Estado Inválida (422 Unprocessable Content):** Retornado se o serviço já estiver concluído, expirado ou previamente cancelado.

- **Acesso Negado (403 Forbidden):** Se o usuário autenticado na requisição não fizer parte do serviço.

- **Não Encontrado (404 Not Found):** Se o ID do serviço informado na rota não existir.
