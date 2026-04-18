<?php

namespace App\Dto\Output\Chat;

readonly class MensagemDto
{
    public function __construct(
        public string $id,
        public string $enviado_por,
        public string $tipo,
        public ?string $texto,
        public ?string $referencia,
        public array $arquivo, // Array de objetos com ID e URL
        public string $enviado_em,
    ) {}
}