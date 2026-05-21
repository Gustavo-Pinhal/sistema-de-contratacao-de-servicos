<?php

namespace App\Repository\Servico;

use App\Entity\Servico\Profissao;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ProfissaoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Profissao::class);
    }

    public function obterTodos(bool $excluidos = false): array
    {
        $qb = $this->createQueryBuilder('p');

        if (!$excluidos) {
            $qb->andWhere('p.excluidoEm IS NULL')
                ->orderBy('p.descricao', 'ASC');
        } else {
            $qb->andWhere('p.excluidoEm IS NOT NULL')
                ->orderBy('p.excluidoEm', 'DESC');
        }

        return $qb->getQuery()->getResult();
    }
}
