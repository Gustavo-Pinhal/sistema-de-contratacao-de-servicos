FROM php:8.5-fpm

RUN apt-get update && apt-get install -y \
    libpq-dev \
    libicu-dev \
    libsodium-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql intl sodium

# --- INSTALAÇÃO E CONFIGURAÇÃO DO XDEBUG ---
RUN pecl install xdebug && docker-php-ext-enable xdebug

# Configurações do Xdebug 3 (PHP 8+)
RUN echo "xdebug.mode=debug" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.start_with_request=yes" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.client_host=host.docker.internal" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.client_port=9003" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.log=/tmp/xdebug.log" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini
# -------------------------------------------

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html