# Sistema de Marido de Aluguel - Fullstack

Este projeto é uma plataforma completa para conexão entre clientes e prestadores de serviço, contando com chat em tempo real e armazenamento de mídias.

---

### 🛠 Infraestrutura e Tecnologias

A arquitetura é baseada em micro-serviços conteinerizados com **Docker:**

- **Frontend:** React/Vite (Node 20) acessível em `https://localhost`.

- **Backend:** API Symfony 7 (PHP 8.2+) em `https://localhost/api`.

- **Banco de Dados:** PostgreSQL 16.

- **Mensageria Real-time:** Mercure Hub (SSE) para notificações e chat instantâneo.

- **Storage:** SeaweedFS (S3 Compatible) para armazenamento de arquivos e imagens.

- **Servidor Web:** Nginx configurado com Terminação SSL (HTTPS).

---

### 🚀 Como Executar o Projeto

1. Preparação dos Certificados SSL

Como o projeto utiliza HTTPS localmente, você precisa gerar os certificados autoassinados na raiz do projeto:

```bash
mkdir -p docker/nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
 -keyout docker/nginx/certs/key.pem \
 -out docker/nginx/certs/cert.pem \
 -subj "/C=BR/ST=SP/L=Local/O=Dev/OU=App/CN=localhost"
```

2. Inicialização dos Contêineres

Suba todos os serviços utilizando o Docker Compose:

```bash
docker compose up
```

3. Setup do Backend

Acesse o contêiner do PHP para executar os comandos de configuração inicial:

```bash
docker compose exec php bash
```

Dentro do contêiner, execute a sequência abaixo:

```bash
# Instalar dependências do PHP
composer install

# Executar as migrações do banco de dados
php bin/console doctrine:migrations:migrate --no-interaction

# Popular o banco de dados com as seeds
php bin/console doctrine:fixtures:load --no-interaction

# Configurar buckets no SeaweedFS
php bin/console app:storage:setup

# Gerar chaves para autenticação JWT
php bin/console lexik:jwt:generate-keypair

# Criar ademiro
php bin/console app:create-admin
```

---

### 🌐 Acesso ao Sistema

Após o setup, o sistema estará disponível nos seguintes endereços:

| Serviço                | URL                   | Descrição                          |
| ---------------------- | --------------------- | ---------------------------------- |
| **Aplicação Completa** | https://localhost     | Interface Web + API                |
| **API Docs**           | https://localhost/api | Entrypoint da API                  |
| **File Browser**       | http://localhost:8888 | Navegador de arquivos do SeaweedFS |
| **S3 Endpoint**        | http://localhost:8333 | API de armazenamento               |

---

### 🛣 Overview das Rotas Principais

O roteamento é centralizado pelo Nginx, que distribui as requisições conforme o prefixo:

- `/`: Redireciona para o servidor de desenvolvimento do **Frontend** (Vite).

- `/api`: Encaminha para o **Backend** (Symfony).

- `/.well-known/mercure`: Canal de comunicação para o **Mercure** (Real-time).

- `/storage`: Acesso direto aos arquivos armazenados no **SeaweedFS**.

---

### 📝 Documentação da API

Toda a documentação técnica e detalhada dos endpoints se encontram dentro de `backend/docs/`.
