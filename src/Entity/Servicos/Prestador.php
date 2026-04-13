<?php

namespace App\Entity\Servicos;

use App\Entity\Auth\Usuario;
use Symfony\Component\Uid\Uuid;

class Prestador
{
    private ?Uuid $id = null;
    private ?Usuario $usuario = null;
    private ?string $nome = null;
    private bool $ativo = true;
    private \DateTimeImmutable $criadoEm;
    private ?\DateTimeImmutable $excluidoEm = null;

    public function __construct()
    {
        $this->id = Uuid::v7();
        $this->criadoEm = new \DateTimeImmutable();
        $this->ativo = true;
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getUsuario(): ?Usuario
    {
        return $this->usuario;
    }

    public function setUsuario(Usuario $usuario): self
    {
        $this->usuario = $usuario;
        return $this;
    }

    public function getNome(): ?string
    {
        return $this->nome;
    }

    public function setNome(string $nome): self
    {
        $this->nome = $nome;
        return $this;
    }

    public function isAtivo(): bool
    {
        return $this->ativo;
    }

    public function setAtivo(bool $ativo): self
    {
        $this->ativo = $ativo;
        return $this;
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