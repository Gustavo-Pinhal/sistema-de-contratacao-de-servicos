## Visualizar Dashboard do Prestador (Atualizado)

O endpoint de dashboard foi atualizado e agora retorna dois novos campos de identificação do prestador autenticado: o nome comercial e a URL pública da foto de perfil. Esses dados permitem que interfaces exibam a identidade visual do prestador diretamente no painel, sem necessidade de uma requisição adicional ao endpoint de perfil.

```bash
curl -k -X GET https://localhost/api/areaprestador/dashboard \
     -H "Authorization: Bearer $TOKEN"
```

A resposta agora inclui os campos `nome`, `urlPerfil` e `premium` no objeto raiz:

```json
{
    "filiado": {
        "id": "019e47ea-7fca-7922-894c-723209c9b4a0",
        "nome": "Empresa Exemplo Ltda"
    },
    "premium": true,
    "nome": "André Reparos",
    "urlPerfil": "https://cdn.exemplo.com/perfis/019e2140-37ff-7018-a7d5-73fca936f836.jpg",
    "ativos": [],
    "pendentes": [],
    "concluidos": [],
    "cancelados": []
}
```

#### Novos campos:

- `nome`: Nome comercial do prestador. Se o prestador não tiver um nome comercial configurado, retorna o nome completo cadastrado na conta de usuário.

- `urlPerfil`: URL pública da foto de perfil do prestador. Retorna `null` se nenhuma foto tiver sido enviada.

- `premium`: Booleano que indica se o prestador possui o plano Premium ativo (`ROLE_PREMIUM`).

#### Respostas possíveis:

- **Sucesso (200 OK):** Retorna as listas de serviços segmentadas e os dados de identidade do prestador.

- **Acesso Negado (403 Forbidden):** Se o token estiver ausente ou pertencer a um usuário sem o papel `ROLE_PRESTADOR`.

---

## Ativar Plano Premium

Ativa o plano Premium para o prestador autenticado, concedendo o papel `ROLE_PREMIUM` e criando automaticamente o portfólio do prestador caso ainda não exista. Acesso restrito a prestadores (`ROLE_PRESTADOR`).

```bash
curl -k -X POST https://localhost/api/areaprestador/assinar \
     -H "Authorization: Bearer $TOKEN"
```

A requisição responde com:

```json
{
    "success": true,
    "message": "Plano Premium ativado com sucesso!"
}
```

#### Regras de Negócio:

- Ao ativar o plano, o prestador recebe o papel `ROLE_PREMIUM` em adição ao `ROLE_PRESTADOR` já existente.

- Se o prestador ainda não possuir um portfólio criado, ele é gerado automaticamente nesta operação.

- O endpoint não realiza cobrança real. Integração com gateway de pagamento deve ser implementada separadamente caso necessário.

#### Respostas possíveis:

- **Sucesso (200 OK):** Plano ativado, papel atualizado e portfólio garantido.

- **Não Encontrado (404 Not Found):** Se o registro de prestador não for localizado para o usuário autenticado.

- **Acesso Negado (403 Forbidden):** Se o token pertencer a um usuário sem o papel `ROLE_PRESTADOR`.
