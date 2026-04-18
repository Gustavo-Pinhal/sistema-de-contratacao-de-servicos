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
            FOREIGN KEY (id_servico)    REFERENCES servico.servicos    (id),
            FOREIGN KEY (id_prestador)  REFERENCES servico.prestadores (id),
            FOREIGN KEY (id_cliente)    REFERENCES servico.clientes    (id)
        );
        SQL);

        $this->addSql(<<<'SQL'
        CREATE TABLE chat.mensagens (
            id              UUID            PRIMARY KEY,
            id_sala         INTEGER         NOT NULL,
            id_usuario      UUID            NOT NULL,
            conteudo        JSONB           NOT NULL,
            id_responde     UUID            ,
            envio_em        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            visualizado_em  TIMESTAMP WITH TIME ZONE,
            FOREIGN KEY (id_sala)       REFERENCES chat.sala            (id),
            FOREIGN KEY (id_usuario)    REFERENCES auth.usuarios        (id),
            FOREIGN KEY (id_responde)   REFERENCES chat.mensagem        (id)
        );
        SQL);

        $this->addSql('CREATE INDEX idx__mensagens__id_sala ON chat.mensagens (id_sala);');

        $this->addSql(<<<'SQL'
        CREATE TABLE chat.arquivos (
            id              UUID            PRIMARY KEY,
            id_mensagem     UUID            ,
            id_sala         INTEGER         NOT NULL,
            caminho         VARCHAR(512)    NOT NULL,
            mime_type       VARCHAR(100)    NOT NULL,
            tamanho         INTEGER         NOT NULL,
            excluido_em     TIMESTAMP       ,
            FOREIGN KEY (id_mensagem)   REFERENCES chat.mensagens       (id),
            FOREIGN KEY (id_sala)       REFERENCES chat.sala            (id)
        );
        SQL);

        $this->addSql('CREATE INDEX idx__arquivos__id_mensagem ON chat.arquivos (id_mensagem');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE chat.arquivos;');

        $this->addSql('DROP TABLE chat.mensagens;');

        $this->addSql('DROP TABLE chat.sala;');

        $this->addSql('DROP SCHEMA chat;');
    }
}
