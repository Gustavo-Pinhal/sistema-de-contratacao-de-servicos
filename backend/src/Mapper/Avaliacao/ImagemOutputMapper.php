<?php

namespace App\Mapper\Avaliacao;

use App\Mapper\AbstractMapper;
use App\Service\AvaliacaoMediaService;
use App\Entity\Avaliacao\Imagem;

class ImagemOutputMapper extends AbstractMapper
{
    public function __construct(
        private AvaliacaoMediaService $mediaService,
    ) {}

    /** @param Imagem $data */
    public function map(mixed $data, array $options = []): array
    {
        $url = $this->mediaService->obterUrlFoto($data);
        return [
            'id' => $data->getId(),
            'url' => $url,
        ];
    }
}
