<?php

namespace App\Repository\Chat;

use App\Entity\Chat\Sala;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Sala>
 */
class SalaRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Sala::class);
    }

    /**
     * Retorna um array com os nomes do cliente e do prestador da sala.
     * * @return array{cliente: string, prestador: string}|null
     */
    public function findParticipantesNomes(Sala $sala): ?array
    {
        return $this->createQueryBuilder('s')
            ->select('c.nome as cliente', 'p.nome as prestador')
            ->join('s.cliente', 'c')
            ->join('s.prestador', 'p')
            ->where('s.id = :id')
            ->setParameter('id', $sala->getId())
            ->getQuery()
            ->getOneOrNullResult();
    }
}
