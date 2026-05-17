<?php

namespace App\Mapper\Servico;

use App\Mapper\AbstractMapper;
use App\Entity\Servico\Orcamento;

class OrcamentoOutputMapper extends AbstractMapper
{
    /** @param Orcamento $orcamento */
    public function map(mixed $orcamento, array $options = []): array
    {
        return [
            'criadoEm' => $orcamento->getCriadoEm()->format('Y-m-d H:i'),
            'valor' => $orcamento->getValor(),
            'observacoes' => $orcamento->getObservacoes(),
        ];
    }
}
