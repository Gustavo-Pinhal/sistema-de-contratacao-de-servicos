<?php

namespace App\Controller\Servico;

use App\Dto\Request\Portifolio\ProjetoInputDto;
use App\Entity\Servico\Servico;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use App\Entity\Auth\Usuario;
use App\Enum\StatusServico;
use App\Factory\Portifolio\ProjetoFactory;
use App\Mapper\Servico\ServicosOutputMapper;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;

#[IsGranted('ROLE_PREMIUM')]
#[Route('/servico/{servico}/projeto')]
final class GerarProjetoController extends AbstractController
{
    #[Route('', methods: ['GET'], name: 'app_servico_projeto')]
    public function index(
        Servico $servico,
        ServicosOutputMapper $mapper,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        if (!$servico->getPrestador()->getId()->equals($usuario->getId())) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        $total = $servico->getValorTotal();
        $conclusao = $servico->getEncerramento();

        return $this->json([
            'servico' => $mapper->map($servico),
            'total' => $total,
            'conclusao' => $conclusao,
        ]);
    }

    #[Route('', methods: ['POST'], name: 'app_servico_projeto_criar')]
    public function criar(
        Servico $servico,
        #[MapRequestPayload] ProjetoInputDto $dto,
        ProjetoFactory $factory,
        EntityManagerInterface $manager,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        if (!$servico->getPrestador()->getId()->equals($usuario->getId())) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        if ($servico->getStatus() !== StatusServico::Concluido) {
            return $this->json(['error' => 'Serviço deve estar concluído'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!is_null($servico->getProjeto())) {
            return $this->json(['error' => 'Serviço já gerou um projeto'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $manager->persist($factory->fromDto($dto, $servico));
        $manager->flush();

        return $this->json(['success' => true], Response::HTTP_CREATED);
    }
}
