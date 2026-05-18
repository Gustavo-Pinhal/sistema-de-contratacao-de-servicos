<?php

declare(strict_types=1);

namespace App\Entity\Avaliacao;

use App\Entity\Servico\Servico;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Uid\Uuid;

class Avaliacao
{
    private Uuid $idServico;
    private Servico $servico;
    private float $nota;
    private ?string $comentario = null;
    private Collection $imagens;

    public function __construct(
        Servico $servico,
        float $nota,
        ?string $comentario = null
    ) {
        $this->servico = $servico;
        $this->idServico = $servico->getId();
        $this->nota = $nota;
        $this->comentario = $comentario;
        $this->imagens = new ArrayCollection();
    }

    public function getId(): Uuid
    {
        return $this->idServico;
    }

    public function getServico(): Servico
    {
        return $this->servico;
    }

    public function getNota(): float
    {
        return $this->nota;
    }

    public function setNota(float $nota): self
    {
        $this->nota = $nota;
        return $this;
    }

    public function getComentario(): ?string
    {
        return $this->comentario;
    }

    public function setComentario(?string $comentario): self
    {
        $this->comentario = $comentario;
        return $this;
    }

    /** @return Collection<int, Imagem> */
    public function getImagens(): Collection
    {
        return $this->imagens;
    }

    public function addImagem(Imagem $imagem): self
    {
        if (!$this->imagens->contains($imagem)) {
            $this->imagens->add($imagem);
        }
        return $this;
    }
}
