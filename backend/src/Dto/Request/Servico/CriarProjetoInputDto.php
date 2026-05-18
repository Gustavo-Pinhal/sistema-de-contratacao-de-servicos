<?php

declare(strict_types=1);

namespace App\Dto\Request\Servico;

use Symfony\Component\Validator\Constraints as Assert;

readonly class CriarProjetoInputDto
{
    public function __construct(
        #[Assert\NotBlank(message: 'O título do projeto é obrigatório.')]
        #[Assert\Length(
            min: 3,
            max: 255,
            minMessage: 'O título deve ter pelo menos {{ limit }} caracteres.',
            maxMessage: 'O título não pode passar de {{ limit }} caracteres.'
        )]
        public ?string $titulo,

        #[Assert\NotBlank(message: 'A descrição do projeto é obrigatória.')]
        #[Assert\Length(
            max: 4000,
            maxMessage: 'A descrição não pode passar de {{ limit }} caracteres.'
        )]
        public ?string $descricao,

        #[Assert\NotNull(message: 'A preferência de exibição do valor é obrigatória.')]
        #[Assert\Type(type: 'boolean', message: 'O campo exibirValor deve ser booleano.')]
        public ?bool $exibirValor,

        #[Assert\NotNull(message: 'A preferência de exibição da data de conclusão é obrigatória.')]
        #[Assert\Type(type: 'boolean', message: 'O campo exibirConcluidoEm deve ser booleano.')]
        public ?bool $exibirConcluidoEm,
    ) {}
}
