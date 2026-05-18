<?php

namespace App\Entity\Portifolio;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use App\Entity\Servico\Prestador;
use Symfony\Component\Uid\Uuid;

class Portifolio
{
    private Prestador $prestador;
    private ?string $biografia = null;
    private int $servicosConcluidos = 0;
    private Collection $projetos;

    public function __construct(
        Prestador $prestador,
    ) {
        $this->prestador = $prestador;
        $this->projetos = new ArrayCollection();
    }

    public function getId(): ?Uuid
    {
        return $this->prestador->getId();
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
}
