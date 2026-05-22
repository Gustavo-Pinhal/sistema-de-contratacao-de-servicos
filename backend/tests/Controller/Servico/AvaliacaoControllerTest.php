<?php

namespace App\Tests\Controller\Servico;

use App\Entity\Auth\Usuario;
use App\Entity\Avaliacao\Avaliacao;
use App\Entity\Localizacao\Cep;
use App\Entity\Localizacao\Endereco;
use App\Entity\Servico\Prestador;
use App\Entity\Servico\Servico;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Testes funcionais para AvaliacaoController e AvaliacoesController.
 *
 * O DAMA\DoctrineTestBundle envolve cada teste em uma transação revertida
 * automaticamente ao final, garantindo isolamento sem necessidade de
 * limpeza manual do banco de dados.
 */
final class AvaliacaoControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = static::getContainer()->get('doctrine.orm.entity_manager');
    }

    private function autenticarCliente(string $email): void
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

    private function buscarPrestador(string $email): Prestador
    {
        $usuario = $this->buscarUsuario($email);
        return $this->entityManager->getRepository(Prestador::class)->find($usuario->getId());
    }

    private function criarServico(string $emailCliente, string $emailPrestador): Servico
    {
        $cliente   = $this->buscarUsuario($emailCliente);
        $prestador = $this->buscarUsuario($emailPrestador);

        $cep = $this->entityManager->getRepository(Cep::class)->find('78280000');

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

    private function criarAvaliacaoParaServico(Servico $servico, float $nota = 8.0, ?string $comentario = 'Ótimo serviço'): Avaliacao
    {
        $avaliacao = new Avaliacao($servico, $nota, $comentario);
        $servico->setAvaliacao($avaliacao);
        $this->entityManager->persist($avaliacao);
        $this->entityManager->flush();

        return $avaliacao;
    }

    // -------------------------------------------------------------------------
    // GET /api/servico/{id}/avaliacao
    // -------------------------------------------------------------------------

    public function testDeveRetornarAvaliacaoDoServico(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $this->criarAvaliacaoParaServico($servico, 9.5, 'Excelente atendimento.');

        $this->autenticarCliente('cliente@exemplo.com');
        $this->client->request('GET', "/api/servico/{$servico->getId()}/avaliacao");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertArrayHasKey('id', $conteudo);
        self::assertArrayHasKey('nota', $conteudo);
        self::assertArrayHasKey('comentario', $conteudo);
        self::assertArrayHasKey('imagens', $conteudo);
        self::assertArrayHasKey('data', $conteudo);
    }

    public function testGetAvaliacaoRetornaNoteEComentarioCorretos(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $this->criarAvaliacaoParaServico($servico, 7.5, 'Serviço satisfatório.');

        $this->autenticarCliente('cliente@exemplo.com');
        $this->client->request('GET', "/api/servico/{$servico->getId()}/avaliacao");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertEquals(7.5, $conteudo['nota']);
        self::assertEquals('Serviço satisfatório.', $conteudo['comentario']);
    }

    public function testGetAvaliacaoRetornaArrayDeImagens(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $this->criarAvaliacaoParaServico($servico);

        $this->autenticarCliente('cliente@exemplo.com');
        $this->client->request('GET', "/api/servico/{$servico->getId()}/avaliacao");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertIsArray($conteudo['imagens']);
    }

    public function testGetAvaliacaoRetorna404SemAvaliacao(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticarCliente('cliente@exemplo.com');
        $this->client->request('GET', "/api/servico/{$servico->getId()}/avaliacao");

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    public function testGetAvaliacaoRetorna404ParaServicoInexistente(): void
    {
        $this->autenticarCliente('cliente@exemplo.com');
        $this->client->request('GET', '/api/servico/00000000-0000-0000-0000-000000000000/avaliacao');

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    // -------------------------------------------------------------------------
    // POST /api/servico/{id}/avaliacao
    // -------------------------------------------------------------------------

    public function testClienteDeveCriarAvaliacaoComSucesso(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticarCliente('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/avaliacao",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['nota' => 8.5, 'comentario' => 'O serviço ficou ótimo.'])
        );

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['success']);
    }

    public function testCriarAvaliacaoPersisteDadosNoBanco(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticarCliente('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/avaliacao",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['nota' => 10.0, 'comentario' => 'Perfeito!'])
        );

        self::assertResponseIsSuccessful();

        $this->entityManager->refresh($servico);
        $avaliacao = $this->entityManager->getRepository(Avaliacao::class)->find($servico->getId());

        self::assertNotNull($avaliacao);
        self::assertEquals(10.0, $avaliacao->getNota());
        self::assertEquals('Perfeito!', $avaliacao->getComentario());
    }

    public function testCriarAvaliacaoSemComentarioEValido(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticarCliente('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/avaliacao",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['nota' => 5.0])
        );

        self::assertResponseIsSuccessful();
    }

    public function testPrestadorNaoPodeCriarAvaliacao(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticarCliente('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/avaliacao",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['nota' => 9.0])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testTerceirosNaoPodeCriarAvaliacao(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticarCliente('bruno@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/avaliacao",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['nota' => 9.0])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testRetorna422ParaNotaAusente(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticarCliente('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/avaliacao",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['comentario' => 'Sem nota'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testRetorna422ParaNotaAcimaDeDeZ(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticarCliente('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/avaliacao",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['nota' => 10.1])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testRetorna422ParaNotaAbaixoDeZero(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticarCliente('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/avaliacao",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['nota' => -1])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testRetorna422ParaComentarioAcimaDe2000Caracteres(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticarCliente('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/avaliacao",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['nota' => 5.0, 'comentario' => str_repeat('A', 2001)])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testRetorna404ParaServicoInexistente(): void
    {
        $this->autenticarCliente('cliente@exemplo.com');
        $this->client->request(
            'POST',
            '/api/servico/00000000-0000-0000-0000-000000000000/avaliacao',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['nota' => 8.0])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    // -------------------------------------------------------------------------
    // POST /api/servico/{id}/avaliacao/upload
    // -------------------------------------------------------------------------

    public function testUploadRetorna404SeAvaliacaoNaoExiste(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticarCliente('cliente@exemplo.com');
        $this->client->request('POST', "/api/servico/{$servico->getId()}/avaliacao/upload");

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    public function testUploadRetorna400SemArquivosEnviados(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $this->criarAvaliacaoParaServico($servico);

        $this->autenticarCliente('cliente@exemplo.com');
        $this->client->request('POST', "/api/servico/{$servico->getId()}/avaliacao/upload");

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }

    public function testUploadPrestadorRetorna403(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $this->criarAvaliacaoParaServico($servico);

        $this->autenticarCliente('joaoaugusto@exemplo.com');
        $this->client->request('POST', "/api/servico/{$servico->getId()}/avaliacao/upload");

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testUploadTerceiroRetorna403(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $this->criarAvaliacaoParaServico($servico);

        $this->autenticarCliente('bruno@exemplo.com');
        $this->client->request('POST', "/api/servico/{$servico->getId()}/avaliacao/upload");

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    // -------------------------------------------------------------------------
    // GET /api/prestador/{id}/avaliacoes
    // -------------------------------------------------------------------------

    public function testDeveListarAvaliacoesDoPrestador(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $this->autenticarCliente('cliente@exemplo.com');
        $this->client->request('GET', "/api/prestador/{$prestador->getId()}/avaliacoes");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertIsArray($conteudo);
    }

    public function testListagemAvaliacoesRetornaVazioParaPrestadorSemAvaliacoes(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $this->autenticarCliente('cliente@exemplo.com');
        $this->client->request('GET', "/api/prestador/{$prestador->getId()}/avaliacoes");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertEmpty($conteudo);
    }

    public function testListagemAvaliacoesRetornaEstruturaDeCamposCorreta(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $this->criarAvaliacaoParaServico($servico, 9.0, 'Muito bom!');

        $this->autenticarCliente('cliente@exemplo.com');
        $this->client->request('GET', "/api/prestador/{$prestador->getId()}/avaliacoes");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertNotEmpty($conteudo);
        $item = $conteudo[0];
        self::assertArrayHasKey('id', $item);
        self::assertArrayHasKey('nota', $item);
        self::assertArrayHasKey('comentario', $item);
        self::assertArrayHasKey('imagens', $item);
        self::assertArrayHasKey('data', $item);
        self::assertArrayHasKey('servico', $item);
    }

    public function testListagemAvaliacoesRetornaNotaCorreta(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $this->criarAvaliacaoParaServico($servico, 6.5, 'Razoável.');

        $this->autenticarCliente('cliente@exemplo.com');
        $this->client->request('GET', "/api/prestador/{$prestador->getId()}/avaliacoes");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertEquals(6.5, $conteudo[0]['nota']);
    }

    public function testListagemAvaliacoesAcessoPublicoSemToken(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $this->client->request('GET', "/api/prestador/{$prestador->getId()}/avaliacoes");

        self::assertResponseIsSuccessful();
    }

    public function testListagemAvaliacoesRetorna404ParaPrestadorInexistente(): void
    {
        $this->autenticarCliente('cliente@exemplo.com');
        $this->client->request('GET', '/api/prestador/00000000-0000-0000-0000-000000000000/avaliacoes');

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }
}
