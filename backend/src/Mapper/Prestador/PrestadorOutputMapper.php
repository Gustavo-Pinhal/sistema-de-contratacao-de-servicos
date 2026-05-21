<?php

namespace App\Mapper\Prestador;

use App\Mapper\AbstractMapper;
use App\Entity\Servico\Prestador;
use App\Mapper\Ui\ProfissoesOutputMapper;
use App\Repository\Servico\ServicoRepository;

class PrestadorOutputMapper extends AbstractMapper
{
    public function __construct(
        private ProfissoesOutputMapper $profissaoMapper,
        private ServicoRepository $servicosRepository,
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
            'servicosConcluidos' => $this->servicosRepository->contarServicos($prestador),
        ];
    }
}
