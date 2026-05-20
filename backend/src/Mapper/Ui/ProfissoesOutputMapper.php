<?php

namespace App\Mapper\Ui;

use App\Entity\Servico\Profissao;

class ProfissoesOutputMapper
{
    /**
     * @param Profissao[] $profissoes;
     */
    public function map(array $profissoes): array
    {
        return array_map(fn(Profissao $profissao) => [
            'id' => $profissao->getId(),
            'descricao' => $profissao->getDescricao(),
        ], $profissoes);
    }
}
