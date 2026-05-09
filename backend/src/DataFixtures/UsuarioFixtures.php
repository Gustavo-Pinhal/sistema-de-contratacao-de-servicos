<?php

namespace App\DataFixtures;

use App\Entity\Auth\Usuario as AuthUsuario;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UsuarioFixtures extends Fixture
{
    public function __construct(
        private UserPasswordHasherInterface $hasher
    ) {}

    public function load(ObjectManager $manager): void
    {
        $usuario = new AuthUsuario();
        $usuario->setEmail('admin@teste.com');
        $usuario->setNome('Admin de Teste');
        $usuario->setRoles(['ADMIN']);

        $password = $this->hasher->hashPassword($usuario, '123456');
        $usuario->setPassword($password);

        $manager->persist($usuario);
        $manager->flush();

        $this->addReference('user-admin', $usuario);
    }
}
