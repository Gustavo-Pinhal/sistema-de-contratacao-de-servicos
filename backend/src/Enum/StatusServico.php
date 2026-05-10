<?php

namespace App\Enum;

enum StatusServico: int
{
    case SolicitacaoDeOrcamento = 1;
    case Orcamento = 2;
    case EmDecorrencia = 3;
    case CanceladoPeloCliente = 4;
    case CanceladoPeloPrestador = 5;
    case Concluido = 6;
    case Expirado = 7;
}
