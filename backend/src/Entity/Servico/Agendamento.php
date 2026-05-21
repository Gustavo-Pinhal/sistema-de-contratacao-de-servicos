<?php

namespace App\Entity\Servico;

use App\Enum\StatusAgendamento;
use Symfony\Component\Uid\Uuid;

class Agendamento
{
    private Uuid $id;
    private Servico $servico;
    private \DateTimeInterface $data;
    private ?string $observacoes = null;
    private StatusAgendamento $status;
    private \DateTimeImmutable $criadoEm;
    private ?\DateTimeImmutable $excluidoEm = null;

    public function __construct(Servico $servico, \DateTimeInterface $data, ?string $observacoes)
    {
        $this->id = Uuid::v7();
        $this->status = StatusAgendamento::Proposta;
        $this->servico = $servico;
        $this->servico->addAgendamento($this);
        $this->data = $data;
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

    public function getData(): \DateTimeInterface
    {
        return $this->data;
    }

    public function setData(\DateTimeInterface $data): self
    {
        $this->data = $data;
        return $this;
    }

    public function getObservacoes(): ?string
    {
        return $this->observacoes;
    }

    public function setObservacoes(?string $obs): self
    {
        $this->observacoes = $obs;
        return $this;
    }

    public function getStatus(): StatusAgendamento
    {
        return $this->status;
    }

    public function confirmar(): self
    {
        $this->status = StatusAgendamento::Confirmado;
        return $this;
    }

    public function recusar(): self
    {
        $this->status = StatusAgendamento::Recusado;
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
