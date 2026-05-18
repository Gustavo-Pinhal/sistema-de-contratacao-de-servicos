## Consultar Avaliação do Serviço

Retorna os detalhes da avaliação realizada para um serviço específico, incluindo a nota, o comentário e a lista de fotos anexadas. O acesso a este recurso é público para qualquer usuário da plataforma.

```bash
curl -k -X GET https://localhost/api/servico/019e134d-e21c-78a0-a004-a772f82b114a/avaliacao \
     -H "Authorization: Bearer $TOKEN"
```

A requisição responde com um objeto contendo os detalhes da avaliação no seguinte formato:

```json
{
    "id": "019e134d-e21c-78a0-a004-a772f82b114a",
    "data": "2026-05-18T10:45:00Z",
    "nota": 9.5,
    "comentario": "Excelente atendimento, o prestador foi muito pontual e realizou a instalação perfeitamente.",
    "imagens": [
        {
            "id": "019e1351-b42a-7af0-9b11-c883e41c521a",
            "url": "https://cdn.meuapp.com/public/avaliacoes/019e134d-e21c-78a0-a004-a772f82b114a/019e1351-b42a-7af0-9b11-c883e41c521a.png"
        },
        {
            "id": "019e1351-b84f-7df1-a22c-d994f52b634b",
            "url": "https://cdn.meuapp.com/public/avaliacoes/019e134d-e21c-78a0-a004-a772f82b114a/019e1351-b84f-7df1-a22c-d994f52b634b.webp"
        }
    ]
}
```

#### Respostas possíveis:

- **Sucesso (200 OK):** Retorna os dados consolidados da avaliação e o array de fotos vinculadas.

- **Não Encontrado (404 Not Found):** Retornado caso o serviço informado não exista ou se ele ainda não tiver recebido nenhuma avaliação.

## Criar Avaliação do Serviço

Registra a avaliação de satisfação do serviço executado. Esta ação é de uso exclusivo do Cliente vinculado ao respectivo serviço.

```bash
curl -k -X POST https://localhost/api/servico/019e134d-e21c-78a0-a004-a772f82b114a/avaliacao \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
         "nota": 8.5,
         "comentario": "O serviço ficou ótimo, o acabamento foi muito bem feito."
     }'
```

#### Regras de Payload:

- `nota` (obrigatório): Valor numérico flutuante. Deve estar estritamente no intervalo entre `0` e `10`.

- `comentario` (opcional): Texto descritivo com limite máximo de 2000 caracteres.

#### Respostas possíveis:

- **Sucesso (200 OK):** `{"success": true}`. A avaliação é criada e associada permanentemente ao ID do serviço.

- **Erro de Validação (422 Unprocessable Content):** Retornado quando a nota está ausente, não é numérica, está fora do intervalo de 0 a 10, ou se o comentário ultrapassar o limite de 2000 caracteres.

- **Acesso Negado (403 Forbidden):** Se a requisição for feita pelo Prestador do serviço ou por um usuário não participante.

- **Não Encontrado (404 Not Found):** Se o ID do serviço informado na rota não existir.

#### Enviar Fotos para Avaliação

Realiza o upload de anexos fotográficos para compor o registro visual da avaliação. Esta ação é de uso exclusivo do Cliente do serviço e exige que a avaliação básica (nota e comentário) já tenha sido criada previamente.

```bash
curl -k -X POST https://localhost/api/servico/019e134d-e21c-78a0-a004-a772f82b114a/avaliacao/upload \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: multipart/form-data" \
     -F "imagens[]=@/caminho/da/foto1.png" \
     -F "imagens[]=@/caminho/da/foto2.jpg"
```

#### Regras de Payload:

- `imagens` (obrigatório): Arquivo ou lista de arquivos enviados sob a especificação multipart/form-data.

- **Restrição de Tipo de Mídia:** O endpoint aceita exclusivamente arquivos de imagem do tipo foto. Os formatos aceitos são: `image/jpeg`, `image/png`, `image/webp` e `image/heic`. Arquivos em PDF, documentos ou vídeos são rejeitados.

#### Respostas possíveis:

- **Sucesso (200 OK):** Retorna a confirmação e a lista com identificadores e URLs públicas das imagens processadas e armazenadas.

```json
{
    "success": true,
    "imagens": [
        {
            "id": "019e1351-b42a-7af0-9b11-c883e41c521a",
            "url": "https://cdn.meuapp.com/public/avaliacoes/019e134d-e21c-78a0-a004-a772f82b114a/019e1351-b42a-7af0-9b11-c883e41c521a.png"
        }
    ]
}
```

- **Arquivos Inválidos (422 Unprocessable Content):** Retornado se um ou mais arquivos enviados não forem fotos válidas ou pertencerem a mimes desautorizados.

- **Requisição Incorreta (400 Bad Request):** Se a chave imagens não for enviada ou o payload de arquivos estiver vazio.

- **Acesso Negado (403 Forbidden):** Se a tentativa de envio partir do prestador ou de terceiros.

- **Não Encontrado (404 Not Found):** Caso o serviço não exista ou a avaliação base ainda não tenha sido publicada pelo cliente.
