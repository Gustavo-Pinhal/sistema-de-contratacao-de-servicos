<?php

namespace App\Factory\Servico;

use App\Dto\Request\Servico\OrcamentoInputDto;
use App\Entity\Servico\Orcamento;
use App\Entity\Servico\Servico;

class OrcamentoFactory
{
    public function fromDto(OrcamentoInputDto $dto, Servico $servico): Orcamento
    {
        return new Orcamento(
            $servico,
            $dto->descricao,
            $dto->valor,
            $dto->observacoes,
        );
    }
}
