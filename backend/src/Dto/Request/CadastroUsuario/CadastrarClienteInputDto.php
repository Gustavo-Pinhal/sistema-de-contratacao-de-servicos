<?php

namespace App\Dto\Request\CadastroUsuario;

use Symfony\Component\Validator\Constraints as Assert;

readonly class CadastrarClienteInputDto
{
    public function __construct(
        #[Assert\Length(min: 3, max: 255)]
        public ?string $nome,

        #[Assert\Email]
        public ?string $email,

        #[Assert\Length(max: 11)]
        public ?string $telefone,

        #[Assert\Length(max: 255)]
        public ?string $senha,
    ) {}
}
