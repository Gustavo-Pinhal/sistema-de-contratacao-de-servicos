<?php

namespace App\Controller\Admin;

use App\Repository\Auth\UsuarioRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/usuarios')]
final class UsuarioController extends AbstractController
{
    #[Route('', methods: ['GET'], name: 'app_admin_usuarios_listar')]
    public function listar(UsuarioRepository $repository): JsonResponse
    {
        $usuarios = $repository->findAll();

        $data = array_map(function ($usuario) {
            $roles = $usuario->getRoles();

            if (in_array('ROLE_ADMIN', $roles)) {
                $perfil = 'Administrador';
            } elseif (in_array('ROLE_PRESTADOR', $roles)) {
                $perfil = 'Prestador';
            } else {
                $perfil = 'Cliente';
            }

            return [
                'id'           => $usuario->getId()?->toString(),
                'nome'         => $usuario->getNome() ?? 'Sem nome',
                'email'        => $usuario->getUserIdentifier(),
                'perfil'       => $perfil,
            ];
        }, $usuarios);

        return $this->json($data);
    }
}
