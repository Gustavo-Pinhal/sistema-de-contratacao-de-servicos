<?php

declare(strict_types=1);

namespace App\Entity\Avaliacao;

use DateTimeImmutable;
use Symfony\Component\Uid\Uuid;

class Imagem
{
    private Uuid $id;
    private ?Avaliacao $avaliacao = null;
    private ?string $caminho = null;
    private ?string $mimeType = null;
    private ?int $tamanho = null;
    private \DateTimeImmutable $criadoEm;
    private ?\DateTimeImmutable $excluidoEm = null;

    public function __construct()
    {
        $this->id = Uuid::v7();
        $this->criadoEm = new DateTimeImmutable();
    }

    public function getId(): Uuid
    {
        return $this->id;
    }

    public function getAvaliacao(): Avaliacao
    {
        return $this->avaliacao;
    }

    public function setAvaliacao(Avaliacao $avaliacao): self
    {
        $this->avaliacao = $avaliacao;
        $avaliacao->addImagem($this);
        return $this;
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

    public function getCriadoEm(): \DateTimeImmutable
    {
        return $this->criadoEm;
    }

    public function getExcluidoEm(): ?\DateTimeImmutable
    {
        return $this->excluidoEm;
    }

    public function excluir(): void
    {
        $this->excluidoEm = new \DateTimeImmutable();
    }
}
