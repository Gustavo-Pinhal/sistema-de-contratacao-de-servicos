<?php

namespace App\Factory\Portifolio;

use App\Dto\Request\Portifolio\ProjetoInputDto;
use App\Entity\Portifolio\Projeto;
use App\Entity\Servico\Servico;
use App\Repository\Portifolio\PortifolioRepository;
use App\Repository\Portifolio\ProjetoRepository;

class ProjetoFactory
{
    public function __construct(
        private ProjetoRepository $projetoRepository,
        private PortifolioRepository $portifolioRepository
    ) {}

    public function fromDto(ProjetoInputDto $dto, Servico $servico): Projeto
    {
        $portifolio = $this->portifolioRepository->find($servico->getPrestador()->getId());

        $maiorPosicao = $this->projetoRepository->buscarMaiorPosicaoPorPortifolio($portifolio);

        return new Projeto(
            $portifolio,
            $servico,
            $dto->titulo,
            $dto->descricao,
            $servico->getValorTotal(),
            $dto->exibirValor,
            $servico->getEncerramento(),
            $dto->exibirConcluidoEm,
            $maiorPosicao,
        );
    }
}
