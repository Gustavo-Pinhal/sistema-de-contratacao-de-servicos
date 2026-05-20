<?php

declare(strict_types=1);

namespace App\Entity\Empresarial;

use App\Entity\Auth\Usuario;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Uid\Uuid;

class Empresa
{
    private Uuid $id;
    private Usuario $usuario;
    private \DateTimeImmutable $criadoEm;
    private ?\DateTimeImmutable $excluidoEm = null;
    private Collection $prestadores;

    public function __construct(Usuario $usuario)
    {
        $this->id = $usuario->getId();
        $this->usuario = $usuario;
        $this->criadoEm = new \DateTimeImmutable();
        $this->prestadores = new ArrayCollection();
    }

    public function getId(): Uuid
    {
        return $this->id;
    }

    public function getUsuario(): Usuario
    {
        return $this->usuario;
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
     * @return Collection<int, EmpresaPrestador>
     */
    public function getPrestadores(): Collection
    {
        return $this->prestadores;
    }

    public function addPrestador(EmpresaPrestador $prestador): self
    {
        if (!$this->prestadores->contains($prestador)) {
            $this->prestadores->add($prestador);
        }

        return $this;
    }
}
