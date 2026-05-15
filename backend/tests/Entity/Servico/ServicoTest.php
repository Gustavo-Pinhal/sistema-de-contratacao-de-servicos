<?php

namespace App\Tests\Entity\Servico;

use App\Entity\Auth\Usuario;
use App\Entity\Localizacao\Endereco;
use App\Entity\Servico\Orcamento;
use App\Entity\Servico\Servico;
use App\Enum\StatusServico;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Uid\Uuid;

#[CoversClass(Servico::class)]
class ServicoTest extends TestCase
{
    public function testDeveCalcularValorTotalVazioComoZero(): void
    {
        $servico = $this->criarServicoParaTeste($this->criarUsuarioMock(), $this->criarUsuarioMock());

        $this->assertEquals(0.0, $servico->getValorTotal());
    }

    public function testDeveCalcularSomaDeMultiplosOrcamentos(): void
    {
        $servico = $this->criarServicoParaTeste($this->criarUsuarioMock(), $this->criarUsuarioMock());

        $orcamentos = [
            new Orcamento($servico, 'Orçamento inicial', 150.50),
            new Orcamento($servico, 'Aditivo de orçamento', 49.50),
            new Orcamento($servico, 'Aditivo de orçamento', 100.00),
            new Orcamento($servico, 'desconto', -10.00),
        ];

        foreach ($orcamentos as $orcamento) {
            $servico->addOrcamento($orcamento);
        }

        $this->assertEquals(290.00, $servico->getValorTotal());
    }

    public function testDeveIniciarComStatusSolicitacaoDeOrcamento(): void
    {
        $servico = $this->criarServicoParaTeste($this->criarUsuarioMock(), $this->criarUsuarioMock());

        $this->assertEquals(StatusServico::SolicitacaoDeOrcamento, $servico->getStatus());
        $this->assertNull($servico->getEncerramento());
    }

    public function testDeveMudarParaEmDecorrenciaAoAdicionarOrcamento(): void
    {
        $servico = $this->criarServicoParaTeste($this->criarUsuarioMock(), $this->criarUsuarioMock());
        $orcamento = $this->createMock(Orcamento::class);

        $servico->addOrcamento($orcamento);

        $this->assertEquals(StatusServico::EmDecorrencia, $servico->getStatus());
        $this->assertCount(1, $servico->getOrcamentos());
    }

    public function testDeveMudarParaCanceladoPeloClienteEDefinirEncerramento(): void
    {
        $cliente = $this->criarUsuarioMock();
        $servico = $this->criarServicoParaTeste($cliente, $this->criarUsuarioMock());

        $servico->cancelar($cliente);

        $this->assertEquals(StatusServico::CanceladoPeloCliente, $servico->getStatus());
        $this->assertInstanceOf(\DateTimeImmutable::class, $servico->getEncerramento());
    }

    public function testDeveMudarParaCanceladoPeloPrestador(): void
    {
        $prestador = $this->criarUsuarioMock();
        $servico = $this->criarServicoParaTeste($this->criarUsuarioMock(), $prestador);

        $servico->cancelar($prestador);

        $this->assertEquals(StatusServico::CanceladoPeloPrestador, $servico->getStatus());
    }

    public function testDeveMudarParaConcluidoEDefinirEncerramento(): void
    {
        $servico = $this->criarServicoParaTeste($this->criarUsuarioMock(), $this->criarUsuarioMock());

        $servico->concluir();

        $this->assertEquals(StatusServico::Concluido, $servico->getStatus());
        $this->assertNotNull($servico->getEncerramento());
    }

    public function testDeveMudarParaExpirado(): void
    {
        $servico = $this->criarServicoParaTeste($this->criarUsuarioMock(), $this->criarUsuarioMock());

        $servico->expirar();

        $this->assertEquals(StatusServico::Expirado, $servico->getStatus());
        $this->assertNotNull($servico->getEncerramento());
    }

    private function criarUsuarioMock(): Usuario
    {
        $usuario = $this->createMock(Usuario::class);
        $usuario->method('getId')->willReturn(Uuid::v7());
        return $usuario;
    }

    private function criarServicoParaTeste(Usuario $cliente, Usuario $prestador): Servico
    {
        $endereco = $this->createMock(Endereco::class);
        return new Servico($cliente, $prestador, $endereco);
    }
}
