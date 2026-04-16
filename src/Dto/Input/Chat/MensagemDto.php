<?php

namespace App\Dto\Input\Chat;

use Symfony\Component\Validator\Constraints as Assert;

readonly class MensagemDto
{
    public function __construct(
        #[Assert\NotBlank(message: "O conteúdo da mensagem não pode estar vazio")]
        #[Assert\Type('array', message: "O conteúdo deve ser um objeto JSON")]
        public array $conteudo
    ) {}
}