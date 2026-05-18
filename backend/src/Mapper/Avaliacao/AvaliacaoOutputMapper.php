<?php

namespace App\Mapper\Avaliacao;

use App\Mapper\AbstractMapper;
use App\Entity\Avaliacao\Avaliacao;

class AvaliacaoOutputMapper extends AbstractMapper
{
    public function __construct(
        private ImagemOutputMapper $imagemMapper,
    ) {}

    /** @param Avaliacao $avaliacao */
    public function map(mixed $avaliacao, array $options = []): array
    {
        $imagens = $avaliacao->getImagens();

        return [
            'id' => $avaliacao->getId(),
            'data' => $avaliacao->getCriadoEm(),
            'nota' => $avaliacao->getNota(),
            'comentario' => $avaliacao->getComentario(),
            'imagens' => $this->imagemMapper->mapCollection($imagens),
        ];
    }
}
