<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260412194245 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Cria esquema chat';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE SCHEMA chat;');

        $this->addSql(<<<'SQL'
        CREATE TABLE chat.sala (
            id              SERIAL          PRIMARY KEY,
            id_servico      UUID            UNIQUE NOT NULL,
            id_prestador    UUID            NOT NULL,
            id_cliente      UUID            NOT NULL,
            FOREIGN KEY (id_servico)    REFERENCES servicos.servicos    (id),
            FOREIGN KEY (id_prestador)  REFERENCES servicos.prestadores (id),
            FOREIGN KEY (id_cliente)    REFERENCES servicos.clientes    (id)
        );
        SQL);

        $this->addSql(<<<'SQL'
        CREATE TABLE chat.mensagens (
            id              UUID            PRIMARY KEY,
            id_sala         INTEGER         NOT NULL,
            id_usuario      INTEGER         NOT NULL,
            conteudo        JSONB           NOT NULL,
            envio_em        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            visualizado_em  TIMESTAMP WITH TIME ZONE,
            FOREIGN KEY (id_sala)       REFERENCES chat.sala            (id),
            FOREIGN KEY (id_usuario)    REFERENCES auth.usuarios        (id)
        );
        SQL);

        $this->addSql('CREATE INDEX idx__mensagens__id_sala ON chat.mensagens (id_sala);');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX idx__mensagens__id_sala;');

        $this->addSql('DROP TABLE chat.mensagens;');

        $this->addSql('DROP TABLE chat.sala;');

        $this->addSql('DROP SCHEMA chat;');
    }
}
