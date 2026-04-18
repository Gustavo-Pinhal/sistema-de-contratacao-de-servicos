<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260412154019 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Cria esquema auth';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE SCHEMA auth;');

        $this->addSql(<<<'SQL'
        CREATE TABLE auth.usuarios (
            id              UUID            PRIMARY KEY,
            email           VARCHAR(255)    NOT NULL UNIQUE,
            roles           JSONB           NOT NULL,
            password        VARCHAR(255)    NOT NULL
        );
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE auth.usuarios');

        $this->addSql('DROP SCHEMA auth');
    }
}
