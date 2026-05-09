<?php

namespace App\Tests\Controller\Admin\Cadastro;

use App\Entity\Servico\Profissao;
use App\Entity\Auth\Usuario;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

final class ProfissaoControllerTest extends WebTestCase
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

    public function testDeveListarProfissoesComSucesso(): void
    {
        $this->criarProfissao('Marceneiro');

        $this->client->request('GET', '/api/admin/cadastro/profissoes');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        // Se sua fixture estiver vazia de profissoes, o count será 1
        self::assertCount(1, $conteudo);
        self::assertEquals('Marceneiro', $conteudo[0]['descricao']);
    }

    public function testDeveCriarProfissaoComSucesso(): void
    {
        $this->client->request(
            'POST',
            '/api/admin/cadastro/profissoes',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['descricao' => 'Encanador'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertEquals('Encanador', $conteudo['descricao']);
    }

    public function testDeveAtualizarProfissaoComSucesso(): void
    {
        $profissao = $this->criarProfissao('Pedreiro');

        $this->client->request(
            'PUT',
            '/api/admin/cadastro/profissoes/' . $profissao->getId(),
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['descricao' => 'Mestre de Obras'])
        );

        self::assertResponseIsSuccessful();
        $this->entityManager->refresh($profissao);
        self::assertEquals('Mestre de Obras', $profissao->getDescricao());
    }

    public function testDeveExcluirProfissaoComSucesso(): void
    {
        $profissao = $this->criarProfissao('Pintor');

        $this->client->request('DELETE', '/api/admin/cadastro/profissoes/' . $profissao->getId());

        self::assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);
        $this->entityManager->refresh($profissao);
        self::assertNotNull($profissao->getExcluidoEm());
    }

    public function testDeveRestaurarProfissaoComSucesso(): void
    {
        $profissao = $this->criarProfissao('Eletricista');
        $profissao->setExcluidoEm(new \DateTimeImmutable());
        $this->entityManager->flush();

        $this->client->request('POST', "/api/admin/cadastro/profissoes/{$profissao->getId()}/restaurar");

        self::assertResponseIsSuccessful();
        $this->entityManager->refresh($profissao);
        self::assertNull($profissao->getExcluidoEm());
    }

    public function testRetorna404AoBuscarIdInexistente(): void
    {
        $this->client->request('DELETE', '/api/admin/cadastro/profissoes/99999');

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    public function testRetorna409AoCriarDescricaoDuplicada(): void
    {
        $this->criarProfissao('Carpinteiro');

        $this->client->request(
            'POST',
            '/api/admin/cadastro/profissoes',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['descricao' => 'Carpinteiro'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CONFLICT);
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertStringContainsString('Já existe uma profissão', $conteudo['errors']['descricao']);
    }

    public function testRetorna422ParaDadosInvalidos(): void
    {
        $this->client->request(
            'POST',
            '/api/admin/cadastro/profissoes',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['descricao' => ''])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testRetorna409AoAtualizarParaDescricaoJaExistente(): void
    {
        $this->criarProfissao('Programador');
        $profissaoB = $this->criarProfissao('Designer');

        $this->client->request(
            'PUT',
            '/api/admin/cadastro/profissoes/' . $profissaoB->getId(),
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['descricao' => 'Programador'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CONFLICT);
    }

    private function criarProfissao(string $descricao): Profissao
    {
        $profissao = new Profissao();
        $profissao->setDescricao($descricao);
        $this->entityManager->persist($profissao);
        $this->entityManager->flush();

        return $profissao;
    }
}
