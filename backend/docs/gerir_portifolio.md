## Obter Portfólio do Prestador Autenticado

Retorna o portfólio completo do prestador que está autenticado, incluindo biografia, quantidade de serviços concluídos e todos os projetos com suas respectivas fotos. Acesso restrito a prestadores com plano ativo (`ROLE_PREMIUM`).

```bash
curl -k -X GET https://localhost/api/portifolio/projeto/meu \
     -H "Authorization: Bearer $TOKEN"
```

A requisição responde com um objeto contendo os dados completos do portfólio no seguinte formato:

```json
{
    "id": "019e3aba-1ee4-7627-98ad-d7233540c340",
    "biografia": "Eletricista residencial e industrial especializado em automação de painéis há mais de 10 anos.",
    "servicosConcluidos": 12,
    "projetos": [
        {
            "id": "019e3ba3-01a7-7cf9-9361-248e590b0c9e",
            "titulo": "Instalação de Painel Elétrico Comercial",
            "descricao": "Substituição completa de quadro de distribuição com 24 disjuntores.",
            "regiao": "Mirassol D'Oeste",
            "valor": "1250.00",
            "exibirValor": true,
            "concluidoEm": "2026-05-18T13:00:00+00:00",
            "exibirConcluidoEm": true,
            "posicao": 1,
            "fotos": [
                {
                    "id": "019e3bb5-4f2a-7bf0-a22c-d994f52b634b",
                    "url": "https://cdn.exemplo.com/projetos/foto1.jpg",
                    "posicao": 1
                }
            ]
        }
    ]
}
```

#### Respostas possíveis:

- **Sucesso (200 OK):** Retorna os dados estruturados do portfólio, projetos e fotos. Caso o prestador não possua portfólio configurado, retorna um objeto com `projetos` vazio e demais campos nulos ou zerados.

- **Acesso Negado (403 Forbidden):** Se o token pertencer a um usuário sem o papel `ROLE_PREMIUM`.

---

## Criar Projeto no Portfólio

Cria um novo projeto no portfólio do prestador autenticado. O projeto é associado automaticamente a um serviço concluído existente, aproveitando os dados históricos de localização, valor e data de encerramento. Acesso restrito a prestadores com plano ativo (`ROLE_PREMIUM`).

```bash
curl -k -X POST https://localhost/api/portifolio/projeto \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
         "titulo": "Instalação de Painel Elétrico Comercial",
         "descricao": "Substituição completa de quadro de distribuição com 24 disjuntores em ambiente corporativo."
     }'
```

A requisição responde com os dados básicos do projeto criado:

```json
{
    "success": true,
    "id": "019e3ba3-01a7-7cf9-9361-248e590b0c9e",
    "titulo": "Instalação de Painel Elétrico Comercial",
    "descricao": "Substituição completa de quadro de distribuição com 24 disjuntores em ambiente corporativo.",
    "posicao": 2
}
```

#### Regras de Payload:

- `titulo` (obrigatório): String não vazia com o nome do projeto.

- `descricao` (obrigatório): String não vazia com a descrição detalhada do trabalho realizado.

#### Regras de Negócio:

- O prestador deve possuir ao menos um serviço com status **concluído** para que o projeto possa ser criado.

- A posição do projeto é calculada automaticamente com base na quantidade de projetos já existentes no portfólio.

- As flags `exibirValor` e `exibirConcluidoEm` são inicializadas como `false`. Para alterá-las, utilize o endpoint de edição do projeto.

#### Respostas possíveis:

- **Criado (201 Created):** Projeto criado e vinculado ao portfólio com sucesso.

- **Requisição Inválida (400 Bad Request):** Se `titulo` ou `descricao` estiverem ausentes ou vazios. Também retornado se o prestador não possuir nenhum serviço concluído.

- **Não Encontrado (404 Not Found):** Se o prestador autenticado não possuir portfólio configurado.

- **Acesso Negado (403 Forbidden):** Se o token pertencer a um usuário sem o papel `ROLE_PREMIUM`.

---

## Excluir Projeto do Portfólio

Remove permanentemente um projeto do portfólio, incluindo todas as fotos vinculadas a ele, tanto no banco de dados quanto no armazenamento remoto. Acesso restrito ao prestador proprietário do projeto (`ROLE_PREMIUM`).

```bash
curl -k -X DELETE https://localhost/api/portifolio/projeto/019e3ba3-01a7-7cf9-9361-248e590b0c9e \
     -H "Authorization: Bearer $TOKEN"
```

A requisição responde com:

```json
{
    "success": true
}
```

#### Respostas possíveis:

- **Sucesso (200 OK):** Projeto e todas as suas fotos foram removidos com sucesso.

- **Acesso Negado (403 Forbidden):** Se o usuário autenticado não for o prestador proprietário do projeto.

- **Não Encontrado (404 Not Found):** Se o `{id}` informado na rota não corresponder a nenhum projeto existente.
