<?php

namespace App\Tests\Controller;

use App\Entity\Auth\Usuario;
use App\Entity\Localizacao\Cep;
use App\Entity\Localizacao\Endereco;
use App\Entity\Servico\Orcamento;
use App\Entity\Servico\Servico;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Testes funcionais para ClienteController.
 *
 * O DAMA\DoctrineTestBundle envolve cada teste em uma transação revertida
 * automaticamente ao final, garantindo isolamento sem necessidade de
 * limpeza manual do banco de dados.
 */
final class ClienteControllerTest extends WebTestCase
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

    // -------------------------------------------------------------------------
    // GET /api/cliente/servicos
    // -------------------------------------------------------------------------

    public function testDeveRetornarListaDeServicosDoCliente(): void
    {
        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', '/api/cliente/servicos');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertIsArray($conteudo);
    }

    public function testServicosRetornaArrayVazioSemServicos(): void
    {
        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', '/api/cliente/servicos');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertEmpty($conteudo);
    }

    public function testServicosRetornaEstruturaDeCamposCorreta(): void
    {
        $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', '/api/cliente/servicos');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertNotEmpty($conteudo);
        $item = $conteudo[0];
        self::assertArrayHasKey('id', $item);
        self::assertArrayHasKey('prestador', $item);
        self::assertArrayHasKey('endereco', $item);
        self::assertArrayHasKey('data', $item);
        self::assertArrayHasKey('status', $item);
        self::assertArrayHasKey('encerradoEm', $item);
        self::assertArrayHasKey('avaliacao', $item);
    }

    public function testServicosRetornaPrestadorComCamposCorretos(): void
    {
        $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', '/api/cliente/servicos');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        $prestador = $conteudo[0]['prestador'];
        self::assertArrayHasKey('id', $prestador);
        self::assertArrayHasKey('nome', $prestador);
        self::assertArrayHasKey('nomeComercial', $prestador);
    }

    public function testServicosNovoTemStatusOrcamento(): void
    {
        $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', '/api/cliente/servicos');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertEquals('Orçamento', $conteudo[0]['status']);
    }

    public function testServicosConcluidoTemStatusFinalizado(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $orcamento = new Orcamento($servico, 'Orçamento teste', 150.0, null);
        $this->entityManager->persist($orcamento);
        $servico->concluir();
        $this->entityManager->flush();

        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', '/api/cliente/servicos');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        $statuses = array_column($conteudo, 'status');
        self::assertContains('Finalizado', $statuses);
    }

    public function testServicosCanceladoTemStatusCancelado(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $cliente = $this->buscarUsuario('cliente@exemplo.com');

        $servico->cancelar($cliente);
        $this->entityManager->flush();

        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', '/api/cliente/servicos');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        $statuses = array_column($conteudo, 'status');
        self::assertContains('Cancelado', $statuses);
    }

    public function testServicosNaoRetornaServicosDeOutroCliente(): void
    {
        $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('admin@teste.com');
        $usuario = $this->buscarUsuario('admin@teste.com');
        $usuario->setRoles(['ROLE_CLIENTE', 'ROLE_ADMIN']);
        $this->entityManager->flush();

        $this->autenticar('admin@teste.com');
        $this->client->request('GET', '/api/cliente/servicos');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertEmpty($conteudo, 'Outro cliente não deve ver serviços alheios.');
    }

    public function testServicosRetorna401SemAutenticacao(): void
    {
        $this->client->request('GET', '/api/cliente/servicos');
        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testServicosRetorna403ParaNaoCliente(): void
    {
        $this->autenticar('admin@teste.com');
        $this->client->request('GET', '/api/cliente/servicos');
        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    // -------------------------------------------------------------------------
    // GET /api/cliente/enderecos
    // -------------------------------------------------------------------------

    public function testDeveRetornarListaDeEnderecos(): void
    {
        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', '/api/cliente/enderecos');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertIsArray($conteudo);
    }

    public function testEnderecosRetornaVazioSemEnderecosCadastrados(): void
    {
        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', '/api/cliente/enderecos');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertEmpty($conteudo);
    }

    public function testEnderecosRetornaEstruturaDeCamposCorreta(): void
    {
        $cliente  = $this->buscarUsuario('cliente@exemplo.com');
        $cep      = $this->entityManager->getRepository(Cep::class)->find('78280000');

        $endereco = new Endereco();
        $endereco->setUsuario($cliente);
        $endereco->setCep($cep);
        $endereco->setRua('Rua das Flores');
        $endereco->setNumero('123');
        $this->entityManager->persist($endereco);
        $this->entityManager->flush();

        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', '/api/cliente/enderecos');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertNotEmpty($conteudo);
        $item = $conteudo[0];
        self::assertArrayHasKey('id', $item);
        self::assertArrayHasKey('endereco', $item);
        self::assertArrayHasKey('cep', $item);
        self::assertArrayHasKey('municipio', $item);
    }

    public function testEnderecosRetornaApenasDoClienteAutenticado(): void
    {
        $outroCliente = $this->buscarUsuario('admin@teste.com');
        $outroCliente->setRoles(['ROLE_CLIENTE', 'ROLE_ADMIN']);
        $cep = $this->entityManager->getRepository(Cep::class)->find('78280000');

        $enderecoOutro = new Endereco();
        $enderecoOutro->setUsuario($outroCliente);
        $enderecoOutro->setCep($cep);
        $this->entityManager->persist($enderecoOutro);
        $this->entityManager->flush();

        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', '/api/cliente/enderecos');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertEmpty($conteudo, 'Endereços de outros usuários não devem ser retornados.');
    }

    public function testEnderecosRetorna401SemAutenticacao(): void
    {
        $this->client->request('GET', '/api/cliente/enderecos');
        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }
}
