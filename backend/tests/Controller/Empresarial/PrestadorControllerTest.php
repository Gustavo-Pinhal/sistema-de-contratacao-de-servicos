<?php

namespace App\Tests\Controller\Empresarial;

use App\Entity\Auth\Usuario;
use App\Entity\Empresarial\Empresa;
use App\Entity\Empresarial\EmpresaPrestador;
use App\Entity\Notificacao\Notificacao;
use App\Entity\Servico\Prestador;
use App\Entity\Servico\Profissao;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Uid\Uuid;

/**
 * Testes funcionais para Empresarial\PrestadorController.
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

    private function buscarPrestador(string $email): Prestador
    {
        $usuario = $this->buscarUsuario($email);
        return $this->entityManager->getRepository(Prestador::class)->find($usuario->getId());
    }

    private function buscarIdProfissao(string $descricao): int
    {
        return $this->entityManager->getRepository(Profissao::class)
            ->findOneBy(['descricao' => $descricao])
            ->getId();
    }

    /**
     * Cria um usuário com ROLE_EMPRESA e a entidade Empresa correspondente.
     */
    private function criarEmpresa(string $email = 'empresa@teste.com', string $nome = 'Empresa Teste'): Usuario
    {
        /** @var UserPasswordHasherInterface $hasher */
        $hasher = static::getContainer()->get(UserPasswordHasherInterface::class);

        $usuario = new Usuario();
        $usuario->setEmail($email);
        $usuario->setNome($nome);
        $usuario->setRoles(['ROLE_EMPRESA']);
        $usuario->setPassword($hasher->hashPassword($usuario, '123456'));
        $this->entityManager->persist($usuario);

        $empresa = new Empresa($usuario);
        $this->entityManager->persist($empresa);
        $this->entityManager->flush();

        return $usuario;
    }

    private function autenticarComoEmpresa(string $email = 'empresa@teste.com'): void
    {
        $usuario = $this->entityManager->getRepository(Usuario::class)->findOneBy(['email' => $email]);

        $token = static::getContainer()
            ->get('lexik_jwt_authentication.jwt_manager')
            ->create($usuario);

        $this->client->setServerParameter('HTTP_Authorization', sprintf('Bearer %s', $token));
    }

    // -------------------------------------------------------------------------
    // GET /api/empresarial/prestador
    // -------------------------------------------------------------------------

    public function testDeveListarPrestadoresVinculados(): void
    {
        $this->criarEmpresa();
        $this->autenticarComoEmpresa();
        $this->client->request('GET', '/api/empresarial/prestador');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertIsArray($conteudo);
    }

    public function testListagemRetornaVazioSemPrestadoresVinculados(): void
    {
        $this->criarEmpresa();
        $this->autenticarComoEmpresa();
        $this->client->request('GET', '/api/empresarial/prestador');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertEmpty($conteudo);
    }

    public function testListagemRetornaPrestadorVinculado(): void
    {
        $empresaUsuario = $this->criarEmpresa();
        $empresa        = $this->entityManager->getRepository(Empresa::class)->find($empresaUsuario->getId());
        $prestador      = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $vinculo = new EmpresaPrestador($empresa, $prestador->getId());
        $this->entityManager->persist($vinculo);
        $this->entityManager->flush();

        $this->autenticarComoEmpresa();
        $this->client->request('GET', '/api/empresarial/prestador');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertNotEmpty($conteudo);
        self::assertArrayHasKey('id', $conteudo[0]);
        self::assertArrayHasKey('nomeComercial', $conteudo[0]);
    }

    public function testListagemNaoRetornaPrestadoresDesfiliados(): void
    {
        $empresaUsuario = $this->criarEmpresa();
        $empresa        = $this->entityManager->getRepository(Empresa::class)->find($empresaUsuario->getId());
        $prestador      = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $vinculo = new EmpresaPrestador($empresa, $prestador->getId());
        $vinculo->setExcluidoEm(new \DateTimeImmutable());
        $this->entityManager->persist($vinculo);
        $this->entityManager->flush();

        $this->autenticarComoEmpresa();
        $this->client->request('GET', '/api/empresarial/prestador');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertEmpty($conteudo);
    }

    public function testListagemRetorna403SemAutenticacao(): void
    {
        $this->client->request('GET', '/api/empresarial/prestador');
        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testListagemRetorna403ParaNaoEmpresa(): void
    {
        $this->autenticar('admin@teste.com');
        $this->client->request('GET', '/api/empresarial/prestador');
        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    // -------------------------------------------------------------------------
    // POST /api/empresarial/prestador/criar
    // -------------------------------------------------------------------------

    public function testDeveCriarEVincularPrestador(): void
    {
        $this->criarEmpresa();
        $this->autenticarComoEmpresa();

        $this->client->request(
            'POST',
            '/api/empresarial/prestador/criar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'      => 'Novo Prestador',
                'email'     => 'novoprestador@teste.com',
                'senha'     => 'SenhaSegura123',
                'profissao' => $this->buscarIdProfissao('Eletricista'),
                'cep'       => '78280000',
            ])
        );

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['success']);
    }

    public function testCriarPrestadorPersistePrestadorEVinculo(): void
    {
        $empresaUsuario = $this->criarEmpresa();
        $this->autenticarComoEmpresa();

        $this->client->request(
            'POST',
            '/api/empresarial/prestador/criar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'      => 'Prestador Persistido',
                'email'     => 'prestadorpersistido@teste.com',
                'senha'     => 'SenhaSegura123',
                'profissao' => $this->buscarIdProfissao('Pintor'),
                'cep'       => '78280000',
            ])
        );

        self::assertResponseIsSuccessful();

        $usuario = $this->entityManager->getRepository(Usuario::class)
            ->findOneBy(['email' => 'prestadorpersistido@teste.com']);
        self::assertNotNull($usuario);

        $prestador = $this->entityManager->getRepository(Prestador::class)->find($usuario->getId());
        self::assertNotNull($prestador);

        $vinculo = $this->entityManager->getRepository(EmpresaPrestador::class)
            ->findOneBy(['idPrestador' => $prestador->getId(), 'empresa' => $empresaUsuario->getId(), 'excluidoEm' => null]);
        self::assertNotNull($vinculo, 'Vínculo EmpresaPrestador deve ser criado.');
    }

    public function testCriarPrestadorRetorna409ParaEmailDuplicado(): void
    {
        $this->criarEmpresa();
        $this->autenticarComoEmpresa();

        $this->client->request(
            'POST',
            '/api/empresarial/prestador/criar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'      => 'Duplicado',
                'email'     => 'joaoaugusto@exemplo.com',
                'senha'     => 'SenhaSegura123',
                'profissao' => $this->buscarIdProfissao('Eletricista'),
                'cep'       => '78280000',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CONFLICT);
    }

    public function testCriarPrestadorRetorna400ParaProfissaoInexistente(): void
    {
        $this->criarEmpresa();
        $this->autenticarComoEmpresa();

        $this->client->request(
            'POST',
            '/api/empresarial/prestador/criar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'      => 'Sem Profissão',
                'email'     => 'semprofissao2@teste.com',
                'senha'     => 'SenhaSegura123',
                'profissao' => 999999,
                'cep'       => '78280000',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }

    public function testCriarPrestadorRetorna400ParaCepInvalido(): void
    {
        $this->criarEmpresa();
        $this->autenticarComoEmpresa();

        $this->client->request(
            'POST',
            '/api/empresarial/prestador/criar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'      => 'Cep Invalido',
                'email'     => 'cepinvalido2@teste.com',
                'senha'     => 'SenhaSegura123',
                'profissao' => $this->buscarIdProfissao('Eletricista'),
                'cep'       => '00000000',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }

    // -------------------------------------------------------------------------
    // POST /api/empresarial/prestador/convidar
    // -------------------------------------------------------------------------

    public function testDeveEnviarConviteParaPrestadorExistente(): void
    {
        $this->criarEmpresa();
        $this->autenticarComoEmpresa();

        $this->client->request(
            'POST',
            '/api/empresarial/prestador/convidar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'joaoaugusto@exemplo.com'])
        );

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['success']);
    }

    public function testConvitePersiteNotificacaoNoBanco(): void
    {
        $this->criarEmpresa();
        $this->autenticarComoEmpresa();
        $receptor = $this->buscarUsuario('joaoaugusto@exemplo.com');

        $this->client->request(
            'POST',
            '/api/empresarial/prestador/convidar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'joaoaugusto@exemplo.com'])
        );

        self::assertResponseIsSuccessful();

        $notificacao = $this->entityManager->getRepository(Notificacao::class)
            ->findOneBy(['receiver' => $receptor->getId()]);

        self::assertNotNull($notificacao, 'Notificação de convite deve ser persistida no banco.');
    }

    public function testConviteRetorna404ParaEmailNaoCadastrado(): void
    {
        $this->criarEmpresa();
        $this->autenticarComoEmpresa();

        $this->client->request(
            'POST',
            '/api/empresarial/prestador/convidar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'naoexiste@teste.com'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    public function testConviteRetorna400ParaUsuarioSemPerfilPrestador(): void
    {
        $this->criarEmpresa();
        $this->autenticarComoEmpresa();

        $this->client->request(
            'POST',
            '/api/empresarial/prestador/convidar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'cliente@exemplo.com'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }

    public function testConviteRetorna409ParaPrestadorJaVinculado(): void
    {
        $empresaUsuario = $this->criarEmpresa();
        $empresa        = $this->entityManager->getRepository(Empresa::class)->find($empresaUsuario->getId());
        $prestador      = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $vinculo = new EmpresaPrestador($empresa, $prestador->getId());
        $this->entityManager->persist($vinculo);
        $this->entityManager->flush();

        $this->autenticarComoEmpresa();
        $this->client->request(
            'POST',
            '/api/empresarial/prestador/convidar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'joaoaugusto@exemplo.com'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CONFLICT);
    }

    public function testConviteRetorna403ParaEmpresaExcluida(): void
    {
        $empresaUsuario = $this->criarEmpresa();
        $empresa        = $this->entityManager->getRepository(Empresa::class)->find($empresaUsuario->getId());
        $empresa->setExcluidoEm(new \DateTimeImmutable());
        $this->entityManager->flush();

        $this->autenticarComoEmpresa();
        $this->client->request(
            'POST',
            '/api/empresarial/prestador/convidar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'joaoaugusto@exemplo.com'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    // -------------------------------------------------------------------------
    // POST /api/empresarial/prestador/desfiliar
    // -------------------------------------------------------------------------

    public function testDeveDesfiliarPrestadorVinculado(): void
    {
        $empresaUsuario = $this->criarEmpresa();
        $empresa        = $this->entityManager->getRepository(Empresa::class)->find($empresaUsuario->getId());
        $prestador      = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $vinculo = new EmpresaPrestador($empresa, $prestador->getId());
        $this->entityManager->persist($vinculo);
        $this->entityManager->flush();

        $this->autenticarComoEmpresa();
        $this->client->request(
            'POST',
            '/api/empresarial/prestador/desfiliar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['prestadorId' => (string) $prestador->getId()])
        );

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['success']);
    }

    public function testDesfiliaoFazSoftDeleteNoVinculo(): void
    {
        $empresaUsuario = $this->criarEmpresa();
        $empresa        = $this->entityManager->getRepository(Empresa::class)->find($empresaUsuario->getId());
        $prestador      = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $vinculo = new EmpresaPrestador($empresa, $prestador->getId());
        $this->entityManager->persist($vinculo);
        $this->entityManager->flush();

        $this->autenticarComoEmpresa();
        $this->client->request(
            'POST',
            '/api/empresarial/prestador/desfiliar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['prestadorId' => (string) $prestador->getId()])
        );

        self::assertResponseIsSuccessful();
        $this->entityManager->refresh($vinculo);
        self::assertNotNull($vinculo->getExcluidoEm(), 'excluidoEm deve ser preenchido após desfiliação.');
    }

    public function testDesfiliarRetorna404ParaVinculoInexistente(): void
    {
        $this->criarEmpresa();
        $this->autenticarComoEmpresa();

        $this->client->request(
            'POST',
            '/api/empresarial/prestador/desfiliar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['prestadorId' => (string) Uuid::v7()])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    public function testDesfiliarRetorna404ParaPrestadorDeOutraEmpresa(): void
    {
        $empresaA = $this->criarEmpresa('empresaA@teste.com', 'Empresa A');
        $empresaB = $this->criarEmpresa('empresaB@teste.com', 'Empresa B');

        $empresaEntidadeA = $this->entityManager->getRepository(Empresa::class)->find($empresaA->getId());
        $prestador        = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $vinculo = new EmpresaPrestador($empresaEntidadeA, $prestador->getId());
        $this->entityManager->persist($vinculo);
        $this->entityManager->flush();

        $this->autenticarComoEmpresa('empresaB@teste.com');
        $this->client->request(
            'POST',
            '/api/empresarial/prestador/desfiliar',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['prestadorId' => (string) $prestador->getId()])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    // -------------------------------------------------------------------------
    // GET /api/empresarial/prestador/pendentes
    // -------------------------------------------------------------------------

    public function testDeveListarConvitesPendentes(): void
    {
        $this->criarEmpresa();
        $this->autenticarComoEmpresa();
        $this->client->request('GET', '/api/empresarial/prestador/pendentes');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertIsArray($conteudo);
    }

    public function testPendentesRetornaVazioSemConvitesEnviados(): void
    {
        $this->criarEmpresa();
        $this->autenticarComoEmpresa();
        $this->client->request('GET', '/api/empresarial/prestador/pendentes');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertEmpty($conteudo);
    }

    public function testPendentesRetornaConviteEnviadoEstruturaDeCampos(): void
    {
        $empresaUsuario = $this->criarEmpresa();
        $receptor       = $this->buscarUsuario('joaoaugusto@exemplo.com');

        $notificacao = new Notificacao(
            $receptor,
            ['type' => 'filiationInvitation', 'companyName' => 'Empresa Teste'],
            $empresaUsuario,
        );
        $this->entityManager->persist($notificacao);
        $this->entityManager->flush();

        $this->autenticarComoEmpresa();
        $this->client->request('GET', '/api/empresarial/prestador/pendentes');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertNotEmpty($conteudo);
        self::assertArrayHasKey('id', $conteudo[0]);
        self::assertArrayHasKey('destinatario', $conteudo[0]);
        self::assertArrayHasKey('criadoEm', $conteudo[0]);
        self::assertArrayHasKey('id', $conteudo[0]['destinatario']);
        self::assertArrayHasKey('nome', $conteudo[0]['destinatario']);
        self::assertArrayHasKey('email', $conteudo[0]['destinatario']);
    }

    public function testPendentesNaoRetornaConvitesJaVisualizados(): void
    {
        $empresaUsuario = $this->criarEmpresa();
        $receptor       = $this->buscarUsuario('joaoaugusto@exemplo.com');

        $notificacao = new Notificacao(
            $receptor,
            ['type' => 'filiationInvitation', 'companyName' => 'Empresa Teste'],
            $empresaUsuario,
        );
        $notificacao->markAsViewed();
        $this->entityManager->persist($notificacao);
        $this->entityManager->flush();

        $this->autenticarComoEmpresa();
        $this->client->request('GET', '/api/empresarial/prestador/pendentes');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertEmpty($conteudo, 'Convites já visualizados não devem aparecer em pendentes.');
    }
}
