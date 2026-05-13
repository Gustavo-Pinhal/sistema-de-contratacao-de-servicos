<?php

namespace App\Controller\AreaPrestador;

use App\Enum\StatusServico;
use App\Repository\Servico\ServicoRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_PRESTADOR')]
#[Route('/api/areaprestador')]
final class DashboardController extends AbstractController
{
    #[Route('/dashboard', name: 'app_area_prestador_home')]
    public function index(
        ServicoRepository $repositorio,
    ): JsonResponse {
        $usuario = $this->getUser();
        $servicos = $repositorio->buscarDashboardPrestador($usuario);

        $data = [
            'ativos' => [],
            'pendentes' => [],
            'concluidos' => [],
            'cancelados' => [],
        ];

        foreach ($servicos as $servico) {
            match ($servico->getStatus()) {
                StatusServico::EmDecorrencia => $data['ativos'][] = $servico,
                StatusServico::SolicitacaoDeOrcamento => $data['pendentes'][] = $servico,
                StatusServico::Concluido => $data['concluidos'][] = $servico,
                StatusServico::CanceladoPeloCliente,
                StatusServico::CanceladoPeloPrestador => $data['cancelados'][] = $servico,
                default => null
            };
        }

        return $this->json($data, context: [
            'groups' => ['servico_dashboard:read']
        ]);
    }
}
