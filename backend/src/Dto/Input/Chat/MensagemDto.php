<?php

namespace App\Dto\Input\Chat;

use Symfony\Component\Validator\Constraints as Assert;

readonly class MensagemDto
{
    public function __construct(
        #[Assert\Length(max: 512)]
        public ?string $texto = null,

        #[Assert\Uuid]
        public ?string $responde = null,
    ) {}
}
