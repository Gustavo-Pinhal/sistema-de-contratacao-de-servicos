<?php

namespace App\Entity\Portifolio;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

class Projeto
{
    #[Groups(['portifolio:read', 'projeto:read'])]
    private ?Uuid $id = null;

    private ?Portifolio $portifolio = null;

    #[Groups(['portifolio:read', 'projeto:read'])]
    private ?string $titulo = null;

    #[Groups(['portifolio:read', 'projeto:read'])]
    private ?string $descricao = null;

    #[Groups(['portifolio:read', 'projeto:read'])]
    private ?string $regiao = null;

    #[Groups(['portifolio:read', 'projeto:read'])]
    private ?string $valor = null;

    #[Groups(['portifolio:read', 'projeto:read'])]
    private bool $exibirValor = true;

    #[Groups(['portifolio:read', 'projeto:read'])]
    private ?\DateTimeInterface $concluidoEm = null;

    #[Groups(['portifolio:read', 'projeto:read'])]
    private bool $exibirConcluidoEm = true;

    #[Groups(['portifolio:read', 'projeto:read'])]
    private Collection $fotos;

    public function __construct()
    {
        $this->id = Uuid::v7();
        $this->fotos = new ArrayCollection();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getPortifolio(): ?Portifolio
    {
        return $this->portifolio;
    }

    public function setPortifolio(?Portifolio $portifolio): self
    {
        $this->portifolio = $portifolio;
        return $this;
    }

    public function getTitulo(): ?string
    {
        return $this->titulo;
    }

    public function setTitulo(string $titulo): self
    {
        $this->titulo = $titulo;
        return $this;
    }

    public function getDescricao(): ?string
    {
        return $this->descricao;
    }

    public function setDescricao(string $descricao): self
    {
        $this->descricao = $descricao;
        return $this;
    }

    public function getRegiao(): ?string
    {
        return $this->regiao;
    }

    public function setRegiao(string $regiao): self
    {
        $this->regiao = $regiao;
        return $this;
    }

    public function getValor(): ?string
    {
        return $this->valor;
    }

    public function setValor(string $valor): self
    {
        $this->valor = $valor;
        return $this;
    }

    public function isExibirValor(): bool
    {
        return $this->exibirValor;
    }

    public function setExibirValor(bool $exibirValor): self
    {
        $this->exibirValor = $exibirValor;
        return $this;
    }

    public function getConcluidoEm(): ?\DateTimeInterface
    {
        return $this->concluidoEm;
    }

    public function setConcluidoEm(\DateTimeInterface $concluidoEm): self
    {
        $this->concluidoEm = $concluidoEm;
        return $this;
    }

    public function getExibirConcluidoEm(): ?bool
    {
        return $this->exibirConcluidoEm;
    }

    public function setExibirConcluidoEm(bool $concluidoEm): self
    {
        $this->exibirConcluidoEm = $concluidoEm;
        return $this;
    }

    public function getFotos(): Collection
    {
        return $this->fotos;
    }
}
