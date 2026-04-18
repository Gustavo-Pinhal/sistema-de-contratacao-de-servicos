<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260416161958 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Cria esquema portifolio';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE SCHEMA portifolio;');

        $this->addSql(<<<'SQL'
        CREATE TABLE portifolio.portifolios (
            id              UUID            PRIMARY KEY,
            biografia       TEXT            ,
            servicos_concluidos INTEGER     NOT NULL DEFAULT 0,
            FOREIGN KEY (id) references servico.prestadores (id)
        );
        SQL);

        $this->addSql(<<<'SQL'
        CREATE TABLE portifolio.projetos (
            id              UUID            PRIMARY KEY,
            id_portifolio   UUID            NOT NULL,
            titulo          VARCHAR(255)    NOT NULL,
            descricao       TEXT            ,
            regiao          VARCHAR(150)    ,
            valor           NUMERIC(10,2)   NOT NULL,
            exibir_valor    BOOLEAN         NOT NULL DEFAULT TRUE,
            concluido_em    DATE            NOT NULL,
            exibir_concluido_em BOOLEAN     NOT NULL DEFAULT TRUE,
            FOREIGN KEY (id_portifolio) REFERENCES portifolio.portifolios (id)
        );
        SQL);

        $this->addSql(<<<'SQL'
        CREATE TABLE portifolio.fotos (
            id              UUID            PRIMARY KEY,
            id_projeto      UUID            NOT NULL,
            url_foto        VARCHAR(255)    NOT NULL,
            ordem           INTEGER         NOT NULL,
            UNIQUE (id_projeto, ordem)      ,
            FOREIGN KEY (id_projeto) REFERENCES portifolio.projetos (id)
        );
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE portifolio.fotos;');

        $this->addSql('DROP TABLE portifolio.projetos;');

        $this->addSql('DROP TABLE portifolio.portifolios;');

        $this->addSql('DROP SCHEMA portifolio;');
    }
}
