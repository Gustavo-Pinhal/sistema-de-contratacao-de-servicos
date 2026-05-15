<?php

namespace App\Controller\Chat;

use App\Dto\Request\Chat\MensagemInputDto;
use App\Entity\Servico\Servico;
use App\Factory\Chat\MensagemArquivoFactory;
use App\Factory\Chat\MensagemFactory;
use App\Mapper\Chat\MensagemOutputMapper;
use App\Repository\Chat\SalaRepository;
use App\Service\ChatMediaService;
use App\Service\ChatMercureTokenService;
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

#[Route('/api/servico/{id}/chat')]
final class ChatController extends AbstractController
{
    private const TOPICO = 'http://chat/com/servico/';

    #[Route('', methods: ['GET'], name: 'app_servico_chat')]
    public function index(
        Servico $servico,
        SalaRepository $repositorio,
        MensagemOutputMapper $mapper,
        ChatMercureTokenService $mercure,
    ): JsonResponse {
        $usuario = $this->getUser();
        $sala = $repositorio->buscarSalaComMensagensPorServico($servico);

        if (!$sala->eParticipante($usuario)) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        $cliente = $servico->getCliente();
        $prestador = $servico->getPrestador();
        $mensagens = $sala->getMensagens();
        $token = $mercure->generateToken($usuario, self::TOPICO . $servico->getId());
        $topico = self::TOPICO . $servico->getId();

        return $this->json([
            'idServico' => $servico->getId(),
            'mercureToken' => $token,
            'topico' => $topico,
            'participantes' => [
                'cliente' => [
                    'id' => $cliente->getId(),
                    'nome' => $cliente->getNome(),
                ],
                'prestador' => [
                    'id' => $prestador->getId(),
                    'nome' => $prestador->getNome(),
                ],
            ],
            'messagens' => $mapper->mensagens($mensagens->toArray()),
        ], context: ['json_encode_options' => JSON_UNESCAPED_SLASHES]);
    }

    #[Route('', methods: ['POST'], name: 'app_servico_chat_enviar')]
    public function enviar(
        Servico $servico,
        #[MapRequestPayload]
        MensagemInputDto $dto,
        MensagemFactory $factory,
        EntityManagerInterface $manager,
        MensagemOutputMapper $mapper,
        SerializerInterface $serializer,
        HubInterface $hub,
    ): JsonResponse {
        $usuario = $this->getUser();
        $sala = $servico->getSala();

        if (!$sala->eParticipante($usuario)) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        $mensagem = $factory->criar($dto, $sala, $usuario);
        $manager->persist($mensagem);
        $manager->flush();

        $outputDto = $mapper->mensagem($mensagem);
        $update = new Update(
            self::TOPICO . $servico->getId(),
            $serializer->serialize($outputDto, 'json'),
            true,
        );
        $hub->publish($update);

        return $this->json(['status' => 'success'], Response::HTTP_CREATED);
    }

    #[Route('/upload', methods: ['POST'], name: 'app_servico_chat_upload')]
    public function upload(
        Servico $servico,
        Request $request,
        MensagemArquivoFactory $factory,
        ChatMediaService $mediaService,
        EntityManagerInterface $manager,
        MensagemOutputMapper $mapper,
        SerializerInterface $serializer,
        HubInterface $hub,
    ): JsonResponse {
        $usuario = $this->getUser();
        $sala = $servico->getSala();

        if (!$sala->eParticipante($usuario)) {
            return $this->json(['error' => 'Você não tem permissão para postar neste chat.'], Response::HTTP_FORBIDDEN);
        }

        $arquivo = $request->files->get('file');
        if (!$arquivo || !$arquivo->isValid()) {
            return $this->json(['error' => 'Arquivo inválido ou não enviado.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $mensagem = $factory->create($arquivo, $sala, $usuario);

            $caminho = $mediaService->uploadChatFile($arquivo, $mensagem->getArquivo());
            $mensagem->getArquivo()->setCaminho($caminho);

            $manager->persist($mensagem);
            $manager->flush();

            $dto = $mapper->mensagem($mensagem);

            try {
                $update = new Update(
                    self::TOPICO . $servico->getId(),
                    $serializer->serialize($dto, 'json', ['json_encode_options' => JSON_UNESCAPED_SLASHES]),
                    true
                );
                $hub->publish($update);
            } catch (\Exception $e) {
            }

            return $this->json($dto, Response::HTTP_CREATED);
        } catch (\Aws\S3\Exception\S3Exception $e) {
            return $this->json(['error' => 'Erro de armazenamento. Verifique sua conexão.'], 502);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Ocorreu um erro inesperado ao processar sua mensagem.'], 500);
        }
    }
}
