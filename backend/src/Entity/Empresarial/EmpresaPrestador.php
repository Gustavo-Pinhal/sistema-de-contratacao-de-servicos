<?php

declare(strict_types=1);

namespace App\Entity\Empresarial;

use Symfony\Component\Uid\Uuid;

class EmpresaPrestador
{
    private Uuid $idPrestador;
    private Empresa $empresa;
    private \DateTimeImmutable $criadoEm;
    private ?\DateTimeImmutable $excluidoEm = null;

    public function __construct(Empresa $empresa, Uuid $idPrestador)
    {
        $this->empresa = $empresa;
        $this->idPrestador = $idPrestador;
        $this->criadoEm = new \DateTimeImmutable();
    }

    public function getIdPrestador(): Uuid
    {
        return $this->idPrestador;
    }

    public function getEmpresa(): Empresa
    {
        return $this->empresa;
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
}
