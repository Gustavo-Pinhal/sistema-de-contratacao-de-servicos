<?php

namespace App\Controller;

use App\Entity\Servico\Servico;
use App\Mapper\Servico\AgendamentosOutputMapper;
use App\Mapper\Servico\OrcamentoOutputMapper;
use App\Mapper\Servico\ServicosOutputMapper;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

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
}
