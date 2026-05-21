<?php

declare(strict_types=1);

namespace App\Controller\Empresarial;

use App\Entity\Auth\Usuario;
use App\Repository\Dashboard\DashboardStatsRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_EMPRESA')]
#[Route('/empresarial/dashboard')]
final class DashboardController extends AbstractController
{
    public function __construct(
        private readonly DashboardStatsRepository $stats
    ) {}

    #[Route('/stats', methods: ['GET'], name: 'app_empresarial_dashboard_stats')]
    public function stats(): JsonResponse
    {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        $empresaId = $usuario->getId()->toString();

        $prestadores = $this->stats->contarPrestadoresPorEmpresa($empresaId);
        $premium     = $this->stats->contarPrestadoresPremiumPorEmpresa($empresaId);

        return $this->json([
            'prestadores_vinculados' => $prestadores,
            'servicos_contratados'   => $this->stats->contarServicosContratadosPorEmpresa($empresaId),
            'servicos_ativos'        => $this->stats->contarServicosAtivosporEmpresa($empresaId),
            'profissionais_premium'  => $premium,
            'convites_pendentes'     => $this->stats->contarConvitesPendentesPorEmpresa($empresaId),
            'percentual_premium'     => $prestadores > 0
                ? round(($premium / $prestadores) * 100)
                : 0,
        ]);
    }
}
