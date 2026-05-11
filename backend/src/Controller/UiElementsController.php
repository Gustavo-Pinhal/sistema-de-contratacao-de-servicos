<?php

namespace App\Controller;

use App\Repository\Servico\ProfissaoRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\Cache;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/ui')]
final class UiElementsController extends AbstractController
{
    #[Route('/profissoes', name: 'app_ui_profissoes')]
    #[Cache(public: true, maxage: 3600, mustRevalidate: true)]
    public function index(
        ProfissaoRepository $repositorio,
    ): JsonResponse {
        $profissoes = $repositorio->obterTodos();
        return $this->json($profissoes, context: ['groups' => 'ui_list:read']);
    }
}
