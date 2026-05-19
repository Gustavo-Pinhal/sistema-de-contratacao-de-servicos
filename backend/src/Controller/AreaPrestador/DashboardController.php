<?php

namespace App\Controller\AreaPrestador;

use App\Enum\StatusServico;
use App\Mapper\Servico\ServicosOutputMapper;
use App\Repository\Servico\ServicoRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_PRESTADOR')]
#[Route('/areaprestador')]
final class DashboardController extends AbstractController
{
    #[Route('/dashboard', name: 'app_area_prestador_home')]
    public function index(
        ServicoRepository $repositorio,
        ServicosOutputMapper $mapper,
    ): JsonResponse {
        $usuario = $this->getUser();
        $servicos = $repositorio->buscarDashboardPrestador($usuario);

        $ativos = [];
        $pendentes = [];
        $concluidos = [];
        $cancelados = [];

        foreach ($servicos as $servico) {
            $status = $servico->getStatus();
            if ($status === StatusServico::Expirado) {
                continue;
            }
            match ($status) {
                StatusServico::EmDecorrencia => $ativos[] = $servico,
                StatusServico::SolicitacaoDeOrcamento => $pendentes[] = $servico,
                StatusServico::Concluido => $concluidos[] = $servico,
                StatusServico::CanceladoPeloCliente,
                StatusServico::CanceladoPeloPrestador => $cancelados[] = $servico,
                default => null,
            };
        }

        return $this->json([
            'ativos' => $mapper->mapCollection($ativos, ['completo' => true]),
            'pendentes' => $mapper->mapCollection($pendentes, ['completo' => true]),
            'concluidos' => $mapper->mapCollection($concluidos, ['completo' => true]),
            'cancelados' => $mapper->mapCollection($cancelados, ['completo' => true]),
        ]);
    }
}
