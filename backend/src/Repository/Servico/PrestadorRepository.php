<?php

namespace App\Repository\Servico;

use App\Entity\Servico\Prestador;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Prestador>
 */
class PrestadorRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Prestador::class);
    }

    /**
     * @param \App\Entity\Servico\Profissao[] $profissoes
     * @return Prestador[]
     */
    public function buscarPorProfissoes(array $profissoes = []): array
    {
        $qb = $this->createQueryBuilder('p')
            ->innerJoin('p.usuario', 'u')
            ->addSelect('u')
            ->where('p.excluidoEm IS NULL')
            ->andWhere('p.ativo = true');

        if (!empty($profissoes)) {
            $qb->innerJoin('p.profissoes', 'pr')
                ->andWhere('pr IN (:profissoes)')
                ->setParameter('profissoes', $profissoes);
        }

        return $qb->orderBy('p.nome', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
