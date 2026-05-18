## Visualizar Portfólio (Acesso Público)

Retorna as informações completas do portfólio de um prestador específico, incluindo seus dados biográficos, quantidade de serviços concluídos e a listagem de todos os projetos vinculados com suas respectivas fotos.

```bash
curl -k -X GET https://localhost/api/prestador/019e3aba-1ee4-7627-98ad-d7233540c340/portifolio
```

A requisição responde com um objeto contendo os detalhes do portfólio no seguinte formato:

```json
{
    "id": "019e3aba-1ee4-7627-98ad-d7233540c340",
    "biografia": "Eletricista residencial e industrial especializado em automação de painéis há mais de 10 anos.",
    "servicosConcluidos": 47,
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
                    "url": "https://bucket-publico.s3.amazonaws.com/projetos/foto1.jpg",
                    "posicao": 1
                }
            ]
        }
    ]
}
```

#### Regras de Visibilidade:

- `valor`: Retorna como string numérica se o projeto estiver configurado para exibir o valor publicamente. Caso contrário, retorna `null`.

- `concluidoEm`: Retorna a data formatada no padrão ISO 8601 se o projeto estiver configurado para exibir a data de conclusão publicamente. Caso contrário, retorna `null`.

#### Respostas possíveis:

- **Sucesso (200 OK):** Retorna os detalhes estruturados do portfólio, projetos e fotos.

- **Não Encontrado (404 Not Found):** Se o prestador informado na rota não existir ou não possuir um portfólio configurado no sistema.

## Obter Resumo para Geração de Projeto

Retorna os dados consolidados de um serviço concluído para servir de base e preenchimento na criação de um novo projeto de portfólio. Acesso restrito ao prestador vinculado ao serviço.

```bash
curl -k -X GET https://localhost/api/servico/019e134d-e21c-78a0-a004-a772f82b114a/projeto \
     -H "Authorization: Bearer $TOKEN"
```

requisição responde com um objeto contendo os detalhes prévios e financeiros do serviço:

```json
{
    "servico": {
        "id": "019e134d-e21c-78a0-a004-a772f82b114a",
        "prestador": {
            "id": "019e128a-0756-7c01-9a7e-f15f2be59ed7",
            "nome": "Carlos Silva"
        },
        "status": "Finalizado"
    },
    "total": 1250.0,
    "conclusao": "2026-05-18T13:00:00+00:00"
}
```

#### Respostas possíveis:

- **Sucesso (200 OK):** Retorna os metadados financeiros e a data de encerramento do serviço.

- **Acesso Negado (403 Forbidden):** Se o usuário autenticado não for o prestador proprietário do serviço.

## Criar Projeto a partir de um Serviço

Gera um novo projeto no portfólio do prestador utilizando como base o histórico de um serviço finalizado. Acesso restrito a usuários com privilégios adequados (`ROLE_PREMIUM`).

```bash
curl -k -X POST https://localhost/api/servico/019e134d-e21c-78a0-a004-a772f82b114a/projeto \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
         "titulo": "Instalação de Painel Elétrico Comercial",
         "descricao": "Substituição completa de quadro de distribuição com 24 disjuntores.",
         "exibirValor": true,
         "exibirConcluidoEm": true
     }'
```

#### Regras de Payload:

- `titulo` (obrigatório): String contendo entre 3 e 255 caracteres.

- `descricao` (obrigatório): String detalhada contendo no máximo 4000 caracteres.

- `exibirValor` (obrigatório): Booleano (`true` ou `false`).

- `exibirConcluidoEm` (obrigatório): Booleano (`true` ou `false`).

#### Respostas possíveis:

- **Sucesso (201 Created):** `{"success": true}`.

- **Acesso Negado (403 Forbidden):** Se o usuário não for o prestador do serviço.

- **Erro de Validação (422 Unprocessable Content):** Se algum dos campos obrigatórios estiver ausente ou violar o limite de caracteres.
    - Se o serviço correspondente não estiver com o status concluído/finalizado.
    - Se o serviço informado já tiver gerado um projeto anteriormente.

## Editar Projeto

Atualiza as informações textuais e as preferências de exibição de um projeto existente. Acesso restrito ao prestador proprietário do projeto (`ROLE_PREMIUM`).

```bash
curl -k -X PUT https://localhost/api/portifolio/projeto/019e3ba3-01a7-7cf9-9361-248e590b0c9e \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
         "titulo": "Painel Comercial Atualizado",
         "descricao": "Nova descrição refinada sobre a substituição do quadro elétrico.",
         "exibirValor": false,
         "exibirConcluidoEm": true
     }'
```

#### Respostas possíveis:

- **Sucesso (200 OK):** `{"success": true}`.

- **Acesso Negado (403 Forbidden):** Se o usuário autenticado não for o prestador proprietário do projeto ou portfólio.

- **Erro de Validação (422 Unprocessable Content):** Se os campos enviados violarem as regras de tamanho, presença ou tipo de dados do payload.

## Upload de Fotos para o Projeto

Realiza o envio de arquivos de imagem em lote para anexá-los à galeria de um projeto. A ordem de exibição é calculada automaticamente de forma incremental. Acesso restrito ao prestador proprietário do projeto (`ROLE_PREMIUM`).

```bash
curl -k -X POST https://localhost/api/portifolio/projeto/019e3ba3-01a7-7cf9-9361-248e590b0c9e/upload \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: multipart/form-data" \
     -F "imagens[]=@/caminho/da/foto1.jpg" \
     -F "imagens[]=@/caminho/da/foto2.png"
```

A requisição responde com a listagem dos dados das imagens salvas no seguinte formato:

```json
{
    "success": true,
    "imagens": [
        {
            "id": "019e3bb5-4f2a-7bf0-a22c-d994f52b634b",
            "url": "https://bucket-publico.s3.amazonaws.com/projetos/foto1.jpg",
            "posicao": 2
        }
    ]
}
```

#### Respostas possíveis:

- **Sucesso (201 Created):** Retorna a confirmação e a URL pública gerada para as novas imagens.

- **Requisição Inválida (400 Bad Request):** Se a chave do formulário imagens não for enviada ou estiver vazia.

- **Acesso Negado (403 Forbidden):** Se o usuário autenticado não for o proprietário do projeto.

- **Erro de Validação (422 Unprocessable Content):** Se algum arquivo enviado não corresponder a uma mídia válida ou violar restrições internas de tamanho e extensão.

## Excluir Foto do Projeto

Remove permanentemente o registro de uma foto e efetua a sua exclusão física do armazenamento remoto. Acesso restrito ao prestador proprietário do projeto (`ROLE_PREMIUM`).

```bash
curl -k -X DELETE https://localhost/api/portifolio/projeto/foto/019e3bb5-4f2a-7bf0-a22c-d994f52b634b \
     -H "Authorization: Bearer $TOKEN"
```

#### Respostas possíveis:

- **Sucesso (200 OK):** `{"success": true}`.

- **Acesso Negado (403 Forbidden):** Se o usuário autenticado não for o proprietário do projeto ao qual a foto pertence.

- **Erro Interno (500 Internal Server Error):** Caso ocorra uma falha técnica de comunicação ou permissão ao tentar remover o arquivo físico no servidor de armazenamento remoto.
