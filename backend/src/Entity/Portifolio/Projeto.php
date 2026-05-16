<?php

namespace App\Entity\Portifolio;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Uid\Uuid;
use App\Entity\Servico\Servico;
use DateTimeInterface;

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
    private DateTimeInterface $concluidoEm;
    private bool $exibirConcluidoEm;
    private Collection $fotos;

    public function __construct(
        Portifolio $portifolio,
        Servico $servico,
        string $titulo,
        string $descricao,
        bool $exibirValor,
        bool $exibirConcluidoEm,
    ) {
        $this->id = Uuid::v7();
        $this->portifolio = $portifolio;
        $this->servico = $servico;
        $this->titulo = $titulo;
        $this->descricao = $descricao;
        $this->valor = $this->servico->getValorTotal();
        $this->exibirValor = $exibirValor;
        $this->exibirConcluidoEm = $exibirConcluidoEm;
        $this->concluidoEm = $this->servico->getEncerramento();
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

    public function setPortifolio(Portifolio $portifolio): self
    {
        $this->portifolio = $portifolio;
        return $this;
    }

    public function getServico(): Servico
    {
        return $this->servico;
    }

    public function setServico(Servico $servico): self
    {
        $this->servico = $servico;
        if ($servico->getProjeto() !== $this) {
            $servico->setProjeto($this);
        }

        return $this;
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

    public function setRegiao(string $regiao): self
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

    public function getConcluidoEm(): DateTimeInterface
    {
        return $this->concluidoEm;
    }

    public function setConcluidoEm(DateTimeInterface $concluidoEm): self
    {
        $this->concluidoEm = $concluidoEm;
        return $this;
    }

    public function getExibirConcluidoEm(): bool
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
