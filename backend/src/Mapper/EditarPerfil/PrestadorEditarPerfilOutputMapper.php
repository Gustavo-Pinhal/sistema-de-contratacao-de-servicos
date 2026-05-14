<?php

namespace App\Mapper\EditarPerfil;

use App\Entity\Servico\Prestador;
use App\Entity\Servico\Profissao;

class PrestadorEditarPerfilOutputMapper
{
    public function map(Prestador $pretador): array
    {
        $usuario = $pretador->getUsuario();

        return [
            'urlPerfil' => '',
            'nome' => $usuario->getNome(),
            'nomeProfissional' => $pretador->getNome(),
            'email' => $usuario->getEmail(),
            'profissoes' => array_map(
                fn(Profissao $profissao) => $profissao->getId(),
                $pretador->getProfissoes()->toArray()
            ),
            'cep' => $pretador->getCep()->getNumero(),
            'numero' => '',
        ];
    }
}
