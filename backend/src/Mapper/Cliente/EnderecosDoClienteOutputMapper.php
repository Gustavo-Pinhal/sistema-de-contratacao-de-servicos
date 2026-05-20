<?php

namespace App\Mapper\Cliente;

use App\Entity\Localizacao\Endereco;

class EnderecosDoClienteOutputMapper
{
    public function map(array $enderecos): array
    {
        return array_map([$this, 'endereco'], $enderecos);
    }

    private function endereco(Endereco $endereco): array
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
