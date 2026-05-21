<?php

namespace App\Controller;

use App\Mapper\Ui\ProfissoesOutputMapper;
use App\Repository\Servico\ProfissaoRepository;
use App\Service\Localizacao\CepService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\Cache;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/ui')]
final class UiElementsController extends AbstractController
{
    #[Route('/profissoes', name: 'app_ui_profissoes')]
    #[Cache(public: true, maxage: 3600, mustRevalidate: true)]
    public function index(
        ProfissaoRepository $repositorio,
        ProfissoesOutputMapper $mapper,
    ): JsonResponse {
        $profissoes = $repositorio->obterTodos();
        return $this->json($mapper->mapCollection($profissoes));
    }

    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[Route('/endereco', methods: ['GET'], name: 'app_ui_endereco')]
    #[Cache(public: true, maxage: 3600, mustRevalidate: true)]
    public function porCep(
        Request $request,
        CepService $service,
    ): JsonResponse {
        $cep = $service->buscarOuCadastrar($request->query->get('cep'));
        if (!$cep) {
            return $this->json(['message' => 'Erro de validação', 'errors' => ['cep' => 'CEP inválido.']], 400);
        }

        return $this->json($cep, context: ['groups' => 'busca_endereco:read']);
    }
}
