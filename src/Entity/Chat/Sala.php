<?php

namespace App\Entity\Chat;

use App\Entity\Auth\Cliente;
use App\Entity\Servicos\Prestador;
use App\Entity\Servicos\Servico;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

class Sala
{
    private ?int $id = null;
    private ?Servico $servico = null;
    private ?Prestador $prestador = null;
    private ?Cliente $cliente = null;
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

    public function getPrestador(): ?Prestador
    {
        return $this->prestador;
    }

    public function setPrestador(Prestador $prestador): self
    {
        $this->prestador = $prestador;
        return $this;
    }

    public function getCliente(): ?Cliente
    {
        return $this->cliente;
    }

    public function setCliente(Cliente $cliente): self
    {
        $this->cliente = $cliente;
        return $this;
    }

    /**
     * @return Collection<int, Mensagem>
     */
    public function getMensagens(): Collection
    {
        return $this->mensagens;
    }
}