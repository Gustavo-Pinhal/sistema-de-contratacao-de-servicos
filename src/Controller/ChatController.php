<?php

namespace App\Controller;

use App\Dto\Input\Chat\MensagemDto;
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
        MensagemDto $dto,
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

    #[Route('/sala/{id}/upload', methods: ['POST'])]
    public function upload(
        Sala $sala,
        Request $request,
        ChatMediaService $mediaService,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $usuario = $this->getUser();

        if (!$sala->eParticipante($usuario)) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        $file = $request->files->get('file');
        if (!$file) {
            return $this->json(['error' => 'Nenhum arquivo enviado'], Response::HTTP_BAD_REQUEST);
        }

        $caminhoS3 = $mediaService->uploadChatFile($file, $sala);

        $arquivo = new Arquivo();
        $arquivo->setCaminho($caminhoS3);
        $arquivo->setMimeType($file->getMimeType());
        $arquivo->setTamanho($file->getSize());
        $arquivo->setSala($sala);

        $entityManager->persist($arquivo);
        $entityManager->flush();

        return $this->json([
            'id' => $arquivo->getId(),
            'url_temporaria' => $mediaService->generateSecureUrl($caminhoS3),
            'mime_type' => $arquivo->getMimeType()
        ], Response::HTTP_CREATED);
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
