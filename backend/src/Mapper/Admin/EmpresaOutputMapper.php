<?php

namespace App\Mapper\Admin;

use App\Mapper\AbstractMapper;
use App\Entity\Empresarial\Empresa;

class EmpresaOutputMapper extends AbstractMapper
{
    /** @param Empresa $empresa */
    public function map(mixed $empresa, array $options = []): array
    {
        $usuario = $empresa->getUsuario();

        return [
            'id' => $empresa->getId(),
            'nome' => $usuario->getNome(),
            'email' => $usuario->getEmail(),
            'criadoEm' => $empresa->getCriadoEm()->format(\DateTimeInterface::ATOM),
        ];
    }
}
