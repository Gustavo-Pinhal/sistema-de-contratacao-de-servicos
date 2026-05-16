<?php

namespace App\Mapper\Cliente;

use App\Entity\Servico\Servico;
use App\Enum\StatusServico;
use App\Mapper\AbstractMapper;

class ServicosOutputMapper extends AbstractMapper
{
    /** @param Servico $servico; */
    public function map(mixed $servico): array
    {
        $prestador = $servico->getPrestador();

        return [
            'id' => $servico->getId(),
            'prestador' => [
                'id' => $prestador->getId(),
                'nome' => $prestador->getNome(),
            ],
            'endereco' => $servico->getEndereco()->exibir(),
            'data' => $servico->getInicio()->format('d/m/Y'),
            'status' => match ($servico->getStatus()) {
                StatusServico::SolicitacaoDeOrcamento => 'Orçamento',
                StatusServico::EmDecorrencia => 'Ativo',
                StatusServico::Concluido => 'Finalizado',
                StatusServico::CanceladoPeloCliente,
                StatusServico::CanceladoPeloPrestador => 'Cancelado',
                default => '',
            },
        ];
    }
}
