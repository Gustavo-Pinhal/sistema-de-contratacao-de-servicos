<?php

namespace App\Entity\Chat;

use App\Entity\Auth\Usuario;
use Symfony\Component\Uid\Uuid;

class Mensagem
{
    private Uuid $id;
    private Usuario $usuario;
    private Sala $sala;
    private array $conteudo = [];
    private ?Mensagem $responde = null;
    private ?Arquivo $arquivo = null;
    private \DateTimeImmutable $envioEm;
    private ?\DateTimeImmutable $visualizadoEm = null;

    public function __construct(
        Usuario $usuario,
        Sala $sala,
        ?Mensagem $responde = null,
    ) {
        $this->id = Uuid::v7();
        $this->usuario = $usuario;
        $this->sala = $sala;
        $this->responde = $responde;
        $this->envioEm = new \DateTimeImmutable();
    }

    public function getId(): Uuid
    {
        return $this->id;
    }

    public function getUsuario(): Usuario
    {
        return $this->usuario;
    }

    public function getSala(): Sala
    {
        return $this->sala;
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

    public function getResponde(): ?Mensagem
    {
        return $this->responde;
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

    public function visualizar(): self
    {
        $this->visualizadoEm = new \DateTimeImmutable();
        return $this;
    }
}
