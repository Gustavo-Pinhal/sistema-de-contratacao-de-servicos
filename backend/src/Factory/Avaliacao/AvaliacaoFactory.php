<?php

namespace App\Factory\Avaliacao;

use App\Dto\Request\Avaliacao\AvaliacaoInputDto;
use App\Entity\Avaliacao\Avaliacao;
use App\Entity\Servico\Servico;

class AvaliacaoFactory
{
    public function fromDto(AvaliacaoInputDto $dto, Servico $servico): Avaliacao
    {
        return new Avaliacao(
            $servico,
            $dto->nota,
            $dto->comentario,
        );
    }
}
