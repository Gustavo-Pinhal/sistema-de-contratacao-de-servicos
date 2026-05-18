<?php

namespace App\Repository\Avaliacao;

use App\Entity\Avaliacao\Avaliacao;
use App\Entity\Servico\Servico;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Avaliacao>
 */
class AvaliacaoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Avaliacao::class);
    }

    public function buscarAvaliacaoComImagens(Servico $servico): ?Avaliacao
    {
        return $this->createQueryBuilder('a')
            ->addSelect('i')
            ->leftJoin('a.imagens', 'i')
            ->where('a.servico = :servico')
            ->setParameter('servico', $servico)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
