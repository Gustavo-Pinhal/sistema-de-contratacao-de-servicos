<?php

namespace App\Factory\Servico;

use App\Dto\Request\Prestador\SolicitarOrcamentoInputDto;
use App\Entity\Auth\Usuario;
use App\Entity\Localizacao\Endereco;
use App\Entity\Servico\Cliente;
use App\Entity\Servico\Prestador;
use App\Entity\Servico\Servico;
use App\Enum\StatusServico;
use App\Repository\Localizacao\EnderecoRepository;
use App\Service\Localizacao\CepService;

class ServicoFactory
{
    public function __construct(
        private CepService $cepService,
        private EnderecoRepository $enderecoRepository,
    ) {}

    public function aPartirDeSolicitacaoOrcamento(
        SolicitarOrcamentoInputDto $dto,
        Prestador $prestador,
        Cliente $cliente,
        Usuario $usuarioCliente,
    ): Servico {
        $endereco = null;
        if ($dto->idEndereco) {
            $endereco = $this->enderecoRepository->find($dto->idEndereco);
        }

        if (is_null($endereco)) {
            $cep = $this->cepService->buscarOuCadastrar($dto->cep);

            $endereco = new Endereco();
            $endereco->setCep($cep);
            $endereco->setRua($dto->rua);
            $endereco->setBairro($dto->bairro);
            $endereco->setNumero($dto->numero);
            $endereco->setComplemento($dto->complemento);
            $endereco->setUsuario($usuarioCliente);
        }

        $servico = new Servico();
        $servico->setCliente($cliente);
        $servico->setPrestador($prestador);
        $servico->setStatus(StatusServico::SolicitacaoDeOrcamento);
        $servico->setEndereco($endereco);

        return $servico;
    }
}
