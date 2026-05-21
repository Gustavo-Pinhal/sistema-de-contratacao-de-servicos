<?php

namespace App\Mapper\Admin;

use App\Mapper\AbstractMapper;
use App\Entity\Servico\Prestador;

class PrestadorOutputMapper extends AbstractMapper
{
    /** @param Prestador $prestador */
    public function map(mixed $prestador, array $options): array
    {
        return [
            'id' => $prestador->getId(),
            'nome' => $prestador->getNome(),
            'premium' => $prestador->isAtivo(),
        ];
    }
}
