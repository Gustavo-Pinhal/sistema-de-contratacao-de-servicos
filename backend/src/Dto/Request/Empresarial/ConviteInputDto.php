<?php

namespace App\Dto\Request\Empresarial;

use Symfony\Component\Validator\Constraints as Assert;

readonly class ConviteInputDto
{
    public function __construct(
        #[Assert\NotBlank(message: 'O e-mail do prestador é obrigatório.')]
        #[Assert\Email(message: 'O e-mail informado não é válido.')]
        public string $email,
    ) {}
}
