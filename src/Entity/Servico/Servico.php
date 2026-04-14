<?php

namespace App\Entity\Servico;

use App\Entity\Servico\Cliente;
use App\Entity\Servico\Prestador;
use Symfony\Component\Uid\Uuid;

class Servico
{
    private ?Uuid $id = null;
    private ?Cliente $cliente = null;
    private ?Prestador $prestador = null;
    private \DateTimeImmutable $inicio;
    private ?\DateTimeImmutable $encerramento = null;
    private ?\DateTimeImmutable $excluidoEm = null;

    public function __construct()
    {
        $this->id = Uuid::v7();
        $this->inicio = new \DateTimeImmutable();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
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

    public function getPrestador(): ?Prestador
    {
        return $this->prestador;
    }

    public function setPrestador(Prestador $prestador): self
    {
        $this->prestador = $prestador;
        return $this;
    }

    public function getInicio(): \DateTimeImmutable
    {
        return $this->inicio;
    }

    public function setInicio(\DateTimeImmutable $inicio): self
    {
        $this->inicio = $inicio;
        return $this;
    }

    public function getEncerramento(): ?\DateTimeImmutable
    {
        return $this->encerramento;
    }

    public function setEncerramento(?\DateTimeImmutable $encerramento): self
    {
        $this->encerramento = $encerramento;
        return $this;
    }

    public function getExcluidoEm(): ?\DateTimeImmutable
    {
        return $this->excluidoEm;
    }

    public function setExcluidoEm(?\DateTimeImmutable $excluidoEm): self
    {
        $this->excluidoEm = $excluidoEm;
        return $this;
    }
}