<?php

namespace App\Repository\Servicos;

use App\Entity\Servicos\Profissao;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ProfissaoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Profissao::class);
    }

    public function obterAtivos(): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.excluidoEm IS NULL')
            ->orderBy('p.descricao', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function obterExcluidos(): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.excluidoEm IS NOT NULL')
            ->orderBy('p.excluidoEm', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
