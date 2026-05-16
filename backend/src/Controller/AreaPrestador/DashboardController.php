<?php

namespace App\Controller\AreaPrestador;

use App\Mapper\AreaPrestador\DashboardOutputMapper;
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
        DashboardOutputMapper $mapper,
    ): JsonResponse {
        $usuario = $this->getUser();
        $servicos = $repositorio->buscarDashboardPrestador($usuario);

        $data = $mapper->map($servicos);

        return $this->json($data);
    }
}
