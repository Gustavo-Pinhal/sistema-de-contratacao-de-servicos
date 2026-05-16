<?php

namespace App\Repository\Servico;

use App\Entity\Auth\Usuario;
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
}
