<?php

namespace App\Mapper\Servico;

use App\Mapper\AbstractMapper;
use App\Entity\Servico\Agendamento;
use App\Enum\StatusAgendamento;

class AgendamentosOutputMapper extends AbstractMapper
{
    /** @param Agendamento $agendamento */
    public function map(mixed $agendamento, array $options = []): array
    {
        $status = match ($agendamento->getStatus()) {
            StatusAgendamento::Proposta => 'proposta',
            StatusAgendamento::Confirmado => 'confirmado',
            StatusAgendamento::Recusado => 'recusado',
        };

        return [
            'id' => $agendamento->getId(),
            'criadoEm' => $agendamento->getData()->format('Y-m-d H:i'),
            'data' => $agendamento->getData()->format('d/m/Y \à\s H:i'),
            'status' => $status,
        ];
    }
}
