<?php

namespace App\Repository\Localizacao;

use App\Entity\Auth\Usuario;
use App\Entity\Localizacao\Endereco;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Endereco>
 */
class EnderecoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Endereco::class);
    }

    public function buscarEnderecoCompletoPorUsuario(Usuario $usuario): array
    {
        return $this->createQueryBuilder('e')
            ->innerJoin('e.cep', 'c')
            ->addSelect('c')
            ->innerJoin('c.municipio', 'm')
            ->addSelect('m')
            ->where('e.usuario = :usuario')
            ->setParameter('usuario', $usuario)
            ->getQuery()
            ->getResult();
    }
}
