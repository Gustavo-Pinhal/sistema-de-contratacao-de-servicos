<?php

namespace App\Controller;

use App\Dto\Output\Portifolio\PortifolioDto;
use App\Entity\Portifolio\Portifolio;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class PrestadoresController extends AbstractController
{
    #[Route('/api/prestadores/{id}/portifolio')]
    public function portifolio(Portifolio $portifolio): JsonResponse
    {
        $dto = PortifolioDto::fromEntity($portifolio);

        return $this->json($dto, Response::HTTP_OK);
    }
}
