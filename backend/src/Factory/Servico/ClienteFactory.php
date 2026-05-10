<?php

namespace App\Factory\Servico;

use App\Dto\Request\CadastroUsuario\CadastrarClienteInputDto;
use App\Entity\Servico\Cliente;
use App\Factory\Auth\UsuarioFactory;

class ClienteFactory
{
    public function __construct(
        private UsuarioFactory $usuarioFactory
    ) {}

    public function criar(CadastrarClienteInputDto $dto): Cliente
    {
        $usuario = $this->usuarioFactory->criar(
            $dto->email,
            $dto->nome,
            $dto->senha,
            ['ROLE_CLIENTE'] // Boa prática: use o prefixo ROLE_
        );

        $cliente = new Cliente();
        $cliente->setUsuario($usuario);

        return $cliente;
    }
}
