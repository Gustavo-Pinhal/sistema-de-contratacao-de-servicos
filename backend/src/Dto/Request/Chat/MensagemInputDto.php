<?php

namespace App\Dto\Request\Chat;

use Symfony\Component\Validator\Constraints as Assert;

readonly class MensagemInputDto
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Length(max: 512)]
        public ?string $texto = null,

        #[Assert\Uuid]
        public ?string $responde = null,
    ) {}
}
