<?php

namespace App\Dto\Request\Servico;

use Symfony\Component\Validator\Constraints as Assert;

readonly class OrcamentoInputDto
{
    public function __construct(
        #[Assert\NotBlank(message: 'A descrição do orçamento é obrigatória.')]
        #[Assert\Length(max: 255, maxMessage: 'A descrição não pode passar de {{ limit }} caracteres.')]
        public ?string $descricao,

        #[Assert\NotBlank(message: 'O valor do orçamento é obrigatório.')]
        #[Assert\Type(type: 'numeric', message: 'O valor deve ser um número válido.')]
        public ?float $valor,

        #[Assert\Length(max: 1000, maxMessage: 'As observações não podem passar de {{ limit }} caracteres.')]
        public ?string $observacoes = null,
    ) {}
}
