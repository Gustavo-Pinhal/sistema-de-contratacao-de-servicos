<?php

namespace App\Tests\Controller\AreaPrestador;

use App\Entity\Auth\Usuario;
use App\Entity\Empresarial\Empresa;
use App\Entity\Empresarial\EmpresaPrestador;
use App\Entity\Notificacao\Notificacao;
use App\Entity\Portifolio\Portifolio;
use App\Entity\Servico\Prestador;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Testes funcionais para DashboardController (área do prestador).
 *
 * O DAMA\DoctrineTestBundle envolve cada teste em uma transação revertida
 * automaticamente ao final, garantindo isolamento sem necessidade de
 * limpeza manual do banco de dados.
 */
final class DashboardControllerTest extends WebTestCase
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

    private function buscarPrestador(string $email): Prestador
    {
        $usuario = $this->entityManager->getRepository(Usuario::class)->findOneBy(['email' => $email]);
        return $this->entityManager->getRepository(Prestador::class)->find($usuario->getId());
    }

    private function buscarUsuario(string $email): Usuario
    {
        return $this->entityManager->getRepository(Usuario::class)->findOneBy(['email' => $email]);
    }

    // -------------------------------------------------------------------------
    // GET /api/areaprestador/dashboard
    // -------------------------------------------------------------------------

    public function testDeveRetornarDashboardComSucesso(): void
    {
        $this->autenticarCliente('prestcomum@exemplo.com');
        $this->client->request('GET', '/api/areaprestador/dashboard');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertArrayHasKey('filiado', $conteudo);
        self::assertArrayHasKey('premium', $conteudo);
        self::assertArrayHasKey('nome', $conteudo);
        self::assertArrayHasKey('urlPerfil', $conteudo);
        self::assertArrayHasKey('ativos', $conteudo);
        self::assertArrayHasKey('pendentes', $conteudo);
        self::assertArrayHasKey('concluidos', $conteudo);
        self::assertArrayHasKey('cancelados', $conteudo);
    }

    public function testDashboardRetornaFiliadoNuloSemFiliacao(): void
    {
        $this->autenticarCliente('prestcomum@exemplo.com');
        $this->client->request('GET', '/api/areaprestador/dashboard');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertNull($conteudo['filiado'], 'Prestador sem filiação deve retornar filiado: null.');
    }

    public function testDashboardRetornaFiliadoComDadosDaEmpresa(): void
    {
        $prestador = $this->buscarPrestador('prestcomum@exemplo.com');
        $usuarioEmpresa = $this->buscarUsuario('admin@teste.com');

        $empresa = new Empresa($usuarioEmpresa);
        $this->entityManager->persist($empresa);

        $relacao = new EmpresaPrestador($empresa, $prestador->getId());
        $this->entityManager->persist($relacao);
        $this->entityManager->flush();

        $this->autenticarCliente('prestcomum@exemplo.com');
        $this->client->request('GET', '/api/areaprestador/dashboard');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertNotNull($conteudo['filiado']);
        self::assertArrayHasKey('id', $conteudo['filiado']);
        self::assertArrayHasKey('nome', $conteudo['filiado']);
    }

    public function testDashboardRetornaPremiumFalsoParaPrestadorComum(): void
    {
        $this->autenticarCliente('prestcomum@exemplo.com');
        $this->client->request('GET', '/api/areaprestador/dashboard');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertFalse($conteudo['premium']);
    }

    public function testDashboardRetornaNomeDoNomeProfissional(): void
    {
        $this->autenticarCliente('prestcomum@exemplo.com');
        $this->client->request('GET', '/api/areaprestador/dashboard');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertNotEmpty($conteudo['nome']);
        self::assertEquals('Prestador Comum', $conteudo['nome']);
    }

    public function testDashboardRetornaListasVaziasSemServicos(): void
    {
        $this->autenticarCliente('prestcomum@exemplo.com');
        $this->client->request('GET', '/api/areaprestador/dashboard');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertIsArray($conteudo['ativos']);
        self::assertIsArray($conteudo['pendentes']);
        self::assertIsArray($conteudo['concluidos']);
        self::assertIsArray($conteudo['cancelados']);
    }

    public function testDeveRetornar403SemAutenticacao(): void
    {
        $this->client->request('GET', '/api/areaprestador/dashboard');

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testDeveRetornar403ComUsuarioNaoPrestador(): void
    {
        $this->autenticarCliente('admin@teste.com');
        $this->client->request('GET', '/api/areaprestador/dashboard');

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    // -------------------------------------------------------------------------
    // GET /api/areaprestador/notificacoes
    // -------------------------------------------------------------------------

    public function testDeveRetornarListaDeNotificacoes(): void
    {
        $this->autenticarCliente('prestcomum@exemplo.com');
        $this->client->request('GET', '/api/areaprestador/notificacoes');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertIsArray($conteudo);
    }

    public function testNotificacoesRetornaApenasDoReceptorAutenticado(): void
    {
        $receptor = $this->buscarUsuario('prestcomum@exemplo.com');
        $remetente = $this->buscarUsuario('admin@teste.com');

        $notificacao = new Notificacao(
            $receptor,
            ['type' => 'filiationInvitation', 'companyName' => 'Empresa Teste'],
            $remetente,
        );
        $this->entityManager->persist($notificacao);
        $this->entityManager->flush();

        $this->autenticarCliente('prestcomum@exemplo.com');
        $this->client->request('GET', '/api/areaprestador/notificacoes');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertCount(1, $conteudo);
        self::assertArrayHasKey('id', $conteudo[0]);
        self::assertArrayHasKey('remetente', $conteudo[0]);
        self::assertArrayHasKey('conteudo', $conteudo[0]);
        self::assertArrayHasKey('criadoEm', $conteudo[0]);
    }

    public function testNotificacoesNaoRetornaNotificacoesDeletadas(): void
    {
        $receptor = $this->buscarUsuario('prestcomum@exemplo.com');
        $remetente = $this->buscarUsuario('admin@teste.com');

        $notificacao = new Notificacao(
            $receptor,
            ['type' => 'filiationInvitation', 'companyName' => 'Empresa Deletada'],
            $remetente,
        );
        $notificacao->softDelete();
        $this->entityManager->persist($notificacao);
        $this->entityManager->flush();

        $this->autenticarCliente('prestcomum@exemplo.com');
        $this->client->request('GET', '/api/areaprestador/notificacoes');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertEmpty($conteudo, 'Notificações com softDelete não devem aparecer.');
    }

    // -------------------------------------------------------------------------
    // POST /api/areaprestador/convite/{id}/aceitar
    // -------------------------------------------------------------------------

    public function testDeveAceitarConviteDeFiliacao(): void
    {
        $receptor = $this->buscarUsuario('prestcomum@exemplo.com');
        $remetente = $this->buscarUsuario('admin@teste.com');

        $empresa = new Empresa($remetente);
        $this->entityManager->persist($empresa);

        $convite = new Notificacao(
            $receptor,
            ['type' => 'filiationInvitation', 'companyName' => 'Empresa Teste'],
            $remetente,
        );
        $this->entityManager->persist($convite);
        $this->entityManager->flush();

        $this->autenticarCliente('prestcomum@exemplo.com');
        $this->client->request('POST', "/api/areaprestador/convite/{$convite->getId()}/aceitar");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['success']);
    }

    public function testAceitarConviteConcedePremiumAoPrestador(): void
    {
        $prestador = $this->buscarPrestador('prestcomum@exemplo.com');
        $receptor  = $prestador->getUsuario();
        $remetente = $this->buscarUsuario('admin@teste.com');

        $empresa = new Empresa($remetente);
        $this->entityManager->persist($empresa);

        $convite = new Notificacao($receptor, ['type' => 'filiationInvitation', 'companyName' => 'X'], $remetente);
        $this->entityManager->persist($convite);
        $this->entityManager->flush();

        $this->autenticarCliente('prestcomum@exemplo.com');
        $this->client->request('POST', "/api/areaprestador/convite/{$convite->getId()}/aceitar");

        self::assertResponseIsSuccessful();
        $this->entityManager->refresh($prestador);
        self::assertContains('ROLE_PREMIUM', $prestador->getUsuario()->getRoles());
        self::assertTrue($prestador->isAtivo());
    }

    public function testAceitarConviteCriaPortifolioSeInexistente(): void
    {
        $prestador = $this->buscarPrestador('prestcomum@exemplo.com');
        $receptor  = $prestador->getUsuario();
        $remetente = $this->buscarUsuario('admin@teste.com');

        $empresa = new Empresa($remetente);
        $this->entityManager->persist($empresa);

        $convite = new Notificacao($receptor, ['type' => 'filiationInvitation', 'companyName' => 'X'], $remetente);
        $this->entityManager->persist($convite);
        $this->entityManager->flush();

        $this->autenticarCliente('prestcomum@exemplo.com');
        $this->client->request('POST', "/api/areaprestador/convite/{$convite->getId()}/aceitar");

        self::assertResponseIsSuccessful();
        $this->entityManager->refresh($prestador);

        $portifolio = $this->entityManager->getRepository(Portifolio::class)
            ->findOneBy(['prestador' => $prestador]);

        self::assertNotNull($portifolio, 'Portfólio deve ser criado ao aceitar convite.');
    }

    public function testAceitarConviteFazSoftDeleteNoConvite(): void
    {
        $receptor  = $this->buscarUsuario('prestcomum@exemplo.com');
        $remetente = $this->buscarUsuario('admin@teste.com');

        $empresa = new Empresa($remetente);
        $this->entityManager->persist($empresa);

        $convite = new Notificacao($receptor, ['type' => 'filiationInvitation', 'companyName' => 'X'], $remetente);
        $this->entityManager->persist($convite);
        $this->entityManager->flush();
        $conviteId = $convite->getId();

        $this->autenticarCliente('prestcomum@exemplo.com');
        $this->client->request('POST', "/api/areaprestador/convite/{$conviteId}/aceitar");

        self::assertResponseIsSuccessful();
        $this->entityManager->clear();

        $conviteAtualizado = $this->entityManager->getRepository(Notificacao::class)->find($conviteId);
        self::assertNotNull($conviteAtualizado->getDeletedAt(), 'Convite deve ter deletedAt preenchido após aceitar.');
    }

    // -------------------------------------------------------------------------
    // POST /api/areaprestador/convite/{id}/declinar
    // -------------------------------------------------------------------------

    public function testDeveDeclinarConviteDeFiliacao(): void
    {
        $receptor  = $this->buscarUsuario('prestcomum@exemplo.com');
        $remetente = $this->buscarUsuario('admin@teste.com');

        $convite = new Notificacao(
            $receptor,
            ['type' => 'filiationInvitation', 'companyName' => 'Empresa X'],
            $remetente,
        );
        $this->entityManager->persist($convite);
        $this->entityManager->flush();

        $this->autenticarCliente('prestcomum@exemplo.com');
        $this->client->request('POST', "/api/areaprestador/convite/{$convite->getId()}/declinar");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['success']);
    }

    public function testDeclinarConviteFazSoftDeleteNoConvite(): void
    {
        $receptor  = $this->buscarUsuario('prestcomum@exemplo.com');
        $remetente = $this->buscarUsuario('admin@teste.com');

        $convite = new Notificacao($receptor, ['type' => 'filiationInvitation', 'companyName' => 'X'], $remetente);
        $this->entityManager->persist($convite);
        $this->entityManager->flush();
        $conviteId = $convite->getId();

        $this->autenticarCliente('prestcomum@exemplo.com');
        $this->client->request('POST', "/api/areaprestador/convite/{$conviteId}/declinar");

        self::assertResponseIsSuccessful();
        $this->entityManager->clear();

        $conviteAtualizado = $this->entityManager->getRepository(Notificacao::class)->find($conviteId);
        self::assertNotNull($conviteAtualizado->getDeletedAt(), 'Convite deve ter deletedAt preenchido após declinar.');
    }

    public function testDeclinarConviteNaoConcedePremium(): void
    {
        $prestador = $this->buscarPrestador('prestcomum@exemplo.com');
        $receptor  = $prestador->getUsuario();
        $remetente = $this->buscarUsuario('admin@teste.com');

        $convite = new Notificacao($receptor, ['type' => 'filiationInvitation', 'companyName' => 'X'], $remetente);
        $this->entityManager->persist($convite);
        $this->entityManager->flush();

        $this->autenticarCliente('prestcomum@exemplo.com');
        $this->client->request('POST', "/api/areaprestador/convite/{$convite->getId()}/declinar");

        self::assertResponseIsSuccessful();
        $this->entityManager->refresh($prestador);
        self::assertNotContains('ROLE_PREMIUM', $prestador->getUsuario()->getRoles());
    }

    // -------------------------------------------------------------------------
    // POST /api/areaprestador/assinar
    // -------------------------------------------------------------------------

    public function testDeveAssinarPlanoPremium(): void
    {
        $this->autenticarCliente('prestcomum@exemplo.com');
        $this->client->request('POST', '/api/areaprestador/assinar');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['success']);
        self::assertStringContainsString('Premium', $conteudo['message']);
    }

    public function testAssinarAtivaPrestadorEConcedePremium(): void
    {
        $prestador = $this->buscarPrestador('prestcomum@exemplo.com');
        self::assertFalse($prestador->isAtivo());

        $this->autenticarCliente('prestcomum@exemplo.com');
        $this->client->request('POST', '/api/areaprestador/assinar');

        self::assertResponseIsSuccessful();
        $this->entityManager->refresh($prestador);
        self::assertTrue($prestador->isAtivo());
        self::assertContains('ROLE_PREMIUM', $prestador->getUsuario()->getRoles());
    }

    public function testAssinarCriaPortifolioSeInexistente(): void
    {
        $prestador = $this->buscarPrestador('prestcomum@exemplo.com');
        self::assertNull($prestador->getPortifolio());

        $this->autenticarCliente('prestcomum@exemplo.com');
        $this->client->request('POST', '/api/areaprestador/assinar');

        self::assertResponseIsSuccessful();
        $this->entityManager->refresh($prestador);

        $portifolio = $this->entityManager->getRepository(Portifolio::class)
            ->findOneBy(['prestador' => $prestador]);

        self::assertNotNull($portifolio, 'Portfólio deve ser criado automaticamente ao assinar.');
    }
}
