<?php

namespace App\Entity\Servico;

use App\Entity\Auth\Usuario;
use App\Entity\Localizacao\Cep;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Uid\Uuid;

class Prestador
{
    private Usuario $usuario;
    private string $nome;
    private Cep $cep;
    private bool $ativo = true;
    private \DateTimeImmutable $criadoEm;
    private ?\DateTimeImmutable $excluidoEm = null;
    private Collection $profissoes;

    public function __construct(
        Usuario $usuario,
        string $nome,
        Cep $cep,
    ) {
        $this->usuario = $usuario;
        $this->nome = $nome;
        $this->cep = $cep;
        $this->criadoEm = new \DateTimeImmutable();
        $this->ativo = true;
        $this->profissoes = new ArrayCollection();
    }

    public function getId(): ?Uuid
    {
        return $this->usuario->getId();
    }

    public function getUsuario(): Usuario
    {
        return $this->usuario;
    }

    public function getNome(): string
    {
        return $this->nome;
    }

    public function setNome(string $nome): self
    {
        $this->nome = $nome;
        return $this;
    }

    public function getCep(): Cep
    {
        return $this->cep;
    }

    public function setCep(Cep $cep): self
    {
        $this->cep = $cep;
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
