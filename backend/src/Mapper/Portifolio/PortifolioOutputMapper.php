<?php

namespace App\Mapper\Portifolio;

use App\Entity\Portifolio\Portifolio;
use App\Mapper\AbstractMapper;

class PortifolioOutputMapper extends AbstractMapper
{
    public function __construct(
        private ProjetoOutputMapper $projetoMapper
    ) {}

    /** @param Portifolio $portifolio */
    public function map(mixed $portifolio, array $options = []): array
    {
        return [
            'id' => $portifolio->getId()->toString(),
            'biografia' => $portifolio->getBiografia(),
            'servicosConcluidos' => $portifolio->getServicosConcluidos(),
            'projetos' => $this->projetoMapper->mapCollection($portifolio->getProjetos()->toArray()),
        ];
    }
}