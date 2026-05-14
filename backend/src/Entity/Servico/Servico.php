<?php

namespace App\Entity\Servico;

use App\Entity\Auth\Usuario;
use App\Entity\Chat\Sala;
use App\Entity\Localizacao\Endereco;
use App\Enum\StatusServico;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

class Servico
{
    #[Groups(['meus_orcamentos:read', 'servico_dashboard:read'])]
    private ?Uuid $id = null;

    #[Groups('servico_dashboard:read')]
    private ?Usuario $cliente = null;

    #[Groups('meus_orcamentos:read')]
    private ?Usuario $prestador = null;

    private ?StatusServico $status = null;

    private ?Endereco $endereco = null;

    private ?Sala $sala = null;

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

    public function getCliente(): ?Usuario
    {
        return $this->cliente;
    }

    public function setCliente(Usuario $cliente): self
    {
        $this->cliente = $cliente;
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

    public function getInicio(): \DateTimeImmutable
    {
        return $this->inicio;
    }

    public function setInicio(\DateTimeImmutable $inicio): self
    {
        $this->inicio = $inicio;
        return $this;
    }

    public function getStatus(): ?StatusServico
    {
        return $this->status;
    }

    public function setStatus(StatusServico $status): self
    {
        $this->status = $status;
        return $this;
    }

    public function getEndereco(): ?Endereco
    {
        return $this->endereco;
    }

    public function setEndereco(Endereco $endereco): self
    {
        $this->endereco = $endereco;
        return $this;
    }

    public function getSala(): ?Sala
    {
        return $this->sala;
    }

    public function setSala(Sala $sala): self
    {
        $this->sala = $sala;
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
