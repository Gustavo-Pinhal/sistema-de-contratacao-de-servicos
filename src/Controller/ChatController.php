<?php

namespace App\Controller;

use App\Dto\Request\Chat\MensagemInputDto;
use App\Entity\Auth\Usuario;
use App\Entity\Chat\Mensagem;
use App\Entity\Chat\Sala;
use Doctrine\ORM\EntityManagerInterface;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key\InMemory;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/chat')]
final class ChatController extends AbstractController
{
    private const TOPICO = 'http://chat/com/sala/';

    #[Route('/sala/{id}', methods: ['GET'])]
    public function index(
        Sala $sala,
    ): JsonResponse {
        $usuario = $this->getUser();

        if (!$sala->eParticipante($usuario)) {
            return $this->json(['error' => 'Acesso negado'], 403);
        }

        $mensagens = $sala->getMensagens();
        $topico = self::TOPICO . $sala->getId();

        $mercureToken = $this->createMercureCookie($usuario, $sala);

        return $this->json([
            'id_sala' => $sala->getId(),
            'topico' => $topico,
            'mercure_token' => $mercureToken,
            'messages' => $mensagens,
        ], Response::HTTP_OK, [], ['groups' => 'chat:read']);
    }

    #[Route('/sala/{id}', methods: ['POST'])]
    public function enviar(
        Sala $sala,
        #[MapRequestPayload]
        MensagemInputDto $dto,
        HubInterface $hub,
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
    ): JsonResponse {
        $usuario = $this->getUser();

        if (!$sala->eParticipante($usuario)) {
            return $this->json(['error' => 'Você não tem permissão para enviar mensagens nesta sala.'], 403);
        }

        $mensagem = Mensagem::fromDto($dto);
        $mensagem->setSala($sala);
        $mensagem->setUsuario($usuario);

        $entityManager->persist($mensagem);
        $entityManager->flush();

        $topico = self::TOPICO . $sala->getId();
        $updateData = $serializer->serialize($mensagem, 'json', ['groups' => 'chat:read']);

        $update = new Update(
            $topico,
            $updateData,
            true,
        );

        $hub->publish($update);

        return $this->json($mensagem, Response::HTTP_CREATED, [], ['groups' => 'chat:read']);
    }

    private function createMercureCookie(
        Usuario $usuario,
        Sala $salaPermitida,
    ): string {
        $config = Configuration::forSymmetricSigner(
            new Sha256(),
            InMemory::plainText($this->getParameter('MERCURE_JWT_SECRET')),
        );

        $topico = self::TOPICO . $salaPermitida->getId();
        $hora = new \DateTimeImmutable();

        $token = $config->builder()
            ->issuedBy('http://maridodealuguel.com')
            ->relatedTo((string) $usuario->getId())
            ->issuedAt($hora)
            ->expiresAt($hora->modify('+1 day'))
            ->withClaim('mercure', ['subscribe' => [$topico]])
            ->getToken($config->signer(), $config->signingKey());

        return $token->toString();
    }
}
