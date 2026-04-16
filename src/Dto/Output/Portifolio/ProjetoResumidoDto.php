<?php

namespace App\Dto\Output\Portifolio;

use App\Entity\Portifolio\Projeto;
use Symfony\Component\Uid\Uuid;

readonly class ProjetoResumidoDto
{
    private function __construct(
        readonly public Uuid $id,
        readonly public string $titulo,
        readonly public ?string $descricao,
        readonly public string $regiao,
        readonly public ?string $valor,
        readonly public ?string $concluido_em,
        readonly public ?string $url_foto_capa,
    ) {}

    public static function fromEntity(Projeto $projeto): self
    {
        $valor = $projeto->isExibirValor()
            ? $projeto->getValor()
            : null;

        $concluidoEm = $projeto->getExibirConcluidoEm()
            ? $projeto->getConcluidoEm()
            : null;

        return new self(
            $projeto->getId(),
            $projeto->getTitulo(),
            $projeto->getDescricao(),
            $projeto->getRegiao(),
            $valor,
            $concluidoEm,
            $projeto->getFotos()->first()->getUrlFoto(),
        );
    }
}
