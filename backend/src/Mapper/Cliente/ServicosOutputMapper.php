<?php

namespace App\Mapper\Cliente;

use App\Entity\Servico\Servico;
use App\Enum\StatusServico;
use App\Repository\Servico\PrestadorRepository;

class ServicosOutputMapper
{
    public function __construct(
        private PrestadorRepository $prestadorRepository,
    ) {}

    /**
     * @param Servico[] $servicos;
     */
    public function map(array $servicos): array
    {
        return array_map([$this, 'servico'], $servicos);
    }

    private function servico(Servico $servico): array
    {
        $prestadorUsuario = $servico->getPrestador();
        $prestadorEntity  = $this->prestadorRepository->find($prestadorUsuario->getId());
        $nomePrestador    = $prestadorEntity ? $prestadorEntity->getNome() : $prestadorUsuario->getNome();

        return [
            'id' => (string) $servico->getId(),
            'prestador' => [
                'id'   => (string) $prestadorUsuario->getId(),
                'nome' => $nomePrestador,
            ],
            'endereco' => $servico->getEndereco()?->exibir(),
            'data'     => $servico->getInicio()->format('d/m/Y'),
            'status'   => match ($servico->getStatus()) {
                StatusServico::SolicitacaoDeOrcamento        => 'Em Orçamento',
                StatusServico::EmDecorrencia                 => 'Em Andamento',
                StatusServico::Concluido                     => 'Concluído',
                StatusServico::CanceladoPeloCliente,
                StatusServico::CanceladoPeloPrestador        => 'Cancelado',
                default                                      => '',
            },
        ];
    }
}
