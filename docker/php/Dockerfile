FROM php:8.5-fpm

RUN apt-get update && apt-get install -y \
    libpq-dev \
    libicu-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql intl

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html