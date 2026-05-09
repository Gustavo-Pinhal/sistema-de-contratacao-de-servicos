<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260508143334 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Cria tabela da foto do usuário no esquema auth';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
        CREATE TABLE auth.perfis (
            id              UUID            PRIMARY KEY,
            caminho_foto    VARCHAR(255)    NOT NULL,
            FOREIGN KEY (id) REFERENCES auth.usuarios (id)
        );
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE auth.perfis;');
    }
}
