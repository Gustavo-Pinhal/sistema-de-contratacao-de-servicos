<?php

namespace App\Mapper\Prestador;

use App\Mapper\AbstractMapper;
use App\Entity\Servico\Prestador;
use App\Mapper\Ui\ProfissoesOutputMapper;

class PrestadorOutputMapper extends AbstractMapper
{
    public function __construct(
        private ProfissoesOutputMapper $profissaoMapper,
    ) {}

    /** @param Prestador $prestador */
    public function map(mixed $prestador, array $options = []): array
    {
        return [
            'nomeComercial' => $prestador->getNome(),
            'nome' => $prestador->getUsuario()->getNome(),
            'premium' => $prestador->isAtivo(),
            'municipio' => $prestador->getCep()->getMunicipio()->getNome(),
            'profissoes' => $this->profissaoMapper->mapCollection($prestador->getProfissoes()->toArray()),
        ];
    }
}
