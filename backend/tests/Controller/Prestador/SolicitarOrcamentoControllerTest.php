<?php

namespace App\Tests\Controller\Prestador;

use App\Entity\Auth\Usuario;
use App\Entity\Localizacao\Cep;
use App\Entity\Localizacao\Endereco;
use App\Entity\Servico\Prestador;
use App\Entity\Servico\Servico;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Testes funcionais para SolicitarOrcamentoController e UiElementsController.
 *
 * O DAMA\DoctrineTestBundle envolve cada teste em uma transação revertida
 * automaticamente ao final, garantindo isolamento sem necessidade de
 * limpeza manual do banco de dados.
 */
final class SolicitarOrcamentoControllerTest extends WebTestCase
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

        $token = $this->client->getKernel()->getContainer()
            ->get('lexik_jwt_authentication.jwt_manager')
            ->create($usuario);

        $this->client->setServerParameter('HTTP_Authorization', sprintf('Bearer %s', $token));
    }

    private function buscarUsuario(string $email): Usuario
    {
        return $this->entityManager->getRepository(Usuario::class)->findOneBy(['email' => $email]);
    }

    private function buscarPrestador(string $email): Prestador
    {
        $usuario = $this->buscarUsuario($email);
        return $this->entityManager->getRepository(Prestador::class)->find($usuario->getId());
    }

    private function criarEnderecoParaCliente(string $emailCliente): Endereco
    {
        $cliente = $this->buscarUsuario($emailCliente);
        $cep     = $this->entityManager->getRepository(Cep::class)->find('78280000');

        $endereco = new Endereco();
        $endereco->setUsuario($cliente);
        $endereco->setCep($cep);
        $endereco->setRua('Rua Teste');
        $endereco->setNumero('10');
        $this->entityManager->persist($endereco);
        $this->entityManager->flush();    // flush needed so the ID is visible to the HTTP request

        return $endereco;
    }

    // -------------------------------------------------------------------------
    // POST /api/prestadores/{id}/solicitar
    // -------------------------------------------------------------------------

    public function testDeveSolicitarOrcamentoComNovoEndereco(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/prestadores/{$prestador->getId()}/solicitar",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'descricao'    => 'Preciso consertar a fiação da sala.',
                'cep'          => '78280000',
                'rua'          => '28 De Outubro',
                'numero'       => '100',
                'complemento'  => '2º andar',
            ])
        );

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['success']);
        self::assertArrayHasKey('idServico', $conteudo);
    }

    public function testSolicitacaoCriaServicoNoBanco(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/prestadores/{$prestador->getId()}/solicitar",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'descricao' => 'Instalação de tomadas.',
                'cep'       => '78280000',
                'rua'       => 'Rua Central',
                'numero'    => '50',
            ])
        );

        self::assertResponseIsSuccessful();
        $idServico = json_decode($this->client->getResponse()->getContent(), true)['idServico'];

        $servico = $this->entityManager->getRepository(Servico::class)->find($idServico);
        self::assertNotNull($servico, 'Serviço deve ser persistido no banco.');
    }

    public function testDeveSolicitarOrcamentoComEnderecoExistente(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');
        $endereco  = $this->criarEnderecoParaCliente('cliente@exemplo.com');
        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/prestadores/{$prestador->getId()}/solicitar",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'descricao'  => 'Consertar torneira.',
                'idEndereco' => $endereco->getId()->toString(),
            ])
        );

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['success']);
        self::assertArrayHasKey('idServico', $conteudo);
    }

    public function testSolicitacaoComEnderecoExistenteReutilizaEndereco(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');
        $endereco  = $this->criarEnderecoParaCliente('cliente@exemplo.com');
        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/prestadores/{$prestador->getId()}/solicitar",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'descricao'  => 'Pintar sala.',
                'idEndereco' => $endereco->getId()->toString(),
            ])
        );

        self::assertResponseIsSuccessful();
        $idServico = json_decode($this->client->getResponse()->getContent(), true)['idServico'];

        $servico = $this->entityManager->getRepository(Servico::class)->find($idServico);
        self::assertEquals(
            $endereco->getId()->toString(),
            $servico->getEndereco()->getId()->toString(),
            'O serviço deve reutilizar o endereço existente informado.'
        );
    }

    public function testSolicitacaoRetorna422SemDescricao(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/prestadores/{$prestador->getId()}/solicitar",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'cep'    => '78280000',
                'rua'    => 'Rua X',
                'numero' => '1',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testSolicitacaoRetorna422ComCepInvalido(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/prestadores/{$prestador->getId()}/solicitar",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'descricao' => 'Teste CEP inválido.',
                'cep'       => 'INVALIDO',
                'rua'       => 'Rua X',
                'numero'    => '1',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testSolicitacaoRetorna403ParaNaoCliente(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            "/api/prestadores/{$prestador->getId()}/solicitar",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'descricao' => 'Prestador tentando solicitar.',
                'cep'       => '78280000',
                'rua'       => 'Rua X',
                'numero'    => '1',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testSolicitacaoRetorna401SemAutenticacao(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $this->client->request(
            'POST',
            "/api/prestadores/{$prestador->getId()}/solicitar",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'descricao' => 'Sem token.',
                'cep'       => '78280000',
                'rua'       => 'Rua X',
                'numero'    => '1',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testSolicitacaoRetorna404ParaPrestadorInexistente(): void
    {
        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'POST',
            '/api/prestadores/00000000-0000-0000-0000-000000000000/solicitar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'descricao' => 'Prestador inexistente.',
                'cep'       => '78280000',
                'rua'       => 'Rua X',
                'numero'    => '1',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    // -------------------------------------------------------------------------
    // GET /api/ui/endereco?cep=  (busca CEP)
    // -------------------------------------------------------------------------

    public function testDeveRetornarEnderecoPorCep(): void
    {
        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', '/api/ui/endereco?cep=78280000');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertArrayHasKey('numero', $conteudo);
        self::assertArrayHasKey('municipio', $conteudo);
    }

    public function testBuscaCepRetornaEstruturaMunicipio(): void
    {
        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', '/api/ui/endereco?cep=78280000');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertArrayHasKey('nome', $conteudo['municipio']);
        self::assertArrayHasKey('uf', $conteudo['municipio']);
    }

    public function testBuscaCepRetorna400ParaCepInexistente(): void
    {
        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', '/api/ui/endereco?cep=00000000');

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertArrayHasKey('errors', $conteudo);
        self::assertArrayHasKey('cep', $conteudo['errors']);
    }

    public function testBuscaCepRetorna401SemAutenticacao(): void
    {
        $this->client->request('GET', '/api/ui/endereco?cep=78280000');
        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }
}
