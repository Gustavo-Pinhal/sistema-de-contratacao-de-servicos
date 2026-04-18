<?php

namespace App\Entity\Chat;

use App\Entity\Auth\Usuario;
use Symfony\Component\Uid\Uuid;

class Mensagem
{
    private ?Uuid $id = null;
    private ?Usuario $usuario = null;
    private ?Sala $sala = null;
    private array $conteudo = [];
    private ?Mensagem $respondeA = null;
    private ?Arquivo $arquivo;
    private \DateTimeImmutable $envioEm;
    private ?\DateTimeImmutable $visualizadoEm = null;

    public function __construct()
    {
        $this->id = Uuid::v7();
        $this->envioEm = new \DateTimeImmutable();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getUsuario(): ?Usuario
    {
        return $this->usuario;
    }

    public function setUsuario(Usuario $u): self
    {
        $this->usuario = $u;
        return $this;
    }

    public function getSala(): ?Sala
    {
        return $this->sala;
    }

    public function setSala(Sala $s): self
    {
        $this->sala = $s;
        return $this;
    }

    public function getConteudo(): array
    {
        return $this->conteudo;
    }

    public function setConteudo(array $c): self
    {
        $this->conteudo = $c;
        return $this;
    }

    public function getRespondeA(): ?Mensagem
    {
        return $this->respondeA;
    }

    public function setRespondeA(?Mensagem $r): self
    {
        $this->respondeA = $r;
        return $this;
    }

    public function getArquivo(): ?Arquivo
    {
        return $this->arquivo;
    }

    public function setArquivo(?Arquivo $arquivo): self
    {
        $this->arquivo = $arquivo;
        return $this;
    }

    public function getEnvioEm(): \DateTimeImmutable
    {
        return $this->envioEm;
    }

    public function getVisualizadoEm(): ?\DateTimeImmutable
    {
        return $this->visualizadoEm;
    }

    public function setVisualizadoEm(?\DateTimeImmutable $v): self
    {
        $this->visualizadoEm = $v;
        return $this;
    }
}
