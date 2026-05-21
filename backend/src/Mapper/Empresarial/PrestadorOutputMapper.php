<?php

namespace App\Mapper\Empresarial;

use App\Mapper\AbstractMapper;
use App\Entity\Servico\Prestador;

class PrestadorOutputMapper extends AbstractMapper
{
    /** @param Prestador $prestador */
    public function map(mixed $prestador, array $options = []): array
    {
        return [
            'id' => $prestador->getId(),
            'nomeComercial' => $prestador->getNome(),
        ];
    }
}
