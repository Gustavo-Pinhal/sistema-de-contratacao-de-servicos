<?php

namespace App\Entity\Portifolio;

use Symfony\Component\Uid\Uuid;

class Foto
{
    private Uuid $id;
    private ?Projeto $projeto = null;
    private ?string $urlFoto = null;
    private ?int $posicao = null;

    public function __construct()
    {
        $this->id = Uuid::v7();
    }

    public function getId(): Uuid
    {
        return $this->id;
    }

    public function setId(Uuid $id): self
    {
        $this->id = $id;
        return $this;
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

    public function getPosicao(): ?int
    {
        return $this->posicao;
    }

    public function setPosicao(int $posicao): self
    {
        $this->posicao = $posicao;
        return $this;
    }
}
