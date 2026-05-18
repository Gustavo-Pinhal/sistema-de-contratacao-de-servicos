<?php

namespace App\Mapper\Portifolio;

use App\Entity\Portifolio\Foto;
use App\Mapper\AbstractMapper;
use App\Service\ProjetoMediaService;

class ProjetoFotoOutputMapper extends AbstractMapper
{
    public function __construct(
        private ProjetoMediaService $mediaService
    ) {}

    /** @param Foto $foto */
    public function map(mixed $foto, array $options = []): array
    {
        return [
            'id' => $foto->getId()->toString(),
            'url' => $this->mediaService->gerarUrlPublica($foto->getUrlFoto()),
            'posicao' => $foto->getPosicao(),
        ];
    }
}
