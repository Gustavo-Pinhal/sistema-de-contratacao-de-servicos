<?php

namespace App\Mapper\Servico;

use App\Entity\Servico\Servico;
use App\Enum\StatusServico;
use App\Mapper\AbstractMapper;
use App\Mapper\Cliente\EnderecosDoClienteOutputMapper;
use App\Repository\Servico\PrestadorRepository;

class ServicosOutputMapper extends AbstractMapper
{
    public function __construct(
        private PrestadorRepository $prestadorRepository,
        private EnderecosDoClienteOutputMapper $enderecoMapper,
    ) {}

    /** 
     * @param Servico $servico; 
     * @param array{completo: bool} $options;
     */
    public function map(mixed $servico, array $options = []): array
    {
        $prestador = $servico->getPrestador();
        $cliente = $servico->getCliente();
        $endereco = $servico->getEndereco();
        $possuiProjeto = !is_null($servico->getProjeto());

        $nomeComercial = $this->prestadorRepository
            ->find($prestador->getId())
            ?->getNome();

        $avaliacao = $servico->getAvaliacao();

        $servico = [
            'id' => $servico->getId(),
            'prestador' => [
                'id' => $prestador->getId(),
                'nome' => $prestador->getNome(),
                'nomeComercial' => $nomeComercial
            ],
            'endereco' => $endereco->exibir(),
            'data' => $servico->getInicio()->format('d/m/Y'),
            'status' => match ($servico->getStatus()) {
                StatusServico::SolicitacaoDeOrcamento => 'Orçamento',
                StatusServico::EmDecorrencia => 'Ativo',
                StatusServico::Concluido => 'Finalizado',
                StatusServico::CanceladoPeloCliente,
                StatusServico::CanceladoPeloPrestador => 'Cancelado',
                default => '',
            },
            'encerradoEm' => $servico->getEncerramento(),
        ];

        $servico['avaliacao'] = !is_null($avaliacao) ? [
            'nota' => $avaliacao->getNota(),
            'data' => $avaliacao->getCriadoEm(),
        ] : null;

        if (array_key_exists('completo', $options) && $options['completo']) {
            $servico['cliente'] = [
                'id' => $cliente->getId(),
                'nome' => $cliente->getNome(),
            ];
            $servico['enderecoCompleto'] = $this->enderecoMapper->map($endereco);
            $servico['projeto'] = $possuiProjeto;
        }

        return $servico;
    }
}
