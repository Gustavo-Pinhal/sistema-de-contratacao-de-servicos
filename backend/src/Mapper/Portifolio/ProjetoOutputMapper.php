<?php

namespace App\Mapper\Portifolio;

use App\Entity\Portifolio\Projeto;
use App\Mapper\AbstractMapper;

class ProjetoOutputMapper extends AbstractMapper
{
    public function __construct(
        private ProjetoFotoOutputMapper $fotoMapper
    ) {}

    /** @param Projeto $projeto */
    public function map(mixed $projeto, array $options = []): array
    {
        return [
            'id' => $projeto->getId()->toString(),
            'titulo' => $projeto->getTitulo(),
            'descricao' => $projeto->getDescricao(),
            'regiao' => $projeto->getRegiao(),
            'valor' => $projeto->isExibirValor() ? $projeto->getValor() : null,
            'exibirValor' => $projeto->isExibirValor(),
            'concluidoEm' => $projeto->isExibirConcluidoEm() ? $projeto->getConcluidoEm()->format(\DateTimeInterface::ATOM) : null,
            'exibirConcluidoEm' => $projeto->isExibirConcluidoEm(),
            'posicao' => $projeto->getPosicao(),
            'fotos' => $this->fotoMapper->mapCollection($projeto->getFotos()->toArray()),
        ];
    }
}
