<?php

namespace App\Controller\Admin\Cadastro;

use App\Dto\Request\Admin\Cadastro\ProfissaoInputDto;
use App\Entity\Servico\Profissao;
use App\Repository\Servico\ProfissaoRepository;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin/cadastro/profissoes')]
final class ProfissaoController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {}

    #[Route('', methods: ['GET'], name: 'app_admin_cadastro_profissao')]
    public function index(
        Request $request,
        ProfissaoRepository $repository,
    ): JsonResponse {
        $excluidos = $request->query->getBoolean('excluidos');

        $profissoes = $repository->obterTodos($excluidos);

        return $this->json($profissoes, context: ['groups' => 'profissao:read']);
    }

    #[Route('', methods: ['POST'], name: 'app_admin_cadastro_profissao_criar')]
    public function criar(
        #[MapRequestPayload]
        ProfissaoInputDto $dto,
    ): JsonResponse {
        try {
            $profissao = new Profissao($dto->descricao);

            $this->entityManager->persist($profissao);
            $this->entityManager->flush();

            return $this->json($profissao, Response::HTTP_CREATED);
        } catch (UniqueConstraintViolationException $e) {
            return $this->json([
                'message' => 'Erro de validação',
                'errors' => [
                    'descricao' => 'Já existe uma profissão cadastrada com esta descrição.'
                ]
            ], Response::HTTP_CONFLICT);
        }
    }

    #[Route('/{id}', methods: ['PUT', 'PATCH'], name: 'app_admin_cadastro_profissao_atualizar')]
    public function atualizar(
        Profissao $profissao,
        #[MapRequestPayload]
        ProfissaoInputDto $dto
    ): JsonResponse {
        try {
            $profissao->setDescricao($dto->descricao);
            $this->entityManager->flush();

            return $this->json($profissao, Response::HTTP_OK);
        } catch (UniqueConstraintViolationException $e) {
            return $this->json([
                'message' => 'Erro de validação',
                'errors' => [
                    'descricao' => 'Já existe uma profissão cadastrada com esta descrição.'
                ]
            ], Response::HTTP_CONFLICT);
        }
    }

    #[Route('/{id}/restaurar', methods: ['POST'], name: 'app_admin_cadastro_profissao_restaurar')]
    public function restaurar(Profissao $profissao): JsonResponse
    {
        $profissao->setExcluidoEm(null);

        $this->entityManager->flush();

        return $this->json($profissao, Response::HTTP_OK, context: ['groups' => 'profissao:read']);
    }

    #[Route('/{id}', methods: ['DELETE'], name: 'app_admin_cadastro_profissao_excluir')]
    public function excluir(Profissao $profissao): JsonResponse
    {
        $profissao->setExcluidoEm(new \DateTimeImmutable());

        $this->entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
