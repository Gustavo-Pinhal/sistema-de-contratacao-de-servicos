<?php

namespace App\Entity\Servico;

use App\Entity\Servico\Prestador;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

class Profissao
{
    private ?int $id = null;
    private ?string $descricao = null;
    private \DateTimeImmutable $criadoEm;
    private ?\DateTimeImmutable $excluidoEm = null;
    
    /** @var Collection<int, Prestador> */
    private Collection $prestadores;

    public function __construct()
    {
        $this->criadoEm = new \DateTimeImmutable();
        $this->prestadores = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDescricao(): ?string
    {
        return $this->descricao;
    }

    public function setDescricao(?string $descricao): self
    {
        $this->descricao = $descricao;
        return $this;
    }

    public function getCriadoEm(): \DateTimeImmutable
    {
        return $this->criadoEm;
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

    /**
     * @return Collection<int, Prestador>
     */
    public function getPrestadores(): Collection
    {
        return $this->prestadores;
    }

    public function addPrestador(Prestador $prestador): self
    {
        if (!$this->prestadores->contains($prestador)) {
            $this->prestadores->add($prestador);
            $prestador->addProfissao($this);
        }
        return $this;
    }

    public function removePrestador(Prestador $prestador): self
    {
        if ($this->prestadores->removeElement($prestador)) {
            $prestador->removeProfissao($this);
        }
        return $this;
    }
}