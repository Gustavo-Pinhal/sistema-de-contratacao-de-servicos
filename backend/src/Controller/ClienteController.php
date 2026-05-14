<?php

namespace App\Controller;

use App\Mapper\Cliente\ServicosOutputMapper;
use App\Repository\Servico\ServicoRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/cliente')]
final class ClienteController extends AbstractController
{
    #[IsGranted('ROLE_CLIENTE')]
    #[Route('/servicos', methods: ['GET'], name: 'app_api_cliente_servicos')]
    public function servicos(
        Request $request,
        ServicoRepository $repositorio,
        ServicosOutputMapper $mapper,
    ): JsonResponse {
        $usuario = $this->getUser();
        $ativos = $request->query->getBoolean('apenasAtivos');

        $servicos = $repositorio->buscarPorCliente($usuario, $ativos);

        return $this->json($mapper->map($servicos));
    }
}
