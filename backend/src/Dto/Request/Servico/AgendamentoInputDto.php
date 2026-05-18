<?php

namespace App\Dto\Request\Servico;

use Symfony\Component\Validator\Constraints as Assert;

readonly class AgendamentoInputDto
{
    public function __construct(
        #[Assert\NotBlank(message: 'A data do agendamento é obrigatória.')]
        #[Assert\DateTime(format: \DateTimeInterface::ATOM, message: 'A data deve estar no formato ISO 8601 válido.')]
        public ?string $data,

        #[Assert\Length(max: 1000, maxMessage: 'As observações não podem passar de {{ limit }} caracteres.')]
        public ?string $observacoes = null,
    ) {}
}
