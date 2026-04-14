<?php

namespace App\Controller\Admin\Cadastro;

use App\Entity\Servico\Profissao;
use App\Repository\Servico\ProfissaoRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\Exception\NotEncodableValueException;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/admin/cadastro/profissoes')]
final class ProfissaoController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ProfissaoRepository $repository,
        private SerializerInterface $serializer,
    ) {}

    #[Route('', methods: ['GET'])]
    public function index(Request $resquest): JsonResponse
    {
        $excluidos = $resquest->query->getBoolean('excluidos');

        $profissoes = $excluidos
            ? $this->repository->obterExcluidos()
            : $this->repository->obterAtivos();

        return $this->json($profissoes);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function mostrar(int $id): JsonResponse
    {
        $profissao = $this->repository->find($id);

        if (!$profissao) {
            return $this->json(['message' => 'Not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($profissao);
    }

    #[Route('', methods: ['POST'])]
    public function criar(Request $request): JsonResponse
    {
        try {
            $profissao = $this->serializer->deserialize(
                $request->getContent(),
                Profissao::class,
                'json'
            );
        } catch (NotEncodableValueException $e) {
            return $this->json([
                'message' => 'Invalid JSON format',
                'details' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Failed to process request',
                'details' => $e->getMessage()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $profissao->setCriadoEm(new \DateTimeImmutable());

        $this->entityManager->persist($profissao);
        $this->entityManager->flush();

        return $this->json($profissao, Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['PUT', 'PATCH'])]
    public function atualizar(int $id, Request $request): JsonResponse
    {
        $profissao = $this->repository->find($id);

        if (!$profissao) {
            return $this->json(['message' => 'Not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (isset($data['descricao'])) {
            $profissao->setDescricao($data['descricao']);
        }

        $this->entityManager->flush();

        return $this->json($profissao);
    }

    #[Route('/{id}/restaurar', methods: ['POST'])]
    public function restaurar(int $id): JsonResponse
    {
        $profissao = $this->repository->find($id);

        if (!$profissao) {
            return $this->json(['message' => 'Profissão não encontrada'], Response::HTTP_NOT_FOUND);
        }

        if ($profissao->getExcluidoEm() === null) {
            return $this->json(['message' => 'Esta profissão não está excluída'], Response::HTTP_BAD_REQUEST);
        }

        $profissao->setExcluidoEm(null);
        $this->entityManager->flush();

        return $this->json($profissao, Response::HTTP_OK);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function excluir(int $id): JsonResponse
    {
        $profissao = $this->repository->findOneBy([
            'id' => $id,
            'excluidoEm' => null
        ]);

        if (!$profissao) {
            return $this->json(['message' => 'Profissão não encontrada ou já excluída'], Response::HTTP_NOT_FOUND);
        }

        $profissao->setExcluidoEm(new \DateTimeImmutable());
        $this->entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
