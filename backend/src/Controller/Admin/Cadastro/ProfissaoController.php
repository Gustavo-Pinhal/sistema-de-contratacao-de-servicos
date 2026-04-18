<?php

namespace App\Controller\Admin\Cadastro;

use App\Dto\Input\Admin\ProfissaoDto;
use App\Entity\Servico\Profissao;
use App\Repository\Servico\ProfissaoRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/cadastro/profissoes')]
final class ProfissaoController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ProfissaoRepository $repository,
    ) {}

    #[Route('', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $excluidos = $request->query->getBoolean('excluidos');

        $profissoes = $excluidos
            ? $this->repository->obterExcluidos()
            : $this->repository->obterAtivos();

        return $this->json($profissoes);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function mostrar(Profissao $profissao): JsonResponse
    {
        return $this->json($profissao, context: ['groups' => 'profissao:read']);
    }

    #[Route('', methods: ['POST'])]
    public function criar(
        #[MapRequestPayload]
        ProfissaoDto $dto
    ): JsonResponse {
        $profissao = Profissao::fromDto($dto);

        $this->entityManager->persist($profissao);
        $this->entityManager->flush();

        return $this->json($profissao, Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['PUT', 'PATCH'])]
    public function atualizar(
        Profissao $profissao,
        #[MapRequestPayload]
        ProfissaoDto $dto
    ): JsonResponse {
        $profissao->atualizarDados($dto);

        $this->entityManager->flush();

        return $this->json($profissao, Response::HTTP_OK);
    }

    #[Route('/{id}/restaurar', methods: ['POST'])]
    public function restaurar(Profissao $profissao): JsonResponse
    {
        if ($profissao->getExcluidoEm() === null) {
            return $this->json(['message' => 'Esta profissão não está excluída'], Response::HTTP_BAD_REQUEST);
        }

        $profissao->setExcluidoEm(null);
        $this->entityManager->flush();

        return $this->json($profissao, Response::HTTP_OK);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function excluir(Profissao $profissao): JsonResponse
    {
        if ($profissao->getExcluidoEm() !== null) {
            return $this->json(['message' => 'Profissão já excluída'], Response::HTTP_NOT_FOUND);
        }

        $profissao->setExcluidoEm(new \DateTimeImmutable());
        $this->entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
