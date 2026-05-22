<?php

namespace App\Tests\Controller\Admin;

use App\Entity\Auth\Usuario;
use App\Entity\Portifolio\Portifolio;
use App\Entity\Servico\Prestador;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Testes funcionais para PrestadorController (painel administrativo).
 *
 * O DAMA\DoctrineTestBundle envolve cada teste em uma transação revertida
 * automaticamente ao final, garantindo isolamento sem necessidade de
 * limpeza manual do banco de dados.
 */
final class PrestadorControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = static::getContainer()->get('doctrine.orm.entity_manager');
        $this->autenticarCliente('admin@teste.com');
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

    private function buscarPrestador(string $email): Prestador
    {
        $usuario = $this->entityManager->getRepository(Usuario::class)->findOneBy(['email' => $email]);

        if (!$usuario) {
            throw new \LogicException("Prestador com email $email não encontrado nas fixtures.");
        }

        return $this->entityManager->getRepository(Prestador::class)->find($usuario->getId());
    }

    // -------------------------------------------------------------------------
    // GET /api/admin/prestador
    // -------------------------------------------------------------------------

    public function testDeveListarTodosPrestadores(): void
    {
        $this->client->request('GET', '/api/admin/prestador');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertIsArray($conteudo);
        self::assertNotEmpty($conteudo);
    }

    public function testListagemRetornaEstruturaDeCamposCorreta(): void
    {
        $this->client->request('GET', '/api/admin/prestador');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertNotEmpty($conteudo);
        $item = $conteudo[0];

        self::assertArrayHasKey('id', $item);
        self::assertArrayHasKey('nome', $item);
        self::assertArrayHasKey('premium', $item);
        self::assertIsBool($item['premium']);
    }

    public function testListagemRefletePrestadoresComESemPremium(): void
    {
        $this->client->request('GET', '/api/admin/prestador');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        $premiums = array_filter($conteudo, fn($p) => $p['premium'] === true);
        $comuns   = array_filter($conteudo, fn($p) => $p['premium'] === false);

        self::assertNotEmpty($comuns, 'Deve haver ao menos um prestador sem premium nas fixtures.');
    }

    public function testDeveRetornar403SemAutenticacao(): void
    {
        $this->client->setServerParameter('HTTP_Authorization', '');
        $this->client->request('GET', '/api/admin/prestador');

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testDeveRetornar403ComUsuarioNaoAdmin(): void
    {
        $this->autenticarCliente('prestcomum@exemplo.com');
        $this->client->request('GET', '/api/admin/prestador');

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    // -------------------------------------------------------------------------
    // POST /api/admin/prestador/{id}/promover
    // -------------------------------------------------------------------------

    public function testDevePromoverPrestadorParaPremium(): void
    {
        $prestador = $this->buscarPrestador('prestcomum@exemplo.com');
        $id = $prestador->getId()->toString();

        $this->client->request('POST', "/api/admin/prestador/{$id}/promover");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['success']);
    }

    public function testPromocaoAtivaPrestadorNoBanco(): void
    {
        $prestador = $this->buscarPrestador('prestcomum@exemplo.com');
        $id = $prestador->getId()->toString();

        $this->client->request('POST', "/api/admin/prestador/{$id}/promover");

        self::assertResponseIsSuccessful();
        $this->entityManager->refresh($prestador);
        self::assertTrue($prestador->isAtivo());
    }

    public function testPromocaoConcedePapelRolePremium(): void
    {
        $prestador = $this->buscarPrestador('prestcomum@exemplo.com');
        $id = $prestador->getId()->toString();

        $this->client->request('POST', "/api/admin/prestador/{$id}/promover");

        self::assertResponseIsSuccessful();
        $this->entityManager->refresh($prestador);
        self::assertContains('ROLE_PREMIUM', $prestador->getUsuario()->getRoles());
    }

    public function testPromocaoCriaPortifolioSeInexistente(): void
    {
        $prestador = $this->buscarPrestador('prestcomum@exemplo.com');
        self::assertNull($prestador->getPortifolio(), 'Prestador comum não deve ter portfólio nas fixtures.');

        $id = $prestador->getId()->toString();
        $this->client->request('POST', "/api/admin/prestador/{$id}/promover");

        self::assertResponseIsSuccessful();
        $this->entityManager->refresh($prestador);

        $portifolio = $this->entityManager->getRepository(Portifolio::class)
            ->findOneBy(['prestador' => $prestador]);

        self::assertNotNull($portifolio, 'Portfólio deve ser criado automaticamente ao promover.');
    }

    public function testPromocaoNaoDuplicaPortifolioSeJaExiste(): void
    {
        $prestador = $this->buscarPrestador('prestcomum@exemplo.com');
        $portifolio = new Portifolio($prestador);
        $this->entityManager->persist($portifolio);
        $this->entityManager->flush();

        $id = $prestador->getId()->toString();
        $this->client->request('POST', "/api/admin/prestador/{$id}/promover");

        self::assertResponseIsSuccessful();

        $total = $this->entityManager->getRepository(Portifolio::class)
            ->count(['prestador' => $prestador]);

        self::assertEquals(1, $total, 'Não deve criar portfólio duplicado.');
    }

    public function testRetorna404AoPromoverIdInexistente(): void
    {
        $this->client->request('POST', '/api/admin/prestador/00000000-0000-0000-0000-000000000000/promover');

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    // -------------------------------------------------------------------------
    // POST /api/admin/prestador/{id}/demover
    // -------------------------------------------------------------------------

    public function testDeveDemoverPrestadorDePremium(): void
    {
        $prestador = $this->buscarPrestador('prestcomum@exemplo.com');
        $prestador->setAtivo(true);
        $prestador->getUsuario()->setRoles(['ROLE_PRESTADOR', 'ROLE_PREMIUM']);
        $this->entityManager->flush();

        $id = $prestador->getId()->toString();
        $this->client->request('POST', "/api/admin/prestador/{$id}/demover");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['success']);
    }

    public function testDemocaoDesativaPrestadorNoBanco(): void
    {
        $prestador = $this->buscarPrestador('prestcomum@exemplo.com');
        $prestador->setAtivo(true);
        $prestador->getUsuario()->setRoles(['ROLE_PRESTADOR', 'ROLE_PREMIUM']);
        $this->entityManager->flush();

        $id = $prestador->getId()->toString();
        $this->client->request('POST', "/api/admin/prestador/{$id}/demover");

        self::assertResponseIsSuccessful();
        $this->entityManager->refresh($prestador);
        self::assertFalse($prestador->isAtivo());
    }

    public function testDemocaoRevogaPapelRolePremium(): void
    {
        $prestador = $this->buscarPrestador('prestcomum@exemplo.com');
        $prestador->setAtivo(true);
        $prestador->getUsuario()->setRoles(['ROLE_PRESTADOR', 'ROLE_PREMIUM']);
        $this->entityManager->flush();

        $id = $prestador->getId()->toString();
        $this->client->request('POST', "/api/admin/prestador/{$id}/demover");

        self::assertResponseIsSuccessful();
        $this->entityManager->refresh($prestador);
        self::assertNotContains('ROLE_PREMIUM', $prestador->getUsuario()->getRoles());
        self::assertContains('ROLE_PRESTADOR', $prestador->getUsuario()->getRoles());
    }

    public function testRetorna404AoDemoverIdInexistente(): void
    {
        $this->client->request('POST', '/api/admin/prestador/00000000-0000-0000-0000-000000000000/demover');

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }
}
