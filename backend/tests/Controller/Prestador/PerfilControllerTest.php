<?php

namespace App\Tests\Controller\Prestador;

use App\Entity\Auth\Usuario;
use App\Entity\Servico\Prestador;
use App\Entity\Servico\Profissao;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Testes funcionais para Prestador\PerfilController.
 *
 * O DAMA\DoctrineTestBundle envolve cada teste em uma transação revertida
 * automaticamente ao final, garantindo isolamento sem necessidade de
 * limpeza manual do banco de dados.
 */
final class PerfilControllerTest extends WebTestCase
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

    private function buscarIdProfissao(string $descricao): int
    {
        return $this->entityManager
            ->getRepository(Profissao::class)
            ->findOneBy(['descricao' => $descricao])
            ->getId();
    }

    private function buscarPrestador(string $email): Prestador
    {
        $usuario = $this->entityManager->getRepository(Usuario::class)->findOneBy(['email' => $email]);
        return $this->entityManager->getRepository(Prestador::class)->find($usuario->getId());
    }

    // -------------------------------------------------------------------------
    // GET /api/prestador/perfil/editar
    // -------------------------------------------------------------------------

    public function testDeveRetornarDadosDoPerfilDoAutenticado(): void
    {
        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('GET', '/api/prestador/perfil/editar');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertArrayHasKey('urlPerfil', $conteudo);
        self::assertArrayHasKey('nome', $conteudo);
        self::assertArrayHasKey('nomeProfissional', $conteudo);
        self::assertArrayHasKey('email', $conteudo);
        self::assertArrayHasKey('profissoes', $conteudo);
        self::assertArrayHasKey('cep', $conteudo);
        self::assertArrayHasKey('numero', $conteudo);
    }

    public function testPerfilRetornaEmailCorreto(): void
    {
        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('GET', '/api/prestador/perfil/editar');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertEquals('joaoaugusto@exemplo.com', $conteudo['email']);
    }

    public function testPerfilRetornaProfissoesComoArray(): void
    {
        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('GET', '/api/prestador/perfil/editar');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertIsArray($conteudo['profissoes']);
    }

    public function testPerfilRetornaCepComoPrestadorCadastrado(): void
    {
        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('GET', '/api/prestador/perfil/editar');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertEquals('78280000', trim($conteudo['cep']));
    }

    public function testPerfilRetorna401SemAutenticacao(): void
    {
        $this->client->request('GET', '/api/prestador/perfil/editar');
        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testPerfilRetorna403ParaNaoPrestador(): void
    {
        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', '/api/prestador/perfil/editar');
        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    // -------------------------------------------------------------------------
    // POST /api/prestador/perfil/editar
    // -------------------------------------------------------------------------

    public function testDeveAtualizarPerfilComSucesso(): void
    {
        $this->autenticar('joaoaugusto@exemplo.com');

        $this->client->request(
            'POST',
            '/api/prestador/perfil/editar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'            => 'João Atualizado',
                'nomeProfissional' => 'João Pro',
                'cep'             => '78280000',
                'profissoes'      => [$this->buscarIdProfissao('Eletricista')],
            ])
        );

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertArrayHasKey('message', $conteudo);
    }

    public function testAtualizarPerfilPersisteDadosNoBanco(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            '/api/prestador/perfil/editar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'            => 'Nome Atualizado Banco',
                'nomeProfissional' => 'Nome Profissional Banco',
                'cep'             => '78280000',
                'profissoes'      => [$this->buscarIdProfissao('Eletricista')],
            ])
        );

        self::assertResponseIsSuccessful();

        $this->entityManager->refresh($prestador);
        self::assertEquals('Nome Profissional Banco', $prestador->getNome());
    }

    public function testAtualizarPerfilAtualizaNomeDoUsuario(): void
    {
        $usuario = $this->entityManager->getRepository(Usuario::class)
            ->findOneBy(['email' => 'joaoaugusto@exemplo.com']);

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            '/api/prestador/perfil/editar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'            => 'Nome Usuario Atualizado',
                'nomeProfissional' => 'Nome Profissional',
                'cep'             => '78280000',
                'profissoes'      => [$this->buscarIdProfissao('Eletricista')],
            ])
        );

        self::assertResponseIsSuccessful();

        $this->entityManager->refresh($usuario);
        self::assertEquals('Nome Usuario Atualizado', $usuario->getNome());
    }

    public function testAtualizarPerfilSubstituiProfissoes(): void
    {
        $prestador      = $this->buscarPrestador('joaoaugusto@exemplo.com');
        $idEncanador    = $this->buscarIdProfissao('Encanador');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            '/api/prestador/perfil/editar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'            => 'João',
                'nomeProfissional' => 'João Pro',
                'cep'             => '78280000',
                'profissoes'      => [$idEncanador],
            ])
        );

        self::assertResponseIsSuccessful();

        $this->entityManager->refresh($prestador);
        $ids = array_map(fn(Profissao $p) => $p->getId(), $prestador->getProfissoes()->toArray());
        self::assertContains($idEncanador, $ids, 'Profissão Encanador deve ser associada após atualização.');
    }

    public function testAtualizarPerfilRetorna422ComNomeVazio(): void
    {
        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            '/api/prestador/perfil/editar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'            => '',
                'nomeProfissional' => 'Teste',
                'cep'             => '78280000',
                'profissoes'      => [$this->buscarIdProfissao('Eletricista')],
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testAtualizarPerfilRetorna422ComCepVazio(): void
    {
        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            '/api/prestador/perfil/editar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'            => 'João',
                'nomeProfissional' => 'João Pro',
                'cep'             => '',
                'profissoes'      => [$this->buscarIdProfissao('Eletricista')],
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testAtualizarPerfilRetorna422ComProfissoesVazias(): void
    {
        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            '/api/prestador/perfil/editar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'            => 'João',
                'nomeProfissional' => 'João Pro',
                'cep'             => '78280000',
                'profissoes'      => [],
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testAtualizarPerfilRetorna401SemAutenticacao(): void
    {
        $this->client->request(
            'POST',
            '/api/prestador/perfil/editar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['nome' => 'Teste', 'cep' => '78280000', 'profissoes' => [1]])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testAtualizarPerfilRetorna403ParaNaoPrestador(): void
    {
        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'POST',
            '/api/prestador/perfil/editar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['nome' => 'Teste', 'cep' => '78280000', 'profissoes' => [1]])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    // -------------------------------------------------------------------------
    // POST /api/prestador/perfil/foto
    // -------------------------------------------------------------------------

    public function testFotoSemArquivoRetorna400(): void
    {
        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('POST', '/api/prestador/perfil/foto');

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }

    public function testFotoRetorna401SemAutenticacao(): void
    {
        $this->client->request('POST', '/api/prestador/perfil/foto');
        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }
}
