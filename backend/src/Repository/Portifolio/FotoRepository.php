<?php

namespace App\Repository\Portifolio;

use App\Entity\Portifolio\Foto;
use App\Entity\Portifolio\Projeto;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Foto>
 */
class FotoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Foto::class);
    }

    public function buscarMaiorPosicaoPorProjeto(Projeto $projeto): int
    {
        return (int) $this->createQueryBuilder('f')
            ->select('MAX(f.posicao)')
            ->where('f.projeto = :projeto')
            ->setParameter('projeto', $projeto)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
