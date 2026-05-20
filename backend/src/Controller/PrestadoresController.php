<?php

namespace App\Controller;

use App\Dto\Output\Portifolio\PortifolioDto;
use App\Entity\Portifolio\Portifolio;
use App\Repository\Servico\PrestadorRepository;
use App\Repository\Servico\ProfissaoRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
final class PrestadoresController extends AbstractController
{
    #[Route('/prestadores/{id}/portifolio')]
    public function portifolio(Portifolio $portifolio): JsonResponse
    {
        $dto = PortifolioDto::fromEntity($portifolio);

        return $this->json($dto, Response::HTTP_OK);
    }

    #[Route('/prestadores/buscar', methods: ['GET'], name: 'app_prestadores_buscar')]
    public function buscar(
        Request $request,
        PrestadorRepository $repositorio,
        ProfissaoRepository $profissaoRepositorio,
    ): JsonResponse {
        $idProfissao = $request->query->get('profissao');
        $filtros = [];

        if ($idProfissao) {
            $profissao = $profissaoRepositorio->find($idProfissao);
            if ($profissao) {
                $filtros[] = $profissao;
            }
        }

        $prestadores = $repositorio->buscarPorProfissoes($filtros);

        return $this->json($prestadores, context: ['groups' => 'listagem_prestadores:read']);
    }
}
