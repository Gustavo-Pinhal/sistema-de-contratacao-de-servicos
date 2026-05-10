<?php

namespace App\Controller;

use App\Service\Localizacao\CepService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

final class DigitaCepController extends AbstractController
{
    #[Route('/api/endereco', methods: ['GET'], name: 'app_endereco_obter_por_cep')]
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
