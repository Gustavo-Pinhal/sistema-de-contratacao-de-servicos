<?php

namespace App\EventListener;

use App\Entity\Auth\Usuario;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;

class JWTCreatedListener
{
    public function onJWTCreated(JWTCreatedEvent $event): void
    {
        $user = $event->getUser();
        if (!$user instanceof Usuario) {
            return;
        }
        $payload = $event->getData();
        $payload['id'] = $user->getId();
        $event->setData($payload);
    }
}
