<?php

namespace App\Mapper\EditarPerfil;

use App\Entity\Servico\Prestador;
use App\Entity\Servico\Profissao;
use App\Service\PublicMediaService;

class PrestadorEditarPerfilOutputMapper
{
    public function __construct(
        private PublicMediaService $service,
    ) {}

    public function map(Prestador $pretador): array
    {
        $usuario = $pretador->getUsuario();

        return [
            'urlPerfil' => $this->service->getUrlPublica($pretador->getUsuario()->getId()),
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
