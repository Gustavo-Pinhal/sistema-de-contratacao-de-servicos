<?php

namespace App\Service\Auth;

use App\Dto\Request\CadastroUsuario\CadastrarClienteInputDto;
use App\Entity\Servico\Cliente;
use App\Exception\UsuarioJaExisteException;
use App\Factory\Auth\UsuarioFactory;
use App\Repository\Auth\UsuarioRepository;
use Doctrine\ORM\EntityManagerInterface;

class CadastrarUsuarioService
{
    public function __construct(
        private EntityManagerInterface $manager,
        private UsuarioRepository $usuarioRepository,
        private UsuarioFactory $usuarioFactory,
    ) {}

    public function registrarCliente(CadastrarClienteInputDto $dto): Cliente
    {
        $usuarioExistente = $this->usuarioRepository->findOneBy(['email' => $dto->email]);
        if ($usuarioExistente) {
            throw new UsuarioJaExisteException($dto->email);
        }

        $usuario = $this->usuarioFactory->criar(
            $dto->email,
            $dto->nome,
            $dto->senha,
            ['CLIENTE'],
        );

        $cliente = new Cliente();
        $cliente->setUsuario($usuario);

        $this->manager->persist($usuario);
        $this->manager->persist($cliente);
        $this->manager->flush();

        return $cliente;
    }
}
