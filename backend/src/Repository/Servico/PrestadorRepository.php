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
            ->where('p.excluidoEm IS NULL')
            ->andWhere('p.ativo = true');

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

    public function buscarParaEdicaoDePerfil(Usuario $usuario): ?Prestador
    {
        return $this->createQueryBuilder('p')
            ->innerJoin('p.usuario', 'u')
            ->addSelect('u')
            ->innerJoin('p.cep', 'c')
            ->addSelect('c')
            ->leftJoin('p.profissoes', 'pr')
            ->addSelect('pr')
            ->where('p.usuario = :usuario')
            ->setParameter('usuario', $usuario)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
