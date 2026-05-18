<?php

namespace App\Controller\Prestador;

use App\Entity\Servico\Prestador;
use App\Mapper\Portifolio\PortifolioOutputMapper;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/prestador/{id}/portifolio')]
final class PortifolioController extends AbstractController
{
    #[IsGranted('PUBLIC_ACCESS')]
    #[Route('', methods: ['GET'], name: 'app_prestador_portifolio')]
    public function index(
        Prestador $prestador,
        PortifolioOutputMapper $mapper,
    ): JsonResponse {
        $portifolio = $prestador->getPortifolio();

        if (!$portifolio) {
            return $this->json([
                'error' => 'Este prestador não possui um portfólio configurado.',
            ], Response::HTTP_NOT_FOUND);
        }

        return $this->json(
            $mapper->map($portifolio),
            context: ['json_encode_options' => JSON_UNESCAPED_SLASHES]
        );
    }
}
