<?php

namespace App\Dto\Request\EditarPerfil;

use Symfony\Component\Validator\Constraints as Assert;

final class EditarPrestadorInputDto
{
    public function __construct(
        #[Assert\NotBlank(message: 'O nome não pode estar em branco.')]
        public readonly string $nome,

        public readonly ?string $nomeProfissional,

        #[Assert\NotBlank(message: 'O CEP é obrigatório.')]
        public readonly string $cep,

        #[Assert\Count(min: 1, minMessage: 'Selecione ao menos uma profissão.')]
        /** @var int[] */
        public readonly array $profissoes,
    ) {}
}
