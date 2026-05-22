<?php

namespace App\Tests\Controller\Admin;

use App\Entity\Auth\Usuario;
use App\Entity\Empresarial\Empresa;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Testes funcionais para EmpresaController.
 *
 * O DAMA\DoctrineTestBundle envolve cada teste em uma transação revertida
 * automaticamente ao final, garantindo isolamento sem necessidade de
 * limpeza manual do banco de dados.
 */
final class EmpresaControllerTest extends WebTestCase
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

    // -------------------------------------------------------------------------
    // GET /api/admin/empresas
    // -------------------------------------------------------------------------

    public function testDeveListarEmpresasAtivas(): void
    {
        $this->client->request('GET', '/api/admin/empresas');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertIsArray($conteudo);
    }

    public function testListagemRetornaEstruturaDeCamposCorreta(): void
    {
        $this->criarEmpresa('Empresa Estrutura', 'estrutura@teste.com');

        $this->client->request('GET', '/api/admin/empresas');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertNotEmpty($conteudo);
        $item = $conteudo[array_key_last($conteudo)];

        self::assertArrayHasKey('id', $item);
        self::assertArrayHasKey('nome', $item);
        self::assertArrayHasKey('email', $item);
        self::assertArrayHasKey('criadoEm', $item);
    }

    public function testListagemNaoRetornaEmpresasExcluidas(): void
    {
        $empresa = $this->criarEmpresa('Empresa Excluída', 'excluida@teste.com');
        $empresa->setExcluidoEm(new \DateTimeImmutable());
        $this->entityManager->flush();

        $this->client->request('GET', '/api/admin/empresas');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        $emails = array_column($conteudo, 'email');
        self::assertNotContains('excluida@teste.com', $emails);
    }

    public function testListagemRetornaEmpresaRecentementeCriada(): void
    {
        $this->criarEmpresa('Empresa Listável', 'listavel@teste.com');

        $this->client->request('GET', '/api/admin/empresas');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        $emails = array_column($conteudo, 'email');
        self::assertContains('listavel@teste.com', $emails);
    }

    public function testDeveRetornar403SemAutenticacao(): void
    {
        $this->client->setServerParameter('HTTP_Authorization', '');
        $this->client->request('GET', '/api/admin/empresas');

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    // -------------------------------------------------------------------------
    // POST /api/admin/empresas
    // -------------------------------------------------------------------------

    public function testDeveCriarEmpresaComSucesso(): void
    {
        $this->client->request(
            'POST',
            '/api/admin/empresas',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome' => 'Oficina Central LTDA',
                'email' => 'contato@oficinacentral.com',
                'senha' => 'senhaSegura123',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertArrayHasKey('id', $conteudo);
        self::assertNotNull($conteudo['id']);
        self::assertEquals('Oficina Central LTDA', $conteudo['nome']);
        self::assertEquals('contato@oficinacentral.com', $conteudo['email']);
        self::assertArrayHasKey('criadoEm', $conteudo);
    }

    public function testCriacaoPersisteDadosNoBanco(): void
    {
        $this->client->request(
            'POST',
            '/api/admin/empresas',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome' => 'Empresa Persistida',
                'email' => 'persistida@teste.com',
                'senha' => 'senha123',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);

        $usuario = $this->entityManager->getRepository(Usuario::class)
            ->findOneBy(['email' => 'persistida@teste.com']);

        self::assertNotNull($usuario, 'O usuário vinculado à empresa deve ser criado.');
        self::assertEquals('Empresa Persistida', $usuario->getNome());
    }

    public function testRetorna409AoCriarEmailDuplicado(): void
    {
        $this->criarEmpresa('Empresa Original', 'duplicado@teste.com');

        $this->client->request(
            'POST',
            '/api/admin/empresas',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome' => 'Outra Empresa',
                'email' => 'duplicado@teste.com',
                'senha' => 'senha123',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CONFLICT);
    }

    public function testRetorna422ParaNomeVazio(): void
    {
        $this->client->request(
            'POST',
            '/api/admin/empresas',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome' => '',
                'email' => 'valido@teste.com',
                'senha' => 'senha123',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testRetorna422ParaNomeComMenosDe3Caracteres(): void
    {
        $this->client->request(
            'POST',
            '/api/admin/empresas',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome' => 'AB',
                'email' => 'valido@teste.com',
                'senha' => 'senha123',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testRetorna422ParaEmailInvalido(): void
    {
        $this->client->request(
            'POST',
            '/api/admin/empresas',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome' => 'Empresa Válida',
                'email' => 'nao-e-um-email',
                'senha' => 'senha123',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testRetorna422ParaSenhaComMenosDe6Caracteres(): void
    {
        $this->client->request(
            'POST',
            '/api/admin/empresas',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome' => 'Empresa Válida',
                'email' => 'valido@teste.com',
                'senha' => '123',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testRetorna422ParaPayloadVazio(): void
    {
        $this->client->request(
            'POST',
            '/api/admin/empresas',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function criarEmpresa(string $nome, string $email): Empresa
    {
        $factory = static::getContainer()->get(\App\Factory\Empresarial\EmpresaFactory::class);

        $empresa = $factory->fromDto(new \App\Dto\Request\Admin\Empresa\CriarEmpresaInputDto(
            nome: $nome,
            email: $email,
            senha: 'senha123',
        ));

        $this->entityManager->persist($empresa->getUsuario());
        $this->entityManager->persist($empresa);
        $this->entityManager->flush();

        return $empresa;
    }
}
