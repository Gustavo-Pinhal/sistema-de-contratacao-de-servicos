<?php

namespace App\Controller;

use App\Entity\Servico\Servico;
use App\Enum\StatusServico;
use App\Mapper\Servico\AgendamentosOutputMapper;
use App\Mapper\Servico\OrcamentoOutputMapper;
use App\Mapper\Servico\ServicosOutputMapper;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Auth\Usuario;

#[Route('/servico/{id}')]
final class ServicoController extends AbstractController
{
    #[Route('', methods: ['GET'], name: 'app_servico_get')]
    public function index(
        Servico $servico,
        AgendamentosOutputMapper $agendamentoMapper,
        OrcamentoOutputMapper $orcamentoMapper,
        ServicosOutputMapper $servicoMapper,
    ): JsonResponse {
        $usuario = $this->getUser();

        if (!$servico->eParticipante($usuario)) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        $agendamentos = $servico->getAgendamentos();
        $orcamentos = $servico->getOrcamentos();
        $valor = $servico->getValorTotal();

        return $this->json([
            'servico' =>  $servicoMapper->map($servico, ['completo' => true]),
            'agendamentos' => $agendamentoMapper->mapCollection($agendamentos),
            'orcamentos' => $orcamentoMapper->mapCollection($orcamentos),
            'total' => $valor,
        ]);
    }

    #[Route('/finalizar', methods: ['POST'], name: 'app_servico_finalizar')]
    public function finalizar(
        Servico $servico,
        EntityManagerInterface $manager,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        if (!$usuario->getId()->equals($servico->getPrestador()->getId())) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        if ($servico->getStatus() !== StatusServico::EmDecorrencia) {
            return $this->json(
                ['error' => 'Transição de status inválida'],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $servico->concluir();
        $manager->flush();

        return $this->json(['success' => true]);
    }

    #[Route('/cancelar', methods: ['POST'], name: 'app_servico_cancelar')]
    public function cancelar(
        Servico $servico,
        EntityManagerInterface $manager,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        if (!$servico->eParticipante($usuario)) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        $statusAtual = $servico->getStatus();

        $statusProibidosParaCancelamento = [
            StatusServico::Concluido,
            StatusServico::Expirado,
            StatusServico::CanceladoPeloCliente,
            StatusServico::CanceladoPeloPrestador,
        ];

        if (in_array($statusAtual, $statusProibidosParaCancelamento, true)) {
            return $this->json(
                ['error' => 'Transição de status inválida'],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $servico->cancelar($usuario);
        $manager->flush();

        return $this->json(['success' => true]);
    }
}
