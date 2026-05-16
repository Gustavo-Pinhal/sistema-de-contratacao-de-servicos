<?php

namespace App\Controller;

use App\Mapper\Busca\BuscaPrestadorOutputMapper;
use App\Repository\Servico\PrestadorRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/busca')]
final class BuscaController extends AbstractController
{
    #[Route('', methods: ['GET'], name: 'app_api_busca')]
    public function index(
        Request $request,
        PrestadorRepository $repositorio,
        BuscaPrestadorOutputMapper $mapper,
    ): JsonResponse {
        $idProfissao = $request->query->get('profissao');

        $filtros = $idProfissao ? [$idProfissao] : [];
        $prestadores = $repositorio->buscarPorProfissoes($filtros);

        return $this->json($mapper->map($prestadores), context: [
            'json_encode_options' => JSON_UNESCAPED_SLASHES
        ]);
    }
}
