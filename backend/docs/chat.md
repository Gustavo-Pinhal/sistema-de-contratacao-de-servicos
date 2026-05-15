## Abrir Chat

Retorna as informações básicas da sala de chat, a lista de participantes, o histórico de mensagens e as credenciais necessárias para conectar ao tópico em tempo real via Mercure.

```bash
curl -k -X GET https://localhost/api/servico/019e134d-e21c-78a0-a004-a772f82b114a/chat \
-H "Authorization: Bearer $TOKEN"
```

A requisição responde com um objeto contendo o histórico e os metadados de conexão:

```json
{
    "idServico": "019e134d-e21c-78a0-a004-a772f82b114a",
    "mercureToken": "eyJ0eXAi...",
    "topico": "http://chat/com/servico/019e134d-e21c-78a0-a004-a772f82b114a",
    "participantes": {
        "cliente": {
            "id": "019e128a-09c5-7c17-a15c-1bfb45382083",
            "nome": "João Silva"
        },
        "prestador": {
            "id": "019e128a-0756-7c01-9a7e-f15f2be59ed7",
            "nome": "Carlos Eletricista"
        }
    },
    "messagens": [
        {
            "id": "019e13eb-450c-7bb6-9060-9abf55d0c276",
            "enviado_por": "019e128a-09c5-7c17-a15c-1bfb45382083",
            "tipo": "texto",
            "texto": "Olá, tudo bem?",
            "referencia": "",
            "arquivo": null,
            "enviado_em": "10/05/2026 às 22:04"
        },
        {
            "id": "019e13ec-450c-7bb6-9060-9abf55d0c277",
            "enviado_por": "019e128a-09c5-7c17-a15c-1bfb45382083",
            "tipo": "arquivo",
            "texto": null,
            "referencia": "",
            "arquivo": {
                "id": "019e13ec-450c-7bb6-9060-9abf55d0c277",
                "mime_type": "image/jpeg"
            },
            "enviado_em": "10/05/2026 às 22:04"
        }
    ]
}
```

A estrutura do campo `arquivo` agora contém apenas os metadados necessários para solicitar a URL de download.

#### Respostas possíveis:

- **Sucesso (200 OK):** Dados carregados com sucesso.

- **Acesso Negado (403 Forbidden):** Se o usuário logado não for o cliente nem o prestador deste serviço.

## Enviar Mensagem de Texto

Envia uma nova mensagem de texto para a sala de chat.

```bash
curl -k -X POST https://localhost/api/servico/019e134d-e21c-78a0-a004-a772f82b114a/chat \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
    "texto": "Olá, qual o valor do orçamento?",
    "responde": "019e13eb-450c-7bb6-9060-9abf55d0c276"
}'
```

#### Respostas possíveis:

- **Sucesso (201 Created):** `{"status":"success"}`.

- **Erro de Validação (422 Unprocessable Content):** Quando o texto está vazio, excede 512 caracteres ou o UUID de referência é inválido.

- **Acesso Negado (403 Forbidden):** Usuário não pertence ao chat.

## Enviar Arquivo ou Imagem

Realiza o upload de um arquivo para o chat. O arquivo é armazenado de forma segura e uma mensagem do tipo "arquivo" é disparada no chat.

```bash
curl -k -X POST https://localhost/api/servico/019e134d-e21c-78a0-a004-a772f82b114a/chat/upload \
-H "Authorization: Bearer $TOKEN" \
-F "file=@/caminho/da/sua/imagem.jpg"
```

#### Respostas possíveis:

- **Sucesso (201 Created):** Retorna o objeto da mensagem de arquivo criada, incluindo a URL temporária.

- **Arquivo Inválido (400 Bad Request):** Se o campo file estiver vazio ou o upload falhar no cliente.

- **Erro de Armazenamento (502 Bad Gateway):** Falha na comunicação com o servidor de mídias (SeaweedFS/S3).

- **Erro Interno (500 Internal Server Error):** Falha inesperada ao processar o arquivo.

## Conexão Real-time (Mercure)

Para receber mensagens instantaneamente sem atualizar a página, o frontend deve estabelecer uma conexão **EventSource** com o Hub Mercure utilizando os dados obtidos no endpoint de Detalhes do Chat.

#### Passos para conexão:

1. Recupere o `mercureToken` e o `topico` através do GET do chat.

2. Inscreva-se no Hub utilizando o token como cabeçalho de autorização (ou via Cookie).

#### Exemplo de escuta via terminal:

```bash
curl -i -k -N \
-H "Authorization: Bearer $MERCURE_TOKEN" \
"https://localhost/.well-known/mercure?topic=TOPIC"
```

O Hub enviará eventos `data` no formato JSON sempre que uma nova mensagem (texto ou arquivo) for postada:

```json
{
    "id": "019e13eb-82b4-7d79-a96e-940f704e469d",
    "enviado_por": "019e128a-09c5",
    "tipo": "texto",
    "texto": "Mensagem recebida em tempo real!",
    "referencia": "",
    "arquivo": null,
    "enviado_em": "10/05/2026 às 22:04"
}
```

## Recuperação de Imagens e Arquivos

As imagens e arquivos enviados não são públicos e suas URLs não são enviadas automaticamente no histórico para otimizar o tráfego. Para visualizar um arquivo, o frontend deve solicitar uma **URL Assinada (Presigned URL)** sob demanda.

#### Obter URL de download

```bash
curl -k -X GET https://localhost/api/servico/{idServico}/chat/{idMensagem}/download \
    -H "Authorization: Bearer $TOKEN"
```

#### Resposta de Sucesso (200 OK):

```json
{
    "url": "https://localhost/storage/chats/019e13eb...jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=1200..."
}
```

#### Regras de acesso:

- **Endpoint dinâmico:** O `{idMensagem}` para a rota de download deve ser o ID contido no objeto `arquivo` da mensagem original.

- **Expiração:** As URLs geradas expiram em **20 minutos**.

- **Segurança:** Apenas participantes da sala (cliente ou prestador) podem gerar a URL de download para arquivos daquela sala específica.

Ao consultar o histórico ou receber uma mensagem de arquivo, o campo `arquivo` conterá a estrutura:

```json
"arquivo": {
    "id": "019e135e-6e18-7a2a-a8fe-b2c265bd4b66",
    "url": "https://localhost/app-private/chats/id-arquivo.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=1200...",
    "mime_type": "image/jpeg"
}
```

---

**Nota sobre Segurança:** Todos os endpoints exigem o cabeçalho `Authorization: Bearer {token}`. O acesso às salas é restrito aos IDs de usuário vinculados ao serviço (Cliente e Prestador). Qualquer tentativa de acesso de terceiros retornará `403 Forbidden`.
