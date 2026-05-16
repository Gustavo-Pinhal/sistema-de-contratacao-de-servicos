<?php

namespace App\Mapper\Cliente;

use App\Entity\Localizacao\Endereco;
use App\Mapper\AbstractMapper;

class EnderecosDoClienteOutputMapper extends AbstractMapper
{
    /** @param Endereco $endereco */
    public function map(mixed $endereco): array
    {
        $cep = $endereco->getCep();

        return [
            'id' => $endereco->getId(),
            'endereco' => $endereco->exibir(),
            'cep' => $cep->getNumero(),
            'municipio' => $cep->getMunicipio()->getNome(),
        ];
    }
}
