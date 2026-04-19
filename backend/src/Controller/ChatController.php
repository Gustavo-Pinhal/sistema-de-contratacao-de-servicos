<?php

namespace App\Controller;

use App\Dto\Input\Chat\MensagemDto;
use App\Entity\Chat\Sala;
use App\Factory\Chat\MensagemArquivoFactory;
use App\Mapper\Chat\MensagemInputMapper;
use App\Mapper\Chat\MensagemOutputMapper;
use App\Repository\Chat\SalaRepository;
use App\Service\ChatMercureTokenService;
use App\Service\ChatMediaService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
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

    #[Route('/{id}', methods: ['GET'])]
    public function index(
        Sala $sala,
        MensagemOutputMapper $mapper,
        SalaRepository $repositorio,
        ChatMercureTokenService $mercureToken,
    ): JsonResponse {
        $usuario = $this->getUser();

        if (!$sala->eParticipante($usuario)) {
            return $this->json(['error' => 'Acesso negado'], 403);
        }

        ['cliente' => $nomeCliente, 'prestador' => $nomePrestador] = $repositorio->findParticipantesNomes($sala);

        return $this->json([
            'id_sala' => $sala->getId(),
            'topico' => self::TOPICO . $sala->getId(),
            'mercure_token' => $mercureToken->generateToken($usuario, $sala),
            'messages' => $mapper->toCollection($sala->getMensagens()),
            'participantes' => [
                [
                    'nome' => $nomeCliente,
                    'id' => $sala->getCliente()->getId(),
                ],
                [
                    'nome' => $nomePrestador,
                    'id' => $sala->getPrestador()->getId(),
                ],
            ],
        ], Response::HTTP_OK, [], ['json_encode_options' => JSON_UNESCAPED_SLASHES]);
    }

    #[Route('/{id}', methods: ['POST'])]
    public function enviar(
        Sala $sala,
        #[MapRequestPayload]
        MensagemDto $dto,
        HubInterface $hub,
        EntityManagerInterface $entityManager,
        MensagemInputMapper $inputMapper,
        MensagemOutputMapper $outputMapper,
        SerializerInterface $serializer,
    ): JsonResponse {
        $usuario = $this->getUser();

        if (!$sala->eParticipante($usuario)) {
            return $this->json(['error' => 'Você não tem permissão para enviar mensagens nesta sala.'], 403);
        }

        $mensagem = $inputMapper->toEntity($dto, $sala, $usuario);

        $entityManager->persist($mensagem);
        $entityManager->flush();

        $outputDto = $outputMapper->toDto($mensagem);
        $update = new Update(
            self::TOPICO . $sala->getId(),
            $serializer->serialize($outputDto, 'json'),
            true,
        );

        $hub->publish($update);

        return $this->json($outputDto, Response::HTTP_CREATED);
    }

    #[Route('/{id}/upload', methods: ['POST'])]
    public function upload(
        Sala $sala,
        Request $request,
        ChatMediaService $mediaService,
        EntityManagerInterface $entityManager,
        MensagemOutputMapper $mapper,
        MensagemArquivoFactory $factory,
        HubInterface $hub,
        SerializerInterface $serializer,
    ): JsonResponse {
        $usuario = $this->getUser();

        if (!$sala->eParticipante($usuario)) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        $file = $request->files->get('file');
        if (!$file) {
            return $this->json(['error' => 'Nenhum arquivo enviado'], Response::HTTP_BAD_REQUEST);
        }

        $mensagem = $factory->create($file, $sala, $usuario);

        $caminhoS3 = $mediaService->uploadChatFile($file, $mensagem->getArquivo());
        $mensagem->getArquivo()->setCaminho($caminhoS3);

        $entityManager->persist($mensagem);
        $entityManager->flush();

        $dto = $mapper->toDto($mensagem);
        $update = new Update(
            self::TOPICO . $sala->getId(),
            $serializer->serialize($dto, 'json'),
            true,
        );

        $hub->publish($update);

        return $this->json($dto, Response::HTTP_CREATED, [], ['json_encode_options' => JSON_UNESCAPED_SLASHES]);
    }
}
