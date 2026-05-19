<?php

namespace App\Controller;

use App\Entity\Servico\Prestador;
use App\Mapper\Prestador\PrestadorOutputMapper;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/prestador')]
final class PrestadorController extends AbstractController
{
    #[IsGranted('PUBLIC_ACCESS')]
    #[Route('/{id}', methods: ['GET'], name: 'app_prestador_get')]
    public function index(
        Prestador $prestador,
        PrestadorOutputMapper $mapper,
    ): JsonResponse {
        return $this->json($mapper->map($prestador));
    }
}
