<?php

namespace App\Entity\Servico;

use App\Entity\Auth\Usuario;
use Symfony\Component\Uid\Uuid;

class Cliente
{
    private Usuario $usuario;
    private \DateTimeImmutable $criadoEm;
    private ?\DateTimeImmutable $excluidoEm = null;

    public function __construct(
        Usuario $usuario
    ) {
        $this->usuario = $usuario;
        $this->criadoEm = new \DateTimeImmutable();
    }

    public function getId(): ?Uuid
    {
        return $this->usuario->getId();
    }

    public function getUsuario(): Usuario
    {
        return $this->usuario;
    }

    public function getCriadoEm(): \DateTimeImmutable
    {
        return $this->criadoEm;
    }

    public function getExcluidoEm(): ?\DateTimeImmutable
    {
        return $this->excluidoEm;
    }

    public function setExcluidoEm(?\DateTimeImmutable $excluidoEm): self
    {
        $this->excluidoEm = $excluidoEm;
        return $this;
    }
}
