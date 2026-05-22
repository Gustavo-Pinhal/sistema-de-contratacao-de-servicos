<?php

namespace App\Tests\Controller;

use App\Entity\Auth\Usuario;
use App\Entity\Localizacao\Cep;
use App\Entity\Localizacao\Endereco;
use App\Entity\Servico\Agendamento;
use App\Entity\Servico\Orcamento;
use App\Entity\Servico\Servico;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Testes funcionais para ServicoController, AgendamentoController e OrcamentoController.
 *
 * O DAMA\DoctrineTestBundle envolve cada teste em uma transação revertida
 * automaticamente ao final, garantindo isolamento sem necessidade de
 * limpeza manual do banco de dados.
 */
final class ServicoControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = static::getContainer()->get('doctrine.orm.entity_manager');
    }

    private function autenticar(string $email): void
    {
        $usuario = $this->entityManager->getRepository(Usuario::class)->findOneBy(['email' => $email]);

        if (!$usuario) {
            throw new \LogicException("Usuário $email não encontrado. Verifique se carregou as fixtures.");
        }

        $token = static::getContainer()
            ->get('lexik_jwt_authentication.jwt_manager')
            ->create($usuario);

        $this->client->setServerParameter('HTTP_Authorization', sprintf('Bearer %s', $token));
    }

    private function buscarUsuario(string $email): Usuario
    {
        return $this->entityManager->getRepository(Usuario::class)->findOneBy(['email' => $email]);
    }

    private function criarServico(string $emailCliente, string $emailPrestador): Servico
    {
        $cliente   = $this->buscarUsuario($emailCliente);
        $prestador = $this->buscarUsuario($emailPrestador);
        $cep       = $this->entityManager->getRepository(Cep::class)->find('78280000');

        $endereco = new Endereco();
        $endereco->setUsuario($cliente);
        $endereco->setCep($cep);
        $this->entityManager->persist($endereco);

        $servico = new Servico($cliente, $prestador, $endereco);
        $this->entityManager->persist($servico->getSala());
        $this->entityManager->persist($servico);
        $this->entityManager->flush();

        return $servico;
    }

    private function criarServicoAtivo(string $emailCliente, string $emailPrestador): Servico
    {
        $servico   = $this->criarServico($emailCliente, $emailPrestador);
        $orcamento = new Orcamento($servico, 'Serviço em andamento', 200.0, null);
        $this->entityManager->persist($orcamento);
        $servico->addOrcamento($orcamento);
        $this->entityManager->flush();

        return $servico;
    }

    private function criarAgendamento(Servico $servico): Agendamento
    {
        $agendamento = new Agendamento(
            $servico,
            new \DateTime('+1 day'),
            'Disponível no período da tarde.',
        );
        $this->entityManager->persist($agendamento);
        $this->entityManager->flush();

        return $agendamento;
    }

    // -------------------------------------------------------------------------
    // GET /api/servico/{id}
    // -------------------------------------------------------------------------

    public function testDeveRetornarDetalhesDoServico(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', "/api/servico/{$servico->getId()}");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertArrayHasKey('servico', $conteudo);
        self::assertArrayHasKey('agendamentos', $conteudo);
        self::assertArrayHasKey('orcamentos', $conteudo);
        self::assertArrayHasKey('total', $conteudo);
    }

    public function testGetServicoRetornaSubobjetoServicoCompleto(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', "/api/servico/{$servico->getId()}");

        self::assertResponseIsSuccessful();
        $dados = json_decode($this->client->getResponse()->getContent(), true)['servico'];

        self::assertArrayHasKey('id', $dados);
        self::assertArrayHasKey('prestador', $dados);
        self::assertArrayHasKey('endereco', $dados);
        self::assertArrayHasKey('data', $dados);
        self::assertArrayHasKey('status', $dados);
        self::assertArrayHasKey('cliente', $dados);
        self::assertArrayHasKey('enderecoCompleto', $dados);
        self::assertArrayHasKey('avaliacao', $dados);
        self::assertArrayHasKey('projeto', $dados);
    }

    public function testGetServicoAcessivelPeloPrestador(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('GET', "/api/servico/{$servico->getId()}");

        self::assertResponseIsSuccessful();
    }

    public function testGetServicoRetorna403ParaTerceiro(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('lucas.mendes@exemplo.com');
        $this->client->request('GET', "/api/servico/{$servico->getId()}");

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testGetServicoRetorna401SemAutenticacao(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->client->request('GET', "/api/servico/{$servico->getId()}");

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testGetServicoRetorna404ParaIdInexistente(): void
    {
        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', '/api/servico/00000000-0000-0000-0000-000000000000');

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    // -------------------------------------------------------------------------
    // POST /api/servico/{id}/finalizar
    // -------------------------------------------------------------------------

    public function testPrestadorDeveFinalizarServicoAtivo(): void
    {
        $servico = $this->criarServicoAtivo('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('POST', "/api/servico/{$servico->getId()}/finalizar");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['success']);
    }

    public function testFinalizarAlteraStatusParaConcluido(): void
    {
        $servico = $this->criarServicoAtivo('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('POST', "/api/servico/{$servico->getId()}/finalizar");

        self::assertResponseIsSuccessful();
        $this->entityManager->refresh($servico);
        self::assertEquals(\App\Enum\StatusServico::Concluido, $servico->getStatus());
    }

    public function testFinalizarRetorna422ParaServicoNaoAtivo(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('POST', "/api/servico/{$servico->getId()}/finalizar");

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testFinalizarRetorna403ParaCliente(): void
    {
        $servico = $this->criarServicoAtivo('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request('POST', "/api/servico/{$servico->getId()}/finalizar");

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testFinalizarRetorna404ParaIdInexistente(): void
    {
        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('POST', '/api/servico/00000000-0000-0000-0000-000000000000/finalizar');

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    // -------------------------------------------------------------------------
    // POST /api/servico/{id}/cancelar
    // -------------------------------------------------------------------------

    public function testClienteDeveCancelarServico(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request('POST', "/api/servico/{$servico->getId()}/cancelar");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['success']);
    }

    public function testPrestadorDeveCancelarServico(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('POST', "/api/servico/{$servico->getId()}/cancelar");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['success']);
    }

    public function testCancelarAlteraStatusParaCancelado(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request('POST', "/api/servico/{$servico->getId()}/cancelar");

        self::assertResponseIsSuccessful();
        $this->entityManager->refresh($servico);
        self::assertContains($servico->getStatus(), [
            \App\Enum\StatusServico::CanceladoPeloCliente,
            \App\Enum\StatusServico::CanceladoPeloPrestador,
        ]);
    }

    public function testCancelarRetorna422ParaServicoConcluido(): void
    {
        $servico = $this->criarServicoAtivo('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $servico->concluir();
        $this->entityManager->flush();

        $this->autenticar('cliente@exemplo.com');
        $this->client->request('POST', "/api/servico/{$servico->getId()}/cancelar");

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testCancelarRetorna403ParaTerceiro(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('lucas.mendes@exemplo.com');
        $this->client->request('POST', "/api/servico/{$servico->getId()}/cancelar");

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testCancelarRetorna404ParaIdInexistente(): void
    {
        $this->autenticar('cliente@exemplo.com');
        $this->client->request('POST', '/api/servico/00000000-0000-0000-0000-000000000000/cancelar');

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    // -------------------------------------------------------------------------
    // POST /api/servico/{servico}/agendamento
    // -------------------------------------------------------------------------

    public function testPrestadorDeveCriarAgendamento(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $data    = (new \DateTimeImmutable('+1 day'))->format(\DateTimeInterface::ATOM);

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/agendamento",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['data' => $data, 'observacoes' => 'Turno da tarde.'])
        );

        self::assertResponseIsSuccessful();
        self::assertTrue(json_decode($this->client->getResponse()->getContent(), true)['success']);
    }

    public function testAgendamentoRetorna422ComDataInvalida(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/agendamento",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['data' => 'data-invalida'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testAgendamentoRetorna422SemData(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/agendamento",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['observacoes' => 'Sem data.'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testAgendamentoRetorna403ParaCliente(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $data    = (new \DateTimeImmutable('+1 day'))->format(\DateTimeInterface::ATOM);

        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/agendamento",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['data' => $data])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    // -------------------------------------------------------------------------
    // POST /api/servico/{servico}/agendamento/{agendamento}/confirmar
    // -------------------------------------------------------------------------

    public function testClienteDeveConfirmarAgendamento(): void
    {
        $servico     = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $agendamento = $this->criarAgendamento($servico);

        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/agendamento/{$agendamento->getId()}/confirmar"
        );

        self::assertResponseIsSuccessful();
        self::assertTrue(json_decode($this->client->getResponse()->getContent(), true)['success']);
    }

    public function testConfirmarAlteraStatusParaConfirmado(): void
    {
        $servico     = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $agendamento = $this->criarAgendamento($servico);

        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/agendamento/{$agendamento->getId()}/confirmar"
        );

        self::assertResponseIsSuccessful();
        $this->entityManager->refresh($agendamento);
        self::assertEquals(\App\Enum\StatusAgendamento::Confirmado, $agendamento->getStatus());
    }

    public function testConfirmarRetorna403ParaPrestador(): void
    {
        $servico     = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $agendamento = $this->criarAgendamento($servico);

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/agendamento/{$agendamento->getId()}/confirmar"
        );

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    // -------------------------------------------------------------------------
    // POST /api/servico/{servico}/agendamento/{agendamento}/declinar
    // -------------------------------------------------------------------------

    public function testClienteDeveDeclinarAgendamento(): void
    {
        $servico     = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $agendamento = $this->criarAgendamento($servico);

        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/agendamento/{$agendamento->getId()}/declinar"
        );

        self::assertResponseIsSuccessful();
        self::assertTrue(json_decode($this->client->getResponse()->getContent(), true)['success']);
    }

    public function testDeclinarAlteraStatusParaRecusado(): void
    {
        $servico     = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $agendamento = $this->criarAgendamento($servico);

        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/agendamento/{$agendamento->getId()}/declinar"
        );

        self::assertResponseIsSuccessful();
        $this->entityManager->refresh($agendamento);
        self::assertEquals(\App\Enum\StatusAgendamento::Recusado, $agendamento->getStatus());
    }

    public function testDeclinarRetorna403ParaPrestador(): void
    {
        $servico     = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $agendamento = $this->criarAgendamento($servico);

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/agendamento/{$agendamento->getId()}/declinar"
        );

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    // -------------------------------------------------------------------------
    // POST /api/servico/{servico}/orcamento
    // -------------------------------------------------------------------------

    public function testPrestadorDeveCriarOrcamento(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/orcamento",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['descricao' => 'Instalação de disjuntor', 'valor' => 150.0, 'observacoes' => 'Material incluso.'])
        );

        self::assertResponseIsSuccessful();
        self::assertTrue(json_decode($this->client->getResponse()->getContent(), true)['success']);
    }

    public function testOrcamentoNegativoRepresentaDesconto(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $orcamento = new Orcamento($servico, 'Serviço base', 500.0, null);
        $this->entityManager->persist($orcamento);
        $this->entityManager->flush();

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/orcamento",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['descricao' => 'Desconto especial', 'valor' => -50.0])
        );

        self::assertResponseIsSuccessful();

        $this->entityManager->refresh($servico);
        self::assertEquals(450.0, $servico->getValorTotal());
    }

    public function testOrcamentoRetorna422SemDescricao(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/orcamento",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['valor' => 100.0])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testOrcamentoRetorna422SemValor(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/orcamento",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['descricao' => 'Sem valor'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testOrcamentoRetorna403ParaCliente(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/orcamento",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['descricao' => 'Tentativa', 'valor' => 100.0])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testOrcamentoRetorna404ParaIdInexistente(): void
    {
        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            '/api/servico/00000000-0000-0000-0000-000000000000/orcamento',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['descricao' => 'Teste', 'valor' => 100.0])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }
}
