<?php

namespace App\Mapper\Cliente;

use App\Entity\Servico\Servico;
use App\Enum\StatusServico;

class ServicosOutputMapper
{
    /**
     * @param Servicos[] $servicos;
     */
    public function map(array $servicos): array
    {
        return array_map([$this, 'servico'], $servicos);
    }

    private function servico(Servico $servico): array
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
