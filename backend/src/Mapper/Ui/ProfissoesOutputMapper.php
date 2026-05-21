<?php

namespace App\Mapper\Ui;

use App\Entity\Servico\Profissao;
use App\Mapper\AbstractMapper;

class ProfissoesOutputMapper extends AbstractMapper
{
    /** @param Profissao $profissao;*/
    public function map(mixed $profissao, array $options = []): array
    {
        return [
            'id' => $profissao->getId(),
            'descricao' => $profissao->getDescricao(),
        ];
    }
}
