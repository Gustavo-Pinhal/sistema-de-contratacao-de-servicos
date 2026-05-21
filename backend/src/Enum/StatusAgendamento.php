<?php

namespace App\Enum;

enum StatusAgendamento: int
{
    case Proposta = 1;
    case Confirmado = 2;
    case Recusado = 3;
}
