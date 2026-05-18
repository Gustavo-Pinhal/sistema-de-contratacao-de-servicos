<?php

namespace App\Entity\Servico;

use Symfony\Component\Uid\Uuid;

class Orcamento
{
    private Uuid $id;
    private Servico $servico;
    private string $descricao;
    private float $valor;
    private ?string $observacoes = null;
    private \DateTimeImmutable $criadoEm;
    private ?\DateTimeImmutable $excluidoEm = null;

    public function __construct(Servico $servico, string $descricao, float $valor, ?string $observacoes)
    {
        $this->id = Uuid::v7();
        $this->servico = $servico;
        $this->descricao = $descricao;
        $this->valor = $valor;
        $this->observacoes = $observacoes;
        $this->criadoEm = new \DateTimeImmutable();
    }

    public function getId(): Uuid
    {
        return $this->id;
    }

    public function getServico(): Servico
    {
        return $this->servico;
    }

    public function getDescricao(): string
    {
        return $this->descricao;
    }

    public function setDescricao(string $descricao): self
    {
        $this->descricao = $descricao;
        return $this;
    }

    public function getValor(): float
    {
        return $this->valor;
    }

    public function setValor(float $valor): self
    {
        $this->valor = $valor;
        return $this;
    }

    public function getObservacoes(): ?string
    {
        return $this->observacoes;
    }

    public function setObservacoes(?string $observacoes): self
    {
        $this->observacoes = $observacoes;
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
