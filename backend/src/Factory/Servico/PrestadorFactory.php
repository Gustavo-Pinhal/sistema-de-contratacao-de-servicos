<?php

namespace App\Factory\Servico;

use App\Dto\Request\CadastroUsuario\CadastrarPrestadorInputDto;
use App\Entity\Localizacao\Cep;
use App\Entity\Servico\Prestador;
use App\Entity\Servico\Profissao;
use App\Factory\Auth\UsuarioFactory;

class PrestadorFactory
{
    public function __construct(
        private UsuarioFactory $usuarioFactory
    ) {}

    public function criar(
        CadastrarPrestadorInputDto $dto,
        Profissao $profissao,
        Cep $cep
    ): Prestador {
        $usuario = $this->usuarioFactory->criar(
            $dto->email,
            $dto->nome,
            $dto->senha,
            ['ROLE_PRESTADOR']
        );

        $prestador = new Prestador(
            $usuario,
            $usuario->getNome(),
            $cep,
        );

        $prestador->addProfissao($profissao);

        return $prestador;
    }
}
