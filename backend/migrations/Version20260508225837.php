<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260508225837 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Cria esquema localizacao';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE SCHEMA localizacao');

        $this->addSql(<<<'SQL'
        CREATE TABLE localizacao.municipios (
            id              SERIAL          PRIMARY KEY,
            codigo_ibge     CHAR(7)         NOT NULL UNIQUE,
            nome            VARCHAR(255)    NOT NULL,
            uf              CHAR(2)         NOT NULL
        );
        SQL);

        $this->addSql(<<<'SQL'
        CREATE TABLE localizacao.cep (
            numero          CHAR(9)         PRIMARY KEY,
            rua             VARCHAR(255)    NOT NULL,
            bairro          VARCHAR(255)    NOT NULL,
            id_municipio    INTEGER         NOT NULL,
            FOREIGN KEY (id_municipio) REFERENCES localizacao.municipios (id)
        )
        SQL);

        $this->addSql(<<<'SQL'
        CREATE TABLE localizacao.enderecos (
            id              UUID            PRIMARY KEY,
            id_usuario      UUID            NOT NULL,
            cep             CHAR(9)         NOT NULL,
            rua             VARCHAR(255)    ,
            numero          VARCHAR(20)     ,
            bairro          VARCHAR(255)    ,
            complemento     VARCHAR(255)    ,
            FOREIGN KEY (id_usuario)    REFERENCES auth.usuarios    (id),
            FOREIGN KEY (cep)           REFERENCES localizacao.cep  (numero)
        );
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE localizacao.enderecos;');

        $this->addSql('DROP TABLE localizacao.cep;');

        $this->addSql('DROP TABLE localizacao.municipios;');

        $this->addSql('DROP SCHEMA localizacao;');
    }
}
