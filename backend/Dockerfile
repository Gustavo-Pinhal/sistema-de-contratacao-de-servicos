FROM php:8.5-fpm

RUN apt-get update && apt-get install -y \
    libpq-dev \
    libicu-dev \
    libsodium-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql intl sodium

# Extensao Redis para backend de metricas Prometheus compartilhado entre workers
RUN pecl install redis && docker-php-ext-enable redis

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html