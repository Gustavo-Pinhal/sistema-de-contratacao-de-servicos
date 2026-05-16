<?php

namespace App\Entity\Portifolio;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use App\Entity\Servico\Prestador;

class Portifolio
{
    private ?string $id = null;
    private ?string $biografia = null;
    private int $servicosConcluidos = 0;
    private Collection $projetos;
    private ?Prestador $prestador = null;

    public function __construct()
    {
        $this->projetos = new ArrayCollection();
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function setId(string $id): self
    {
        $this->id = $id;
        return $this;
    }

    public function getBiografia(): ?string
    {
        return $this->biografia;
    }

    public function setBiografia(?string $biografia): self
    {
        $this->biografia = $biografia;
        return $this;
    }

    public function getServicosConcluidos(): int
    {
        return $this->servicosConcluidos;
    }

    public function setServicosConcluidos(int $servicosConcluidos): self
    {
        $this->servicosConcluidos = $servicosConcluidos;
        return $this;
    }

    public function getProjetos(): Collection
    {
        return $this->projetos;
    }

    public function getPrestador(): ?Prestador
    {
        return $this->prestador;
    }

    public function setPrestador(?Prestador $prestador): self
    {
        $this->prestador = $prestador;

        if ($prestador !== null && $this->id === null) {
            $id = $prestador->getId();
            $this->id = $id !== null ? (string) $id : null;
        }

        return $this;
    }
}
