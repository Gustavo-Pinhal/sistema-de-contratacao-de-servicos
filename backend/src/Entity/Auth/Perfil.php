<?php

namespace App\Entity\Auth;

class Perfil
{
    private Usuario $usuario;
    private string $caminho;
    private string $mimeType;
    private int $tamanho;

    public function __construct(
        Usuario $usuario,
        string $caminho,
        string $mimeType,
        int $tamanho
    ) {
        $this->usuario = $usuario;
        $this->caminho = $caminho;
        $this->mimeType = $mimeType;
        $this->tamanho = $tamanho;
    }

    public function getId(): ?string
    {
        return $this->usuario->getId()?->toString();
    }

    public function getUsuario(): Usuario
    {
        return $this->usuario;
    }

    public function getCaminho(): string
    {
        return $this->caminho;
    }

    public function setCaminho(string $caminho): self
    {
        $this->caminho = $caminho;
        return $this;
    }

    public function getMimeType(): string
    {
        return $this->mimeType;
    }

    public function setMimeType(string $mimeType): self
    {
        $this->mimeType = $mimeType;
        return $this;
    }

    public function getTamanho(): int
    {
        return $this->tamanho;
    }

    public function setTamanho(int $tamanho): self
    {
        $this->tamanho = $tamanho;
        return $this;
    }
}
