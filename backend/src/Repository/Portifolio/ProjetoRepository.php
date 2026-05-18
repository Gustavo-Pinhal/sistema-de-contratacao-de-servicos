<?php

namespace App\Repository\Portifolio;

use App\Entity\Portifolio\Portifolio;
use App\Entity\Portifolio\Projeto;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Projeto>
 */
class ProjetoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Projeto::class);
    }

    public function buscarMaiorPosicaoPorPortifolio(Portifolio $portifolio): int
    {
        return (int) $this->createQueryBuilder('p')
            ->select('MAX(p.posicao)')
            ->where('p.portifolio = :portifolio')
            ->setParameter('portifolio', $portifolio)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
