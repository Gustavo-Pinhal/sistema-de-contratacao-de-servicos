<?php

namespace App\Repository\Servico;

use App\Entity\Auth\Usuario;
use App\Entity\Servico\Prestador;
use App\Entity\Servico\Servico;
use App\Enum\StatusServico;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Servico>
 */
class ServicoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Servico::class);
    }

    /** @return Servico[] */
    public function buscarServicosRecentesDoCliente(Usuario $cliente): array
    {
        $limiteTrintaDias = new \DateTimeImmutable('-30 days');

        return $this->createQueryBuilder('s')
            ->addSelect('c', 'p', 'e')
            ->innerJoin('s.cliente', 'c')
            ->innerJoin('s.prestador', 'p')
            ->innerJoin('s.endereco', 'e')
            ->where('s.cliente = :cliente')
            ->andWhere('s.excluidoEm IS NULL')
            ->andWhere(
                '(s.status IN (:statusAtivos)) OR ' .
                    '(s.status IN (:statusTerminais) AND s.encerramento >= :dataLimite)'
            )
            ->setParameter('cliente', $cliente)
            ->setParameter('dataLimite', $limiteTrintaDias)
            ->setParameter('statusAtivos', [
                StatusServico::SolicitacaoDeOrcamento,
                StatusServico::EmDecorrencia
            ])
            ->setParameter('statusTerminais', [
                StatusServico::Concluido,
                StatusServico::CanceladoPeloCliente,
                StatusServico::CanceladoPeloPrestador
            ])
            ->orderBy('s.inicio', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function buscarPorCliente(Usuario $cliente, bool $apenasAtivos = false): array
    {
        $qb = $this->createQueryBuilder('s')
            ->innerJoin('s.prestador', 'p')
            ->addSelect('p')
            ->innerJoin('s.endereco', 'e')
            ->addSelect('e')
            ->where('s.cliente = :cliente')
            ->andWhere('s.excluidoEm IS NULL')
            ->setParameter('cliente', $cliente);

        if ($apenasAtivos) {
            $qb->andWhere('s.encerramento IS NULL');
        }

        return $qb->orderBy('s.inicio', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /** @return Servico[] */
    public function buscarDashboardPrestador(Usuario $prestador): array
    {
        $limite = new \DateTimeImmutable('-30 days');

        return $this->createQueryBuilder('s')
            ->where('s.prestador = :prestador')
            ->andWhere(
                '(s.status IN (:statusAbertos) AND s.excluidoEm IS NULL) OR '
                    . '(s.status = :statusConcluido AND s.encerramento >= :dataLimite) OR '
                    . '(s.excluidoEm >= :dataLimite)'
            )
            ->setParameter('prestador', $prestador)
            ->setParameter('statusAbertos', [
                StatusServico::EmDecorrencia,
                StatusServico::SolicitacaoDeOrcamento,
            ])
            ->setParameter('statusConcluido', StatusServico::Concluido)
            ->setParameter('dataLimite', $limite)
            ->orderBy('s.inicio', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function contarServicos(?Prestador $prestador = null, ?StatusServico $status = null): int
    {
        $qb = $this->createQueryBuilder('s')
            ->select('COUNT(s.id)');
        $qb->where('s.excluidoEm IS NULL');
        if ($prestador !== null) {
            $qb->andWhere('s.prestador = :prestadorId')
                ->setParameter('prestadorId', $prestador->getId());
        }
        if ($status !== null) {
            $qb->andWhere('s.status = :status')
                ->setParameter('status', $status->value);
        }
        return (int) $qb->getQuery()->getSingleScalarResult();
    }
}
