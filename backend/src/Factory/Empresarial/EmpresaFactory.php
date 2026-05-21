<?php

namespace App\Factory\Empresarial;

use App\Dto\Request\Admin\Empresa\CriarEmpresaInputDto;
use App\Entity\Empresarial\Empresa;
use App\Factory\Auth\UsuarioFactory;

class EmpresaFactory
{
    public function __construct(
        private UsuarioFactory $usuarioFactory,
    ) {}

    public function fromDto(CriarEmpresaInputDto $dto): Empresa
    {
        $usuario = $this->usuarioFactory->criar(
            $dto->email,
            $dto->nome,
            $dto->senha,
            ['ROLE_USER', 'ROLE_EMPRESA']
        );

        return new Empresa($usuario);
    }
}
