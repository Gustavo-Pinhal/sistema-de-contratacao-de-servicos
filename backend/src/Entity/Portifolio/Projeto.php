<?php

namespace App\Entity\Portifolio;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Uid\Uuid;
use App\Entity\Servico\Servico;

class Projeto
{
    private Uuid $id;
    private Portifolio $portifolio;
    private Servico $servico;
    private string $titulo;
    private ?string $descricao = null;
    private ?string $regiao = null;
    private string $valor;
    private bool $exibirValor;
    private \DateTimeImmutable $concluidoEm;
    private bool $exibirConcluidoEm;
    private int $posicao;
    private Collection $fotos;

    public function __construct(
        Portifolio $portifolio,
        Servico $servico,
        string $titulo,
        ?string $descricao,
        string $valor,
        bool $exibirValor,
        \DateTimeImmutable $concluidoEm,
        bool $exibirConcluidoEm,
        int $posicao
    ) {
        $this->id = Uuid::v7();
        $this->portifolio = $portifolio;
        $this->servico = $servico;
        $this->titulo = $titulo;
        $this->descricao = $descricao;
        $this->valor = $valor;
        $this->exibirValor = $exibirValor;
        $this->concluidoEm = $concluidoEm;
        $this->exibirConcluidoEm = $exibirConcluidoEm;
        $this->posicao = $posicao;
        $this->fotos = new ArrayCollection();
    }

    public function getId(): Uuid
    {
        return $this->id;
    }

    public function getPortifolio(): Portifolio
    {
        return $this->portifolio;
    }

    public function getServico(): Servico
    {
        return $this->servico;
    }

    public function getTitulo(): string
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

    public function setDescricao(?string $descricao): self
    {
        $this->descricao = $descricao;
        return $this;
    }

    public function getRegiao(): ?string
    {
        return $this->regiao;
    }

    public function setRegiao(?string $regiao): self
    {
        $this->regiao = $regiao;
        return $this;
    }

    public function getValor(): string
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

    public function getConcluidoEm(): \DateTimeImmutable
    {
        return $this->concluidoEm;
    }

    public function setConcluidoEm(\DateTimeImmutable $concluidoEm): self
    {
        $this->concluidoEm = $concluidoEm;
        return $this;
    }

    public function isExibirConcluidoEm(): bool
    {
        return $this->exibirConcluidoEm;
    }

    public function setExibirConcluidoEm(bool $exibirConcluidoEm): self
    {
        $this->exibirConcluidoEm = $exibirConcluidoEm;
        return $this;
    }

    public function getPosicao(): int
    {
        return $this->posicao;
    }

    public function setPosicao(int $posicao): self
    {
        $this->posicao = $posicao;
        return $this;
    }

    /** @return Collection<int, Foto> */
    public function getFotos(): Collection
    {
        return $this->fotos;
    }
}
