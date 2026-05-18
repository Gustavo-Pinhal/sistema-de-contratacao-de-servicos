<?php

namespace App\Controller\Portifolio;

use App\Entity\Auth\Usuario;
use App\Entity\Portifolio\Projeto;
use App\Factory\Portifolio\FotoFactory;
use App\Repository\Portifolio\FotoRepository;
use App\Service\ProjetoMediaService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_PREMIUM')]
#[Route('/portifolio/projeto')]
final class GerirProjetosController extends AbstractController
{
    #[Route('/{id}/upload', methods: ['POST'], name: 'app_portifolio_projeto_upload')]
    public function upload(
        Projeto $projeto,
        Request $request,
        ProjetoMediaService $mediaService,
        FotoRepository $repository,
        FotoFactory $factory,
        EntityManagerInterface $manager,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        $idPrestadorDono = $projeto->getPortifolio()->getPrestador()->getId();
        if (!$idPrestadorDono->equals($usuario->getId())) {
            return $this->json(['error' => 'Acesso negado. Você não é o proprietário deste projeto.'], Response::HTTP_FORBIDDEN);
        }

        $arquivos = $request->files->get('imagens');
        if (empty($arquivos)) {
            return $this->json(['error' => 'Nenhum arquivo enviado sob a chave "imagens".'], Response::HTTP_BAD_REQUEST);
        }

        if ($arquivos instanceof UploadedFile) {
            $arquivos = [$arquivos];
        }

        $proximaPosicao = $repository->buscarMaiorPosicaoPorProjeto($projeto) + 1;
        $retornoImagens = [];

        try {
            foreach ($arquivos as $arquivo) {
                if (!$arquivo instanceof UploadedFile) {
                    continue;
                }

                $foto = $factory->criarPreenchendoMidia($arquivo, $projeto, $proximaPosicao);

                $manager->persist($foto);

                $retornoImagens[] = [
                    'id' => $foto->getId()->toString(),
                    'url' => $mediaService->gerarUrlPublica($foto->getUrlFoto()),
                    'posicao' => $foto->getPosicao()
                ];

                $proximaPosicao++;
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
            'imagens' => $retornoImagens
        ], Response::HTTP_CREATED, context: ['json_encode_options' => JSON_UNESCAPED_SLASHES]);
    }
}
