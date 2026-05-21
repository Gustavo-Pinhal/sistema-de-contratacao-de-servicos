<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260508163428 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Cria esquema avaliacao';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE SCHEMA avaliacao;');

        $this->addSql(<<<'SQL'
        CREATE TABLE avaliacao.avaliacoes (
            id_servico      UUID            PRIMARY KEY,
            nota            DOUBLE PRECISION NOT NULL,
            comentario      TEXT,
            criado_em       TIMESTAMP       NOT NULL,
            excluido_em     TIMESTAMP       ,
            FOREIGN KEY (id_servico) REFERENCES servico.servicos (id)
        );
        SQL);

        $this->addSql(<<<'SQL'
        CREATE TABLE avaliacao.imagens (
            id              UUID            PRIMARY KEY,
            id_avaliacao    UUID            NOT NULL,
            caminho         VARCHAR(512)    NOT NULL,
            mime_type       VARCHAR(100)    NOT NULL,
            tamanho         INTEGER         NOT NULL,
            criado_em       TIMESTAMP       NOT NULL,
            excluido_em     TIMESTAMP       ,
            FOREIGN KEY (id_avaliacao) REFERENCES avaliacao.avaliacoes (id_servico)
        );
        SQL);

        $this->addSql('CREATE INDEX idx__imagens__id_avaliacao ON avaliacao.imagens (id_avaliacao);');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE avaliacao.imagens;');

        $this->addSql('DROP TABLE avaliacao.avaliacoes;');

        $this->addSql('DROP SCHEMA avaliacao;');
    }
}
