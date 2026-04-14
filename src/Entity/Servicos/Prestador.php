<?php

namespace App\Entity\Servicos;

use App\Entity\Auth\Usuario;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Uid\Uuid;

class Prestador
{
    private ?Uuid $id = null;
    private ?Usuario $usuario = null;
    private ?string $nome = null;
    private bool $ativo = true;
    private \DateTimeImmutable $criadoEm;
    private ?\DateTimeImmutable $excluidoEm = null;

    /** @var Collection<int, Profissao> */
    private Collection $profissoes;

    public function __construct()
    {
        $this->id = Uuid::v7();
        $this->criadoEm = new \DateTimeImmutable();
        $this->ativo = true;
        $this->profissoes = new ArrayCollection();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getUsuario(): ?Usuario
    {
        return $this->usuario;
    }

    public function setUsuario(Usuario $usuario): self
    {
        $this->usuario = $usuario;
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

    public function isAtivo(): bool
    {
        return $this->ativo;
    }

    public function setAtivo(bool $ativo): self
    {
        $this->ativo = $ativo;
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
     * @return Collection<int, Profissao>
     */
    public function getProfissoes(): Collection
    {
        return $this->profissoes;
    }

    public function addProfissao(Profissao $profissao): self
    {
        if (!$this->profissoes->contains($profissao)) {
            $this->profissoes->add($profissao);
        }
        return $this;
    }

    public function removeProfissao(Profissao $profissao): self
    {
        $this->profissoes->removeElement($profissao);
        return $this;
    }
}