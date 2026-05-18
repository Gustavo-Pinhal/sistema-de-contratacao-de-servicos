<?php

namespace App\Exception\Servico;

use App\Enum\StatusServico;

class StatusInvalidoParaAcao extends \DomainException
{
    public function __construct(StatusServico $statusAtual)
    {
        parent::__construct(
            sprintf(
                'Não é possível realizar esta ação a partir do estado: "%s".',
                $statusAtual->name
            )
        );
    }
}
