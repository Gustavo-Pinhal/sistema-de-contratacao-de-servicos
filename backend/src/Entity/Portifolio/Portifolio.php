<?php

namespace App\Entity\Portifolio;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Serializer\Attribute\Groups;

class Portifolio
{
    #[Groups(['portifolio:read'])]
    private ?string $id = null;

    #[Groups(['portifolio:read'])]
    private ?string $biografia = null;

    #[Groups(['portifolio:read'])]
    private int $servicosConcluidos = 0;

    #[Groups(['portifolio:read'])]
    private Collection $projetos;

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
}
