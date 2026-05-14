<?php

namespace App\Mapper\Busca;

use App\Entity\Servico\Prestador;
use App\Mapper\Ui\ProfissoesOutputMapper;
use App\Service\PublicMediaService;

class BuscaPrestadorOutputMapper
{
    public function __construct(
        private ProfissoesOutputMapper $profissaoMapper,
        private PublicMediaService $mediaService,
    ) {}

    /**
     * @param Prestador[] $prestadores;
     */
    public function map(array $prestadores): array
    {
        return array_map([$this, 'prestador'], $prestadores);
    }

    private function prestador(Prestador $prestador): array
    {
        $usuario = ['id' => $prestador->getUsuario()->getId()];
        $profissoes = $this->profissaoMapper->map($prestador->getProfissoes()->toArray());
        return [
            'usuario' => $usuario,
            'nome' => $prestador->getNome(),
            'urlPerfil' => $this->mediaService->getUrlPublica($prestador->getUsuario()->getId()),
            'profissoes' => $profissoes,
        ];
    }
}
