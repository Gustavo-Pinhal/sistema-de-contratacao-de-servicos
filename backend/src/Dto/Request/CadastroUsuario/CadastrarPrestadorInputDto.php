<?php

namespace App\Dto\Request\CadastroUsuario;

use Symfony\Component\Validator\Constraints as Assert;

readonly class CadastrarPrestadorInputDto
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Length(min: 3, max: 255)]
        public ?string $nome,

        #[Assert\NotBlank]
        #[Assert\Email]
        public ?string $email,

        #[Assert\Length(max: 11)]
        public ?string $telefone,

        #[Assert\NotBlank]
        public ?int $profissao,

        #[Assert\NotBlank]
        #[Assert\Length(min: 2, max: 100)]
        public ?string $cidade,

        #[Assert\NotBlank]
        #[Assert\Length(max: 255)]
        public ?string $senha,
    ) {}
}
