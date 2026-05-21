<?php

namespace App\Mapper\Empresarial;

use App\Mapper\AbstractMapper;
use App\Entity\Notificacao\Notificacao;

class NotificacaoOutputMapper extends AbstractMapper
{
    /** @param Notificacao $notificacao */
    public function map(mixed $notificacao, array $options = []): array
    {
        return [
            'id' => $notificacao->getId(),
            'destinatario' => [
                'id' => $notificacao->getReceiver()->getId(),
                'nome' => $notificacao->getReceiver()->getNome(),
                'email' => $notificacao->getReceiver()->getEmail(),
            ],
            'criadoEm' => $notificacao->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }
}
