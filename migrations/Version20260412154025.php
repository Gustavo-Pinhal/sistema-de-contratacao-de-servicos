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
        $this->addSql('CREATE SCHEMA servicos;');

        $this->addSql(<<<'SQL'
        CREATE TABLE servicos.prestadores (
            id              UUID            PRIMARY KEY,
            id_usuario      INTEGER         UNIQUE NOT NULL,
            nome            VARCHAR(255)    NOT NULL,
            ativo           BOOLEAN         NOT NULL DEFAULT TRUE,
            criado_em       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
            excluido_em     TIMESTAMP       ,
            FOREIGN KEY (id_usuario) REFERENCES auth.usuarios (id)
        );
        SQL);

        $this->addSql(<<<'SQL'
        CREATE TABLE servicos.profissoes (
            id              SERIAL          PRIMARY KEY,
            descricao       VARCHAR(60)     ,
            criado_em       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
            excluido_em     TIMESTAMP
        );
        SQL);

        $this->addSql(<<<'SQL'
        CREATE TABLE servicos.prestadores_profissoes (
            id_prestador    UUID            NOT NULL,
            id_profissao    INTEGER         NOT NULL,
            qtd_prestacoes  INTEGER         NOT NULL DEFAULT 0,
            med_avaliacoes  DOUBLE PRECISION NOT NULL DEFAULT 5.0,
            criado_em       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
            excluido_em     TIMESTAMP       ,
            PRIMARY KEY (id_prestador, id_profissao),
            FOREIGN KEY (id_prestador) REFERENCES servicos.prestadores (id),
            FOREIGN KEY (id_profissao) REFERENCES servicos.profissoes (id)
        );
        SQL);

        $this->addSql(<<<'SQL'
        CREATE TABLE servicos.clientes (
            id              UUID            PRIMARY KEY, 
            id_usuario      INTEGER         UNIQUE NOT NULL,
            nome            VARCHAR(255)    NOT NULL,
            criado_em       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
            excluido_em     TIMESTAMP       ,
            FOREIGN KEY (id_usuario) REFERENCES auth.usuarios (id)
        );
        SQL);

        $this->addSql(<<<'SQL'
        CREATE TABLE servicos.servicos (
            id              UUID            PRIMARY KEY,
            id_cliente      UUID            NOT NULL,
            id_prestador    UUID            NOT NULL,
            inicio          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
            encerramento    TIMESTAMP       ,
            excluido_em     TIMESTAMP
        );
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE servicos.servicos;');

        $this->addSql('DROP TABLE servicos.clientes;');

        $this->addSql('DROP TABLE servicos.prestadores_profissoes;');

        $this->addSql('DROP TABLE servicos.profissoes;');

        $this->addSql('DROP TABLE servicos.prestadores;');

        $this->addSql('DROP SCHEMA servicos;');
    }
}
