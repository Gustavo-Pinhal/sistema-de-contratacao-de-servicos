<?php

namespace App\Repository\Notificacao;

use App\Entity\Auth\Usuario;
use App\Entity\Notificacao\Notificacao;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Notificacao>
 */
class NotificacaoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Notificacao::class);
    }

    public function findEnviadasENaoVisualizadas(Usuario $empresa): array
    {
        return $this->createQueryBuilder('n')
            ->innerJoin('n.receiver', 'r')
            ->where('n.sender = :empresa')
            ->andWhere('n.viewedAt IS NULL')
            ->andWhere('n.deletedAt IS NULL')
            ->setParameter('empresa', $empresa)
            ->orderBy('n.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
