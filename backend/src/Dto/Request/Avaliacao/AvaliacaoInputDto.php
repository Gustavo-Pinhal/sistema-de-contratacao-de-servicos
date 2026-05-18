<?php

namespace App\Dto\Request\Avaliacao;

use Symfony\Component\Validator\Constraints as Assert;

readonly class AvaliacaoInputDto
{
    public function __construct(
        #[Assert\NotBlank(message: 'A nota da avaliação é obrigatória.')]
        #[Assert\Type(type: 'numeric', message: 'A nota deve ser um número válido.')]
        #[Assert\Range(
            min: 0,
            max: 10,
            notInRangeMessage: 'A nota deve estar entre {{ min }} e {{ max }}.'
        )]
        public ?float $nota,

        #[Assert\Length(
            max: 2000,
            maxMessage: 'O comentário não pode passar de {{ limit }} caracteres.'
        )]
        public ?string $comentario = null,
    ) {}
}
