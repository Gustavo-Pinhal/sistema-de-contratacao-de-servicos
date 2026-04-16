# Executar

Utilizar o **Docker Compose** para preparar os contêineres:

```bash
docker compose up
```

Este terminal estará travado pela execução dos contêineres.

Abra outro terminal no mesmo diretório para continuar.

Acessar o contêiner do **php**:

```bash
docker compose exec php bash
```

Utilizar o **composer** já instalado no contêiner para baixar as dependências:

```bash
composer install
```

Utilizar a **cli** do **symfony** para preparar o banco de dados:

```bash
php bin/console doctrine:migrations:migrate
```

Utilizar a **cli** para configurar os buckets

```bash
php bin/console app:storage:setup
```

Utilizar a **cli** para gerar as chaves de criptografia

```bash
php bin/console lexik:jwt:generate-keypair
```

Utilizar a **cli** para criar um usuário:

```bash
php bin/console app:create-user
```
