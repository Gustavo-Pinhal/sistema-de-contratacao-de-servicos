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

        $data = [
            'id' => $avaliacao->getId(),
            'data' => $avaliacao->getCriadoEm(),
            'nota' => $avaliacao->getNota(),
            'comentario' => $avaliacao->getComentario(),
            'imagens' => $this->imagemMapper->mapCollection($imagens),
        ];

        if (array_key_exists('servico', $options) && $options['servico']) {
            $servico = $avaliacao->getServico();

            $data['servico'] = [
                'data' => $servico->getEncerramento(),
                'total' => $servico->getValorTotal(),
            ];
        }

        return $data;
    }
}
