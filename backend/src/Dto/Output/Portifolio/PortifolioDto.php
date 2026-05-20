<?php

namespace App\Dto\Output\Portifolio;

use App\Entity\Portifolio\Portifolio;
use App\Entity\Portifolio\Projeto;

readonly class PortifolioDto
{
    private function __construct(
        readonly public string $biografia,
        readonly public int $servicos_concluidos,
        readonly public array $projetos,
    ) {}

    public static function fromEntity(Portifolio $portifolio): self
    {
        $projetos = array_map(
            fn(Projeto $projeto) => ProjetoDto::fromEntity($projeto),
            $portifolio->getProjetos()->toArray(),
        );

        return new self(
            $portifolio->getBiografia(),
            $portifolio->getServicosConcluidos(),
            $projetos,
        );
    }
}
