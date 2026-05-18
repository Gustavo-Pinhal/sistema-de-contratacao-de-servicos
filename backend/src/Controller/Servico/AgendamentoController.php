<?php

namespace App\Controller\Servico;

use App\Dto\Request\Servico\AgendamentoInputDto;
use App\Entity\Servico\Servico;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Auth\Usuario;
use App\Entity\Servico\Agendamento;
use App\Factory\Servico\AgendamentoFactory;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;

#[Route('/servico/{servico}/agendamento')]
final class AgendamentoController extends AbstractController
{
    #[Route('', methods: ['POST'], name: 'app_servico_agendamento_criar')]
    public function criar(
        Servico $servico,
        #[MapRequestPayload] AgendamentoInputDto $dto,
        AgendamentoFactory $factory,
        EntityManagerInterface $manager,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        if (!$usuario->getId()->equals($servico->getPrestador()->getId())) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        $manager->persist($factory->fromDto($dto, $servico));
        $manager->flush();

        return $this->json(['success' => true]);
    }

    #[Route('/{agendamento}/confirmar', methods: ['POST'], name: 'app_servico_agendamento_confirmar')]
    public function confirmar(
        Servico $servico,
        Agendamento $agendamento,
        EntityManagerInterface $manager,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        if (!$usuario->getId()->equals($servico->getCliente()->getId())) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        $agendamento->confirmar();
        $manager->flush();

        return $this->json(['success' => true]);
    }

    #[Route('/{agendamento}/declinar', methods: ['POST'], name: 'app_servico_agendamento_declinar')]
    public function declinar(
        Servico $servico,
        Agendamento $agendamento,
        EntityManagerInterface $manager,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        if (!$usuario->getId()->equals($servico->getCliente()->getId())) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        $agendamento->recusar();
        $manager->flush();

        return $this->json(['success' => true]);
    }
}
