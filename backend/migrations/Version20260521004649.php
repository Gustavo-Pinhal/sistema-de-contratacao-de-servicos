<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260521004649 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Cria o esquema notificacoes';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE SCHEMA notificacao;');

        $this->addSql(<<<'SQL'
        CREATE TABLE notificacao.notificacoes (
            id              UUID            PRIMARY KEY,
            receiver        UUID            NOT NULL,
            sender          UUID            ,
            message         JSONB           NOT NULL,
            created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
            viewd_at        TIMESTAMP       ,
            deleted_at      TIMESTAMP       ,
            FOREIGN KEY (receiver)  REFERENCES auth.usuarios (id),
            FOREIGN KEY (sender)    REFERENCES auth.usuarios (id)
        );
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE notificacao.notificacoes;');

        $this->addSql('DROP SCHEMA notificacao;');
    }
}
