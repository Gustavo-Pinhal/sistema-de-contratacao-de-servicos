<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260412154025 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Cria o esquema servicos';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE SCHEMA servico;');

        $this->addSql(<<<'SQL'
        CREATE TABLE servico.prestadores (
            id              UUID            PRIMARY KEY,
            nome            VARCHAR(255)    NOT NULL,
            ativo           BOOLEAN         NOT NULL DEFAULT TRUE,
            criado_em       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
            excluido_em     TIMESTAMP       ,
            FOREIGN KEY (id) REFERENCES auth.usuarios (id)
        );
        SQL);

        $this->addSql(<<<'SQL'
        CREATE TABLE servico.profissoes (
            id              SERIAL          PRIMARY KEY,
            descricao       VARCHAR(60)     ,
            criado_em       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
            excluido_em     TIMESTAMP
        );
        SQL);

        $this->addSql(<<<'SQL'
        CREATE TABLE servico.prestadores_profissoes (
            id_prestador    UUID            NOT NULL,
            id_profissao    INTEGER         NOT NULL,
            qtd_prestacoes  INTEGER         NOT NULL DEFAULT 0,
            med_avaliacoes  DOUBLE PRECISION NOT NULL DEFAULT 5.0,
            criado_em       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
            excluido_em     TIMESTAMP       ,
            PRIMARY KEY (id_prestador, id_profissao),
            FOREIGN KEY (id_prestador) REFERENCES servico.prestadores (id),
            FOREIGN KEY (id_profissao) REFERENCES servico.profissoes (id)
        );
        SQL);

        $this->addSql(<<<'SQL'
        CREATE TABLE servico.clientes (
            id              UUID            PRIMARY KEY, 
            nome            VARCHAR(255)    NOT NULL,
            criado_em       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
            excluido_em     TIMESTAMP       ,
            FOREIGN KEY (id) REFERENCES auth.usuarios (id)
        );
        SQL);

        $this->addSql(<<<'SQL'
        CREATE TABLE servico.servicos (
            id              UUID            PRIMARY KEY,
            id_cliente      UUID            NOT NULL,
            id_prestador    UUID            NOT NULL,
            inicio          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
            encerramento    TIMESTAMP       ,
            excluido_em     TIMESTAMP       ,
            FOREIGN KEY (id_cliente) REFERENCES servico.clientes (id),
            FOREIGN KEY (id_prestador) REFERENCES servico.prestadores (id)
        );
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE servico.servicos;');

        $this->addSql('DROP TABLE servico.clientes;');

        $this->addSql('DROP TABLE servico.prestadores_profissoes;');

        $this->addSql('DROP TABLE servico.profissoes;');

        $this->addSql('DROP TABLE servico.prestadores;');

        $this->addSql('DROP SCHEMA servico;');
    }
}
