<?php

namespace App\Enum;

enum StatusServico: int
{
    case SolicitacaoDeOrcamento = 1;
    case EmDecorrencia = 2;
    case CanceladoPeloCliente = 3;
    case CanceladoPeloPrestador = 4;
    case Concluido = 5;
    case Expirado = 6;
}
