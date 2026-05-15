<?php

namespace App\Entity\Chat;

use App\Entity\Auth\Usuario;
use App\Entity\Servico\Servico;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

class Sala
{
    private ?int $id = null;
    private Servico $servico;
    private Usuario $prestador;
    private Usuario $cliente;
    private Collection $mensagens;

    public function __construct(
        Servico $servico,
    ) {
        $this->servico = $servico;
        $this->prestador = $servico->getPrestador();
        $this->cliente = $servico->getCliente();
        $this->mensagens = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getServico(): Servico
    {
        return $this->servico;
    }

    public function getPrestador(): Usuario
    {
        return $this->prestador;
    }

    public function getCliente(): Usuario
    {
        return $this->cliente;
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
        }

        return $this;
    }
}
