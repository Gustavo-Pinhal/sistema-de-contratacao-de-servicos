<?php

namespace App\Mapper\Busca;

use App\Entity\Servico\Prestador;
use App\Mapper\AbstractMapper;
use App\Mapper\Ui\ProfissoesOutputMapper;
use App\Service\PerfilMediaService;

class BuscaPrestadorOutputMapper extends AbstractMapper
{
    public function __construct(
        private ProfissoesOutputMapper $profissaoMapper,
        private PerfilMediaService $mediaService,
    ) {}

    /** @param Prestador $prestador; */
    public function map(mixed $prestador, array $options = []): array
    {
        $usuario = ['id' => $prestador->getUsuario()->getId()];
        $profissoes = $this->profissaoMapper->mapCollection($prestador->getProfissoes()->toArray());
        return [
            'usuario' => $usuario,
            'nome' => $prestador->getNome(),
            'urlPerfil' => $this->mediaService->obterUrlFotoPerfil($prestador->getUsuario()),
            'profissoes' => $profissoes,
            'premium' => $prestador->isAtivo(),
        ];
    }
}
