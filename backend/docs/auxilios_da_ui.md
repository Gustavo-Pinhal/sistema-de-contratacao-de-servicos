## Consultar endereço por Cep

Retorna endereço com base no cep digitado. Útil para facilitar o usuário a digitar seu endeço a partir do Cep.

```bash
curl -k https://localhost/api/ui/endereco?cep=01310000 \
    -H "Authorization: Bearer $TOKEN"
```

A requisição responde com um json no seguinte formato:

```json
{
    "numero": "01310000",
    "rua": "Avenida Paulista",
    "bairro": "Bela Vista",
    "municipio": {
        "nome": "S\u00e3o Paulo",
        "uf": "SP"
    }
}
```

Os campos `rua` e `bairro` podem vir vazios em caso de Cep único para o município.

Em caso de Cep inexistente ou inválido, o json possui o seguinte formato

```json
{
    "message": "Erro de valida\u00e7\u00e3o",
    "errors": { "cep": "CEP inv\u00e1lido." }
}
```

## Consultar Profissões

Consulta as profissões existentes no sistema

```bash
curl -k https://localhost/api/ui/profissoes
```

A requisição responde com um array de profissões no seguinte format

```json
[
    { "id": 63, "descricao": "Chaveiro" },
    { "id": 55, "descricao": "Eletricista" },
    { "id": 62, "descricao": "T\u00e9cnico de Ar Condicionado" }
]
```
