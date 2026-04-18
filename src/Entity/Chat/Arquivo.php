<?php

namespace App\Entity\Chat;

use Symfony\Component\Uid\Uuid;

class Arquivo
{
    private ?Mensagem $mensagem = null;
    private ?string $caminho = null;
    private ?string $mimeType = null;
    private ?int $tamanho = null;
    private ?\DateTimeImmutable $excluidoEm = null;

    public function getId(): ?Uuid
    {
        return $this->mensagem?->getId();
    }

    public function getMensagem(): ?Mensagem
    {
        return $this->mensagem;
    }

    public function setMensagem(?Mensagem $mensagem): self
    {
        $this->mensagem = $mensagem;
        return $this;
    }

    public function getCaminho(): ?string
    {
        return $this->caminho;
    }

    public function setCaminho(string $caminho): self
    {
        $this->caminho = $caminho;
        return $this;
    }

    public function getMimeType(): ?string
    {
        return $this->mimeType;
    }

    public function setMimeType(string $mimeType): self
    {
        $this->mimeType = $mimeType;
        return $this;
    }

    public function getTamanho(): ?int
    {
        return $this->tamanho;
    }

    public function setTamanho(?int $tamanho): self
    {
        $this->tamanho = $tamanho;
        return $this;
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
