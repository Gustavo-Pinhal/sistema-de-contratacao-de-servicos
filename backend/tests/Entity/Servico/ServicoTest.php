<?php

namespace App\Tests\Entity\Servico;

use App\Entity\Servico\Orcamento;
use App\Entity\Servico\Servico;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;

#[CoversClass(Servico::class)]
class ServicoTest extends TestCase
{
    public function testDeveCalcularValorTotalVazioComoZero(): void
    {
        $servico = new Servico();

        $this->assertEquals(0.0, $servico->getValorTotal());
    }

    public function testDeveCalcularSomaDeMultiplosOrcamentos(): void
    {
        $servico = new Servico();

        $orcamentos = [
            new Orcamento($servico, 'Orçamento inicial', 150.50),
            new Orcamento($servico, 'Aditivo de orçamento', 49.50),
            new Orcamento($servico, 'Aditivo de orçamento', 100.00),
            new Orcamento($servico, 'desconto', -10.00),
        ];

        foreach ($orcamentos as $orcamento) {
            $servico->getOrcamentos()->add($orcamento);
        }

        $this->assertEquals(290.00, $servico->getValorTotal());
    }
}
