<?php

namespace App\Service;

use App\Entity\Auth\Usuario;
use App\Entity\Chat\Sala;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key\InMemory;

class ChatMercureTokenService
{
    private const TOPICO_BASE = 'https://maridodealuguel.com/chat/sala/';
    private const ISSUED = 'https://maridodealuguel.com';

    public function __construct(
        private readonly string $mercureSecret
    ) {}

    public function generateToken(Usuario $usuario, Sala $sala): string
    {
        $config = Configuration::forSymmetricSigner(
            new Sha256(),
            InMemory::plainText($this->mercureSecret),
        );

        $topico = self::TOPICO_BASE . $sala->getId();
        $agora = new \DateTimeImmutable();

        $token = $config->builder()
            ->issuedBy(self::ISSUED)
            ->relatedTo((string) $usuario->getId())
            ->issuedAt($agora)
            ->expiresAt($agora->modify('+1 day'))
            ->withClaim('mercure', [
                'subscribe' => [$topico]
            ])
            ->getToken($config->signer(), $config->signingKey());

        return $token->toString();
    }
}