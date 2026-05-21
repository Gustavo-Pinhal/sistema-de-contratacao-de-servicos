<?php

declare(strict_types=1);

namespace App\Controller\Admin;

use App\Repository\Dashboard\DashboardStatsRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_ADMIN')]
#[Route('/admin/dashboard')]
final class DashboardController extends AbstractController
{
    public function __construct(
        private readonly DashboardStatsRepository $stats
    ) {}

    #[Route('/stats', methods: ['GET'], name: 'app_admin_dashboard_stats')]
    public function stats(): JsonResponse
    {
        return $this->json([
            'clientes'           => $this->stats->contarClientes(),
            'prestadores'        => $this->stats->contarPrestadores(),
            'empresas'           => $this->stats->contarEmpresas(),
            'assinaturas_ativas' => $this->stats->contarAssinaturasAtivas(),
            'rendimento_mensal'  => $this->stats->rendimentoMensal(),
        ]);
    }
}
