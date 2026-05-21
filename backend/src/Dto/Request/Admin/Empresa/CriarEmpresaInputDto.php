<?php

namespace App\Dto\Request\Admin\Empresa;

use Symfony\Component\Validator\Constraints as Assert;

final readonly class CriarEmpresaInputDto
{
    public function __construct(
        #[Assert\NotBlank(message: 'O nome da empresa/proprietário é obrigatório.')]
        #[Assert\Length(min: 3, max: 255, minMessage: 'O nome deve ter pelo menos {{ limit }} caracteres.')]
        public string $nome,

        #[Assert\NotBlank(message: 'O e-mail é obrigatório.')]
        #[Assert\Email(message: 'O e-mail informado não é válido.')]
        public string $email,

        #[Assert\NotBlank(message: 'A senha é obrigatória.')]
        #[Assert\Length(min: 6, minMessage: 'A senha deve ter pelo menos {{ limit }} caracteres.')]
        public string $senha,
    ) {}
}
