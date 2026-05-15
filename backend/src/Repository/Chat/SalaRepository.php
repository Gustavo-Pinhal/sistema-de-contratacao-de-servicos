<?php

namespace App\Repository\Chat;

use App\Entity\Chat\Sala;
use App\Entity\Servico\Servico;
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

    public function buscarSalaComMensagensPorServico(Servico $servico): ?Sala
    {
        return $this->createQueryBuilder('s')
            ->leftJoin('s.prestador', 'p')
            ->addSelect('p')
            ->leftJoin('s.cliente', 'c')
            ->addSelect('c')
            ->leftJoin('s.mensagens', 'm')
            ->addSelect('m')
            ->leftJoin('m.usuario', 'mu')
            ->addSelect('mu')
            ->where('s.servico = :servico')
            ->setParameter('servico', $servico)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
