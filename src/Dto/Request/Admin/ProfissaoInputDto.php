<?php

namespace App\Dto\Request\Admin;

use Symfony\Component\Validator\Constraints as Assert;

readonly class ProfissaoInputDto
{
    public function __construct(
        #[Assert\NotBlank(message: "A descrição é obrigatória")]
        #[Assert\Length(max: 60, maxMessage: "A descrição não pode ter mais de 60 caracteres")]
        public ?string $descricao = null
    ) {}
}