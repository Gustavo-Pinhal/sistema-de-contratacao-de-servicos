<?php

namespace App\Mapper\AreaPrestador;

use App\Entity\Servico\Servico;
use App\Enum\StatusServico;

class DashboardOutputMapper
{
    /** @param Servico[] $servicos */
    public function map(array $servicos): array
    {
        $data = [
            'ativos' => [],
            'pendentes' => [],
            'concluidos' => [],
            'cancelados' => [],
        ];

        foreach ($servicos as $servico) {
            $item = $this->servico($servico);

            match ($servico->getStatus()) {
                StatusServico::EmDecorrencia => $data['ativos'][] = $item,
                StatusServico::SolicitacaoDeOrcamento => $data['pendentes'][] = $item,
                StatusServico::Concluido => $data['concluidos'][] = $item,
                StatusServico::CanceladoPeloCliente,
                StatusServico::CanceladoPeloPrestador => $data['cancelados'][] = $item,
                default => null,
            };
        }

        return $data;
    }

    private function servico(Servico $servico): array
    {
        $cliente = $servico->getCliente();
        $prestador = $servico->getPrestador();

        return [
            'id' => $servico->getId(),
            'inicio' => $servico->getInicio()->format('d/m/Y'),
            'encerramento' => $servico->getEncerramento()?->format('d/m/Y'),
            'status' => $servico->getStatus()->name,
            'cliente' => $cliente ? [
                'id' => $cliente->getId(),
                'nome' => $cliente->getNome(),
            ] : null,
            'prestador' => $prestador ? [
                'id' => $prestador->getId(),
                'nome' => $prestador->getNome(),
            ] : null,
            'endereco' => $servico->getEndereco()->exibir(),
        ];
    }
}
