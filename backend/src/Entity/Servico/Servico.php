<?php

namespace App\Entity\Servico;

use App\Entity\Auth\Usuario;
use App\Entity\Chat\Sala;
use App\Entity\Localizacao\Endereco;
use App\Enum\StatusServico;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Uid\Uuid;
use App\Entity\Portifolio\Projeto;

class Servico
{
    private Uuid $id;
    private Usuario $cliente;
    private Usuario $prestador;
    private StatusServico $status;
    private Endereco $endereco;
    private Collection $agendamentos;
    private Collection $orcamentos;
    private Sala $sala;
    private \DateTimeImmutable $inicio;
    private ?\DateTimeImmutable $encerramento = null;
    private ?\DateTimeImmutable $excluidoEm = null;
    private ?Projeto $projeto = null;

    public function __construct(
        Usuario $cliente,
        Usuario $prestador,
        Endereco $endereco,
    ) {
        $this->id = Uuid::v7();
        $this->cliente = $cliente;
        $this->prestador = $prestador;
        $this->endereco = $endereco;
        $this->status = StatusServico::SolicitacaoDeOrcamento;
        $this->agendamentos = new ArrayCollection();
        $this->orcamentos = new ArrayCollection();
        $this->sala = new Sala($this);
        $this->inicio = new \DateTimeImmutable();
    }

    public function getId(): Uuid
    {
        return $this->id;
    }

    public function getCliente(): Usuario
    {
        return $this->cliente;
    }

    public function getPrestador(): Usuario
    {
        return $this->prestador;
    }

    public function getInicio(): \DateTimeImmutable
    {
        return $this->inicio;
    }

    public function getStatus(): StatusServico
    {
        return $this->status;
    }

    public function getEndereco(): Endereco
    {
        return $this->endereco;
    }

    /** @return Collection<int, Agendamento> */
    public function getAgendamentos(): Collection
    {
        return $this->agendamentos;
    }

    /** @return Collection<int, Orcamento> */
    public function getOrcamentos(): Collection
    {
        return $this->orcamentos;
    }

    public function addOrcamento(Orcamento $orcamento): self
    {
        $this->status = StatusServico::EmDecorrencia;
        $this->orcamentos->add($orcamento);
        return $this;
    }

    public function getValorTotal(): float
    {
        return array_reduce(
            $this->orcamentos->toArray(),
            fn(float $total, Orcamento $orcamento) => $total + $orcamento->getValor(),
            0.0
        );
    }

    public function getSala(): Sala
    {
        return $this->sala;
    }

    public function addAgendamento(Agendamento $agendamento): self
    {
        if (!$this->agendamentos->contains($agendamento)) {
            $this->agendamentos->add($agendamento);
        }

        return $this;
    }

    public function getEncerramento(): ?\DateTimeImmutable
    {
        return $this->encerramento;
    }

    public function cancelar(Usuario $cancelante): self
    {
        $this->encerramento = new \DateTimeImmutable();

        $this->status = $cancelante->getId()->equals($this->cliente->getId())
            ? StatusServico::CanceladoPeloCliente
            : StatusServico::CanceladoPeloPrestador;

        return $this;
    }

    public function concluir(): self
    {
        $this->status = StatusServico::Concluido;
        $this->encerramento = new \DateTimeImmutable();
        return $this;
    }

    public function expirar(): self
    {
        $this->status = StatusServico::Expirado;
        $this->encerramento = new \DateTimeImmutable();
        return $this;
    }

    public function getProjeto(): ?Projeto
    {
        return $this->projeto;
    }

    public function setProjeto(?Projeto $projeto): self
    {
        $this->projeto = $projeto;

        if ($projeto && $projeto->getServico() !== $this) {
            $projeto->setServico($this);
        }

        return $this;
    }

    public function getExcluidoEm(): ?\DateTimeImmutable
    {
        return $this->excluidoEm;
    }

    public function excluir(): void
    {
        $this->excluidoEm = new \DateTimeImmutable();
    }

    public function eParticipante(Usuario $usuario): bool
    {
        return $this->cliente->getId()->equals($usuario->getId())
            || $this->prestador->getId()->equals($usuario->getId());
    }
}
