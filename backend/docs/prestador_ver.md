## Obter Perfil do Prestador

Retorna os dados cadastrais públicos e profissionais de um prestador de serviço específico através do seu identificador único.

```bash
curl -k -X GET https://localhost/api/prestador/019e3aba-1ee4-7627-98ad-d7233540c340
```

A requisição responde com um objeto contendo os detalhes do perfil do prestador no seguinte formato:

```json
{
    "nomeComercial": "Carlos Eletricista",
    "nome": "Carlos Silva",
    "premium": true,
    "municipio": "Araraquara",
    "profissoes": [
        {
            "id": 1,
            "descricao": "Eletricista Residencial"
        },
        {
            "id": 3,
            "descricao": "Técnico em Automação"
        }
    ]
}
```

#### Respostas possíveis:

- **Sucesso (200 OK):** Retorna as informações do perfil do prestador mapeadas com sucesso.

- **Não Encontrado (404 Not Found):** Se o ID do prestador informado na rota não existir.

#### Listar Avaliações do Prestador

Retorna o histórico completo de avaliações realizadas pelos clientes para o prestador informado. Cada item traz os dados da nota, comentário, imagens anexadas e os dados consolidados do respectivo serviço encerrado.

```bash
curl -k -X GET https://localhost/api/prestador/019e3aba-1ee4-7627-98ad-d7233540c340/avaliacoes
```

A requisição responde com um array de objetos no seguinte formato:

```json
[
    {
        "id": "01a41c2c-7b02-7fb3-96e2-24a612140e11",
        "data": "2026-05-18T11:00:58+00:00",
        "nota": 9.5,
        "comentario": "Excelente profissional, muito pontual e executou o serviço de fiação com maestria.",
        "imagens": [
            {
                "id": "01a41c35-e11a-7c01-a123-f349cf12ef4b",
                "url": "https://bucket-publico.s3.amazonaws.com/avaliacoes/quadro_concluido.jpg"
            }
        ],
        "servico": {
            "data": "2026-05-18T10:00:00+00:00",
            "total": 450.0
        }
    }
]
```

#### Respostas possíveis:

- **Sucesso (200 OK):** Retorna a lista contendo todas as avaliações ativas vinculadas àquele prestador.

- **Não Encontrado (404 Not Found):** Se o ID do prestador informado na rota não existir.

## Visualizar Portfólio do Prestador

Retorna a estrutura completa do portfólio de projetos de um prestador. **Nota de uso:** Este endpoint deve ser consumido prioritariamente caso o campo `premium` retornado no perfil do prestador (`GET /api/prestador/{id}`) seja igual a `true`.

```bash
curl -k -X GET https://localhost/api/prestador/019e3aba-1ee4-7627-98ad-d7233540c340/portifolio
```

A requisição responde com um objeto contendo a biografia, estatísticas e galeria de projetos no seguinte formato:

```json
{
    "id": "019b3a32-12f5-7a01-9bc1-d7233540c340",
    "biografia": "Eletricista residencial e industrial especializado em automação de painéis há mais de 10 anos.",
    "servicosConcluidos": 47,
    "projetos": [
        {
            "id": "019e3ba3-01a7-7cf9-9361-248e590b0c9e",
            "titulo": "Instalação de Painel Elétrico Comercial",
            "descricao": "Substituição completa de quadro de distribuição com 24 disjuntores.",
            "regiao": "Mirassol D'Oeste",
            "valor": 1250.0,
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

#### Regras de Visibilidade de Campos:

- `valor`: Retorna o valor numérico do projeto caso `exibirValor` seja `true`. Se for `false`, o campo retornará `null`.

- `concluidoEm`: Retorna a string de data formatada no padrão ISO 8601 caso `exibirConcluidoEm` seja `true`. Se for `false`, o campo retornará `null`.

#### Respostas possíveis:

- **Sucesso (200 OK):** Retorna os detalhes estruturados do portfólio e seus respectivos projetos mapeados.

- **Não Encontrado (404 Not Found):** Se o prestador informado na rota não possuir um portfólio configurado ou se não for localizado no sistema.
