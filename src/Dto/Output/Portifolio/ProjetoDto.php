<?php

namespace App\Dto\Output\Portifolio;

use App\Entity\Portifolio\Foto;
use App\Entity\Portifolio\Projeto;
use Symfony\Component\Uid\Uuid;

readonly class ProjetoDto
{
    private function __construct(
        readonly public Uuid $id,
        readonly public string $titulo,
        readonly public ?string $descricao,
        readonly public string $regiao,
        readonly public ?string $valor,
        readonly public ?string $concluido_em,
        readonly public array $urls_fotos,
    ) {}

    public static function fromEntity(Projeto $projeto): self
    {
        $valor = $projeto->isExibirValor()
            ? $projeto->getValor()
            : null;

        $concluidoEm = $projeto->getExibirConcluidoEm() && $projeto->getConcluidoEm()
            ? $projeto->getConcluidoEm()->format('Y-m-d')
            : null;

        $urlFotos = array_map(
            fn(Foto $foto) => $foto->getUrlFoto(),
            $projeto->getFotos()->toArray()
        );

        return new self(
            $projeto->getId(),
            $projeto->getTitulo(),
            $projeto->getDescricao(),
            $projeto->getRegiao(),
            $valor,
            $concluidoEm,
            $urlFotos,
        );
    }
}
