<?php

namespace App\Controller;

use App\Dto\Request\CadastroUsuario\CadastrarClienteInputDto;
use App\Service\Auth\CadastrarUsuarioService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/cadastro-usuario')]
final class CadastroUsuarioController extends AbstractController
{
    #[Route('/cliente', methods: ['POST'], name: 'app_cadastro_usuario_cliente')]
    public function cadastroCliente(
        #[MapRequestPayload]
        CadastrarClienteInputDto $dto,
        CadastrarUsuarioService $service,
    ): JsonResponse {
        $service->registrarCliente($dto);
        return $this->json(['success' => true]);
    }
}
