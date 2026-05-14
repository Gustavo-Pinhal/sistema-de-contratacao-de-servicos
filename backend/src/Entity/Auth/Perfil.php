<?php

namespace App\Entity\Auth;

class Perfil
{
    private ?Usuario $usuario = null;

    private ?string $caminhoFoto = null;

    public function __construct(Usuario $usuario, string $caminhoFoto)
    {
        $this->usuario = $usuario;
        $this->caminhoFoto = $caminhoFoto;
    }

    public function getId(): ?string
    {
        return $this->usuario->getId();
    }

    public function getUsuario(): ?Usuario
    {
        return $this->usuario;
    }

    public function getCaminhoFoto(): ?string
    {
        return $this->caminhoFoto;
    }

    public function setCaminhoFoto(string $caminhoFoto): self
    {
        $this->caminhoFoto = $caminhoFoto;
        return $this;
    }
}
