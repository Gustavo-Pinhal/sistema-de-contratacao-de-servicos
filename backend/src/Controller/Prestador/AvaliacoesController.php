<?php

namespace App\Controller\Prestador;

use App\Entity\Servico\Prestador;
use App\Mapper\Avaliacao\AvaliacaoOutputMapper;
use App\Repository\Avaliacao\AvaliacaoRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/prestador/{id}/avaliacoes')]
final class AvaliacoesController extends AbstractController
{
    #[Route('', methods: ['GET'], name: 'app_prestador_avaliacoes')]
    public function index(
        Prestador $prestador,
        AvaliacaoRepository $repositorio,
        AvaliacaoOutputMapper $mapper,
    ): JsonResponse {
        $avaliacoes = $repositorio->buscarAvaliacoesPorPrestador($prestador);

        return $this->json(
            $mapper->mapCollection($avaliacoes, options: ['servico' => true]),
            context: ['json_encode_options' => JSON_UNESCAPED_SLASHES]
        );
    }
}
