<?php

namespace App\Mapper\AreaPrestador;

use App\Mapper\AbstractMapper;
use App\Entity\Notificacao\Notificacao;

class NotificacaoOutputMapper extends AbstractMapper
{
    /** @param Notificacao $notificacao; */
    public function map(mixed $notificacao, array $options = []): array
    {
        $remetente = $notificacao->getSender();

        return [
            'id' => $notificacao->getId(),
            'remetente' => [
                'id' => $remetente->getId(),
                'nome' => $remetente->getNome(),
                'email' => $remetente->getEmail(),
            ],
            'conteudo' => $notificacao->getMessage(),
            'criadoEm' => $notificacao->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }
}
