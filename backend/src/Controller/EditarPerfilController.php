<?php

namespace App\Controller;

use App\Repository\Servico\PrestadorRepository;
use App\Entity\Auth\Usuario;
use App\Mapper\EditarPerfil\PrestadorEditarPerfilOutputMapper;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
final class EditarPerfilController extends AbstractController
{
    #[IsGranted('ROLE_PRESTADOR')]
    #[Route('/prestador/perfil/editar', methods: ['GET'], name: 'app_prestador_perfil_editar')]
    public function obterDadosPrestador(
        PrestadorRepository $repositorio,
        PrestadorEditarPerfilOutputMapper $mapper,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();

        $prestador = $repositorio->buscarParaEdicaoDePerfil($usuario);

        return $this->json($mapper->map($prestador));
    }
}
