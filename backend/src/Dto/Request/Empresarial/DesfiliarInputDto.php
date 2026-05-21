<?php

namespace App\Dto\Request\Empresarial;

use Symfony\Component\Validator\Constraints as Assert;

final readonly class DesfiliarInputDto
{
    public function __construct(
        #[Assert\NotBlank(message: 'O ID do prestador é obrigatório.')]
        #[Assert\Uuid(message: 'O ID informado deve ser um UUID válido.')]
        public string $prestadorId,
    ) {}
}
