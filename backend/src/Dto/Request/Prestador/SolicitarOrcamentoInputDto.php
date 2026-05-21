<?php

namespace App\Dto\Request\Prestador;

use Symfony\Component\Validator\Constraints as Assert;

readonly class SolicitarOrcamentoInputDto
{
    public function __construct(
        #[Assert\NotBlank]
        public ?string $descricao,

        #[Assert\Uuid]
        public ?string $idEndereco,

        #[Assert\Length(min: 8, max: 8)]
        #[Assert\Regex(pattern: "/^\d+$/")]
        public ?string $cep,

        #[Assert\Length(max: 255)]
        public ?string $bairro,

        #[Assert\Length(max: 255)]
        public ?string $rua,

        #[Assert\Length(max: 20)]
        public ?string $numero,

        #[Assert\Length(max: 255)]
        public ?string $complemento,
    ) {}
}
