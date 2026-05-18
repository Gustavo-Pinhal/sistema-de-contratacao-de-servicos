<?php

declare(strict_types=1);

namespace App\Entity\Avaliacao;

use Symfony\Component\Uid\Uuid;

class Imagem
{
    private Uuid $id;
    private Avaliacao $avaliacao;
    private string $caminho;
    private string $mimeType;
    private int $tamanho;

    public function __construct(
        Avaliacao $avaliacao,
        string $caminho,
        string $mimeType,
        int $tamanho
    ) {
        $this->id = Uuid::v7();
        $this->avaliacao = $avaliacao;
        $this->caminho = $caminho;
        $this->mimeType = $mimeType;
        $this->tamanho = $tamanho;
    }

    public function getId(): Uuid
    {
        return $this->id;
    }

    public function getAvaliacao(): Avaliacao
    {
        return $this->avaliacao;
    }

    public function getCaminho(): string
    {
        return $this->caminho;
    }

    public function getMimeType(): string
    {
        return $this->mimeType;
    }

    public function getTamanho(): int
    {
        return $this->tamanho;
    }
}
