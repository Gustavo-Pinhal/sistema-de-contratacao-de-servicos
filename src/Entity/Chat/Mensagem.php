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

    public function setUsuario(Usuario $usuario): self
    {
        $this->usuario = $usuario;
        return $this;
    }

    public function getSala(): ?Sala
    {
        return $this->sala;
    }

    public function setSala(Sala $sala): self
    {
        $this->sala = $sala;
        return $this;
    }

    public function getConteudo(): array
    {
        return $this->conteudo;
    }

    public function setConteudo(array $conteudo): self
    {
        $this->conteudo = $conteudo;
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

    public function setVisualizadoEm(?\DateTimeImmutable $visualizadoEm): self
    {
        $this->visualizadoEm = $visualizadoEm;
        return $this;
    }
}