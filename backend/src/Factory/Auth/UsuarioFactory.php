<?php

namespace App\Factory\Auth;

use App\Entity\Auth\Usuario;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UsuarioFactory
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    public function criar(
        string $email,
        string $nome,
        string $plainPassword,
        array $roles = ['ROLE_USER']
    ): Usuario {
        $usuario = new Usuario();

        $usuario->setEmail(strtolower(trim($email)));
        $usuario->setNome(trim($nome));
        $usuario->setRoles($roles);

        $hashedPassword = $this->passwordHasher->hashPassword($usuario, $plainPassword);
        $usuario->setPassword($hashedPassword);

        return $usuario;
    }
}
