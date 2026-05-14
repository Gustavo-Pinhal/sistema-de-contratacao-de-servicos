<?php

namespace App\Mapper\Busca;

use App\Entity\Servico\Prestador;
use App\Entity\Servico\Profissao;

class BuscaPrestadorOutputMapper
{
    /**
     * @param Prestador[] $prestadores;
     */
    public function map(array $prestadores): array
    {
        return array_map([$this, 'prestador'], $prestadores);
    }

    private function prestador(Prestador $prestador): array
    {
        $usuario = [
            'id' => $prestador->getUsuario()->getId(),
        ];

        $profissoes = array_map(fn(Profissao $profissao) => [
            'id' => $profissao->getId(),
            'descricao' => $profissao->getDescricao(),
        ], $prestador->getProfissoes()->toArray());

        return [
            'usuario' => $usuario,
            'nome' => $prestador->getNome(),
            'urlPerfil' => '',
            'profissoes' => $profissoes,
        ];
    }
}
