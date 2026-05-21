<?php

declare(strict_types=1);

namespace App\Repository\Dashboard;

use Doctrine\DBAL\Connection;

class DashboardStatsRepository
{
    public function __construct(private readonly Connection $connection) {}

    public function contarClientes(): int
    {
        return (int) $this->connection->fetchOne(
            "SELECT COUNT(*) FROM servico.clientes WHERE excluido_em IS NULL"
        );
    }

    public function contarPrestadores(): int
    {
        return (int) $this->connection->fetchOne(
            "SELECT COUNT(*) FROM servico.prestadores WHERE excluido_em IS NULL"
        );
    }

    public function contarEmpresas(): int
    {
        return (int) $this->connection->fetchOne(
            "SELECT COUNT(*) FROM empresarial.empresas WHERE excluido_em IS NULL"
        );
    }

    public function contarAssinaturasAtivas(): int
    {
        return (int) $this->connection->fetchOne(
            "SELECT COUNT(*) FROM auth.assinaturas WHERE ativo = TRUE"
        );
    }

    public function rendimentoMensal(): float
    {
        $result = $this->connection->fetchOne(
            "SELECT COALESCE(SUM(o.valor), 0)
             FROM servico.orcamentos o
             INNER JOIN servico.servicos s ON s.id = o.id_servico
             WHERE o.excluido_em IS NULL
               AND s.excluido_em IS NULL
               AND o.criado_em >= date_trunc('month', CURRENT_DATE)"
        );

        return (float) $result;
    }

    public function contarPrestadoresPorEmpresa(string $empresaId): int
    {
        return (int) $this->connection->fetchOne(
            "SELECT COUNT(*) FROM empresarial.empresa_prestadores
             WHERE id_empresa = :empresaId AND excluido_em IS NULL",
            ['empresaId' => $empresaId]
        );
    }

    public function contarServicosContratadosPorEmpresa(string $empresaId): int
    {
        return (int) $this->connection->fetchOne(
            "SELECT COUNT(*)
             FROM servico.servicos sv
             INNER JOIN empresarial.empresa_prestadores ep
                ON ep.id_prestador = sv.id_prestador
             WHERE ep.id_empresa = :empresaId
               AND ep.excluido_em IS NULL
               AND sv.excluido_em IS NULL",
            ['empresaId' => $empresaId]
        );
    }

    public function contarServicosAtivosporEmpresa(string $empresaId): int
    {
        return (int) $this->connection->fetchOne(
            "SELECT COUNT(*)
             FROM servico.servicos sv
             INNER JOIN empresarial.empresa_prestadores ep
                ON ep.id_prestador = sv.id_prestador
             WHERE ep.id_empresa = :empresaId
               AND ep.excluido_em IS NULL
               AND sv.excluido_em IS NULL
               AND sv.encerramento IS NULL",
            ['empresaId' => $empresaId]
        );
    }

    public function contarPrestadoresPremiumPorEmpresa(string $empresaId): int
    {
        return (int) $this->connection->fetchOne(
            "SELECT COUNT(*)
             FROM empresarial.empresa_prestadores ep
             INNER JOIN auth.usuarios u ON u.id = ep.id_prestador
             WHERE ep.id_empresa = :empresaId
               AND ep.excluido_em IS NULL
               AND u.roles::jsonb ? 'ROLE_PREMIUM'",
            ['empresaId' => $empresaId]
        );
    }

    public function contarConvitesPendentesPorEmpresa(string $empresaId): int
    {
        return (int) $this->connection->fetchOne(
            "SELECT COUNT(*)
             FROM notificacao.notificacoes
             WHERE sender = :empresaId
               AND viewd_at IS NULL
               AND deleted_at IS NULL",
            ['empresaId' => $empresaId]
        );
    }
}
