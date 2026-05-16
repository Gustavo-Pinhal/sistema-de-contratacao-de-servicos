<?php

namespace App\Entity\Portifolio;

use Symfony\Component\Uid\Uuid;

class Foto
{
    private ?Uuid $id = null;
    private ?Projeto $projeto = null;
    private ?string $urlFoto = null;
    private ?int $ordem = null;

    public function __construct()
    {
        $this->id = Uuid::v7();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getProjeto(): ?Projeto
    {
        return $this->projeto;
    }

    public function setProjeto(?Projeto $projeto): self
    {
        $this->projeto = $projeto;
        return $this;
    }

    public function getUrlFoto(): ?string
    {
        return $this->urlFoto;
    }

    public function setUrlFoto(string $urlFoto): self
    {
        $this->urlFoto = $urlFoto;
        return $this;
    }

    public function getOrdem(): ?int
    {
        return $this->ordem;
    }

    public function setOrdem(int $ordem): self
    {
        $this->ordem = $ordem;
        return $this;
    }
}
