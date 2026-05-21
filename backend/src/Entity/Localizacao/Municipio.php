<?php

namespace App\Entity\Localizacao;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Serializer\Attribute\Groups;

class Municipio
{
    private ?int $id = null;

    private ?string $codigoIbge = null;

    #[Groups('busca_endereco:read')]
    private ?string $nome = null;

    #[Groups('busca_endereco:read')]
    private ?string $uf = null;

    /** @var Collection<int, Cep> */
    private Collection $ceps;

    public function __construct()
    {
        $this->ceps = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCodigoIbge(): ?string
    {
        return $this->codigoIbge;
    }

    public function setCodigoIbge(string $codigoIbge): self
    {
        $this->codigoIbge = $codigoIbge;
        return $this;
    }

    public function getNome(): ?string
    {
        return $this->nome;
    }

    public function setNome(string $nome): self
    {
        $this->nome = $nome;
        return $this;
    }

    public function getUf(): ?string
    {
        return $this->uf;
    }

    public function setUf(string $uf): self
    {
        $this->uf = $uf;
        return $this;
    }

    /** @return Collection<int, Cep> */
    public function getCeps(): Collection
    {
        return $this->ceps;
    }
}
