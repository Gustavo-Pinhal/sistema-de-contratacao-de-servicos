<?php

declare(strict_types=1);

namespace App\Factory\Notificacao;

use App\Entity\Auth\Usuario;
use App\Entity\Notificacao\Notificacao;

class NotificacaoFactory
{
    public function criarConviteFiliacao(
        Usuario $receiver,
        string $companyName,
        ?Usuario $sender = null
    ): Notificacao {
        $message = [
            'type' => 'filiationInvitation',
            'companyName' => $companyName,
        ];

        return new Notificacao($receiver, $message, $sender);
    }
}
