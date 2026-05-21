<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260508144656 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Cria tabela de assinaturas no esquema auth';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
        CREATE TABLE auth.assinaturas ( 
            id_usuario      UUID            NOT NULL,
            tipo            VARCHAR(20)     NOT NULL,
            ativo           BOOLEAN         NOT NULL DEFAULT TRUE,
            PRIMARY KEY (id_usuario, tipo),
            FOREIGN KEY (id_usuario) REFERENCES auth.usuarios (id)
        )
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE auth.assinaturas;');
    }
}
