<?php

namespace App\Repository\Servico;

use App\Entity\Auth\Usuario;
use App\Entity\Servico\Prestador;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use App\Entity\Servico\Profissao;

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
     * @param int[]|Profissao[];
     */
    public function buscarPorProfissoes(array $profissoes = []): array
    {
        $qb = $this->createQueryBuilder('p')
            ->innerJoin('p.usuario', 'u')
            ->addSelect('u')
            ->leftJoin('p.profissoes', 'pr_lista')
            ->addSelect('pr_lista')
            ->where('p.excluidoEm IS NULL');

        if (!empty($profissoes)) {
            $qb->innerJoin('p.profissoes', 'pr_filtro')
                ->andWhere('pr_filtro.id IN (:profissoes)')
                ->setParameter('profissoes', $profissoes);
        }

        return $qb->orderBy('p.nome', 'ASC')
            ->getQuery()
            ->enableResultCache(300)
            ->getResult();
    }

    public function buscarServicosPorPrestador(Prestador $prestador): array
    {
        return $this->createQueryBuilder('s')
            ->leftJoin('s.cliente', 'c')
            ->leftJoin('s.endereco', 'e')
            ->addSelect('c', 'e')
            ->where('s.prestador = :prestadorId')
            ->andWhere('s.excluidoEm IS NULL')
            ->orderBy('s.inicio', 'DESC')
            ->setParameter('prestadorId', $prestador->getUsuario()->getId())
            ->getQuery()
            ->getResult();
    }
}
