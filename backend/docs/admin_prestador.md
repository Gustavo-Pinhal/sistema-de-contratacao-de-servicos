## Listar Prestadores (Painel Administrativo)

Retorna a listagem completa de todos os prestadores cadastrados no sistema, indicando seus identificadores únicos, nomes e status de assinatura premium. O acesso é restrito a administradores (`ROLE_ADMIN`).

```bash
curl -k -X GET https://localhost/api/admin/prestador \
     -H "Authorization: Bearer $TOKEN"
```

A requisição responde com um array de objetos no seguinte formato:

```json
[
    {
        "id": "019e128a-0756-7c01-9a7e-f15f2be59ed7",
        "nome": "Carlos Silva",
        "premium": true
    },
    {
        "id": "019e128a-09c5-7c17-a15c-1bfb45382083",
        "nome": "Marcos Oliveira",
        "premium": false
    }
]
```

#### Respostas possíveis:

- **Sucesso (200 OK):** Retorna o array contendo todos os prestadores e seus respectivos status.

- **Acesso Negado (403 Forbidden):** Caso o token enviado não possua privilégios administrativos.

## Promover Prestador para Premium

Eleva o nível de acesso de um prestador para a categoria premium. Esta operação concede as permissões necessárias e garante a inicialização automática do portfólio do profissional caso ele ainda não possua um. O acesso é restrito a administradores (`ROLE_ADMIN`).

```bash
curl -k -X POST https://localhost/api/admin/prestador/019e128a-09c5-7c17-a15c-1bfb45382083/promover \
     -H "Authorization: Bearer $TOKEN"
```

#### Regras de Negócio:

- Altera as regras de acesso do usuário, injetando as credenciais de privilégio elevado.

- Atualiza o estado de atividade do prestador no sistema.

- Verifica a existência de um portfólio vinculado. Se inexistente, cria e vincula uma nova estrutura de portfólio vazia para o prestador.

#### Respostas possíveis:

- **Sucesso (200 OK):** `{"success": true}`.

- **Não Encontrado (404 Not Found):** Se o ID do prestador informado na rota não existir.

- **Acesso Negado (403 Forbidden):** Caso o usuário da requisição não seja um administrador.

## Demover Prestador de Premium

Remove os privilégios premium de um prestador, retornando-o ao nível de acesso básico e alterando seu status de atividade de assinatura. O acesso é restrito a administradores (`ROLE_ADMIN`).

```bash
curl -k -X POST https://localhost/api/admin/prestador/019e128a-0756-7c01-9a7e-f15f2be59ed7/demover \
     -H "Authorization: Bearer $TOKEN"
```

#### Regras de Negócio:

- Revoga as credenciais de privilégio elevado, mantendo apenas o nível básico de prestador.

- Desativa o status de atividade premium do profissional no sistema.

#### Respostas possíveis:

- **Sucesso (200 OK):** `{"success": true}`.

- **Não Encontrado (404 Not Found):** Se o ID do prestador informado na rota não existir.

- **Acesso Negado (403 Forbidden):** Caso o usuário da requisição não possua a credencial administrativa necessária.
