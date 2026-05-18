<?php

namespace App\Controller\Servico;

use App\Dto\Request\Avaliacao\AvaliacaoInputDto;
use App\Entity\Servico\Servico;
use App\Factory\Avaliacao\AvaliacaoFactory;
use App\Service\AvaliacaoMediaService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Auth\Usuario;
use App\Mapper\Avaliacao\AvaliacaoOutputMapper;
use App\Mapper\Avaliacao\ImagemOutputMapper;
use App\Repository\Avaliacao\AvaliacaoRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\File\UploadedFile;

#[Route('/servico/{servico}/avaliacao')]
final class AvaliacaoController extends AbstractController
{
    #[Route('', methods: ['GET'], name: 'app_servico_avaliacao_get')]
    public function index(
        Servico $servico,
        AvaliacaoRepository $repository,
        AvaliacaoOutputMapper $mapper,
    ): JsonResponse {
        $avaliacao = $repository->buscarAvaliacaoComImagens($servico);

        if (!$avaliacao) {
            return $this->json(['error' => 'Este serviço ainda não foi avaliado.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json(
            $mapper->map($avaliacao),
            context: ['json_encode_options' => JSON_UNESCAPED_SLASHES]
        );
    }

    #[Route('', methods: ['POST'], name: 'app_servico_avaliacao_criar')]
    public function criar(
        Servico $servico,
        #[MapRequestPayload] AvaliacaoInputDto $dto,
        AvaliacaoFactory $factory,
        EntityManagerInterface $manager,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        if (!$usuario->getId()->equals($servico->getCliente()->getId())) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        $manager->persist($factory->fromDto($dto, $servico));
        $manager->flush();

        return $this->json(['success' => true]);
    }

    #[Route('/upload', methods: ['POST'], name: 'app_servico_avaliacao_upload')]
    public function upload(
        Servico $servico,
        Request $request,
        AvaliacaoMediaService $mediaService,
        EntityManagerInterface $manager,
        ImagemOutputMapper $mapper,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        if (!$usuario->getId()->equals($servico->getCliente()->getId())) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        $avaliacao = $servico->getAvaliacao();
        if (!$avaliacao) {
            return $this->json(['error' => 'Avaliação não encontrada'], Response::HTTP_NOT_FOUND);
        }

        $arquivos = $request->files->get('imagens');
        if (empty($arquivos)) {
            return $this->json(['error' => 'Nenhum arquivo enviado.'], Response::HTTP_BAD_REQUEST);
        }

        if ($arquivos instanceof UploadedFile) {
            $arquivos = [$arquivos];
        }

        $imagensSalvas = [];

        try {
            foreach ($arquivos as $arquivo) {
                if (!$arquivo instanceof UploadedFile) {
                    continue;
                }

                $imagem = $mediaService->uploadFotoAvaliacao($arquivo, $servico->getAvaliacao());
                $manager->persist($imagem);

                $imagensSalvas[] = $imagem;
            }

            $manager->flush();
        } catch (\InvalidArgumentException $exception) {
            return $this->json([
                'error' => 'Erro de Validação',
                'message' => $exception->getMessage()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->json([
            'success' => true,
            'imagens' => $mapper->mapCollection($imagensSalvas),
        ]);
    }
}
