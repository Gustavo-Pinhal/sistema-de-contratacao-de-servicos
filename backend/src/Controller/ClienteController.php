<?php

namespace App\Controller;

use App\Entity\Auth\Usuario;
use App\Mapper\Cliente\EnderecosDoClienteOutputMapper;
use App\Mapper\Servico\ServicosOutputMapper;
use App\Repository\Localizacao\EnderecoRepository;
use App\Repository\Servico\ServicoRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/cliente')]
final class ClienteController extends AbstractController
{
    #[IsGranted('ROLE_CLIENTE')]
    #[Route('/servicos', methods: ['GET'], name: 'app_cliente_servicos')]
    public function servicos(
        ServicoRepository $repositorio,
        ServicosOutputMapper $mapper,
    ): JsonResponse {
        $usuario = $this->getUser();
        $servicos = $repositorio->buscarServicosRecentesDoCliente($usuario);

        return $this->json($mapper->mapCollection($servicos));
    }

    #[Route('/enderecos', methods: ['GET'], name: 'app_api_cliente_enderecos')]
    public function enderecos(
        EnderecoRepository $repositorio,
        EnderecosDoClienteOutputMapper $mapper,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();

        $enderecos = $repositorio->buscarEnderecoCompletoPorUsuario($usuario);

        return $this->json($mapper->mapCollection($enderecos));
    }
}
