<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260508233604 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Cria esquema empresarial';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE SCHEMA empresarial;');

        $this->addSql(<<<'SQL'
        CREATE TABLE empresarial.empresas (
            id              UUID            PRIMARY KEY,
            criado_em       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
            excluido_em     TIMESTAMP       ,
            FOREIGN KEY (id) REFERENCES auth.usuarios (id)
        )
        SQL);

        $this->addSql(<<<'SQL'
        CREATE TABLE empresarial.empresa_prestadores (
            id_empresa      UUID            NOT NULL,
            id_prestador    UUID            PRIMARY KEY,
            criado_em       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
            excluido_em     TIMESTAMP       ,
            FOREIGN KEY (id_empresa) REFERENCES empresarial.empresas (id)
        )
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE empresarial.empresa_prestadores');

        $this->addSql('DROP TABLE empresarial.empresas');

        $this->addSql('DROP SCHEMA empresarial');
    }
}
