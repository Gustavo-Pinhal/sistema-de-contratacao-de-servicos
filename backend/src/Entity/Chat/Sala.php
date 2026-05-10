<?php

namespace App\Entity\Chat;

use App\Entity\Auth\Usuario;
use App\Entity\Servico\Servico;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

class Sala
{
    private ?int $id = null;
    private ?Servico $servico = null;
    private ?Usuario $prestador = null;
    private ?Usuario $cliente = null;
    private Collection $mensagens;

    public function __construct()
    {
        $this->mensagens = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getServico(): ?Servico
    {
        return $this->servico;
    }

    public function setServico(Servico $servico): self
    {
        $this->servico = $servico;
        return $this;
    }

    public function getPrestador(): ?Usuario
    {
        return $this->prestador;
    }

    public function setPrestador(Usuario $prestador): self
    {
        $this->prestador = $prestador;
        return $this;
    }

    public function getCliente(): ?Usuario
    {
        return $this->cliente;
    }

    public function setCliente(Usuario $cliente): self
    {
        $this->cliente = $cliente;
        return $this;
    }

    public function eParticipante(Usuario $usuario): bool
    {
        return $this->cliente->getId()->equals($usuario->getId())
            || $this->prestador->getId()->equals($usuario->getId());
    }

    /**
     * @return Collection<int, Mensagem>
     */
    public function getMensagens(): Collection
    {
        return $this->mensagens;
    }

    public function addMensagem(Mensagem $mensagem): self
    {
        if (!$this->mensagens->contains($mensagem)) {
            $this->mensagens->add($mensagem);
            $mensagem->setSala($this);
        }

        return $this;
    }
}
