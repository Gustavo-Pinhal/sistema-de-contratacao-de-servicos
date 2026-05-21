<?php

namespace App\Factory\Servico;

use App\Dto\Request\Servico\AgendamentoInputDto;
use App\Entity\Servico\Agendamento;
use App\Entity\Servico\Servico;
use DateTime;

class AgendamentoFactory
{
    public function fromDto(AgendamentoInputDto $dto, Servico $servico): Agendamento
    {
        $data = new DateTime($dto->data);

        return new Agendamento(
            $servico,
            $data,
            $dto->observacoes,
        );
    }
}
