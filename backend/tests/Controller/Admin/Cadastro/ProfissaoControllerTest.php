<?php

namespace App\Tests\Controller\Admin\Cadastro;

use App\Entity\Servico\Profissao;
use App\Entity\Auth\Usuario;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Testes funcionais para ProfissaoController.
 *
 * O DAMA\DoctrineTestBundle envolve cada teste em uma transação revertida
 * automaticamente ao final, garantindo isolamento sem necessidade de
 * limpeza manual do banco de dados.
 */
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

    // -------------------------------------------------------------------------
    // GET /api/admin/cadastro/profissoes
    // -------------------------------------------------------------------------

    public function testDeveListarProfissoes(): void
    {
        $this->client->request('GET', '/api/admin/cadastro/profissoes');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertCount(9, $conteudo);
        self::assertEquals('Chaveiro', $conteudo[0]['descricao']);
    }

    public function testListagemRetornaEstruturaDeCamposCorreta(): void
    {
        $this->client->request('GET', '/api/admin/cadastro/profissoes');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertNotEmpty($conteudo);
        $primeiro = $conteudo[0];

        self::assertArrayHasKey('id', $primeiro);
        self::assertArrayHasKey('descricao', $primeiro);
        self::assertArrayHasKey('criadoEm', $primeiro);
        self::assertArrayHasKey('excluidoEm', $primeiro);
        self::assertNull($primeiro['excluidoEm']);
    }

    public function testDeveListarApenasAtivasPorPadrao(): void
    {
        $ativa = $this->criarProfissao('T ativa visível');
        $excluida = $this->criarProfissao('T excluída invisível');
        $excluida->setExcluidoEm(new \DateTimeImmutable());
        $this->entityManager->flush();

        $this->client->request('GET', '/api/admin/cadastro/profissoes');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        $descricoes = array_column($conteudo, 'descricao');
        self::assertContains('T ativa visível', $descricoes);
        self::assertNotContains('T excluída invisível', $descricoes);
    }

    public function testDeveListarProfissoesExcluidasComQueryParam(): void
    {
        $excluida = $this->criarProfissao('T profissão excluída');
        $excluida->setExcluidoEm(new \DateTimeImmutable());
        $this->entityManager->flush();

        $this->client->request('GET', '/api/admin/cadastro/profissoes?excluidos=true');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        $descricoes = array_column($conteudo, 'descricao');
        self::assertContains('T profissão excluída', $descricoes);

        foreach ($conteudo as $item) {
            self::assertNotNull($item['excluidoEm'], 'Todos os itens devem ter excluidoEm preenchido.');
        }
    }

    // -------------------------------------------------------------------------
    // POST /api/admin/cadastro/profissoes
    // -------------------------------------------------------------------------

    public function testDeveCriarProfissaoComSucesso(): void
    {
        $this->client->request(
            'POST',
            '/api/admin/cadastro/profissoes',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['descricao' => 'Profissão Teste'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertEquals('Profissão Teste', $conteudo['descricao']);
        self::assertArrayHasKey('id', $conteudo);
        self::assertNotNull($conteudo['id']);
    }

    public function testRetorna409AoCriarDescricaoDuplicada(): void
    {
        $this->criarProfissao('T Criar duplicado');

        $this->client->request(
            'POST',
            '/api/admin/cadastro/profissoes',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['descricao' => 'T Criar duplicado'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CONFLICT);
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertArrayHasKey('errors', $conteudo);
        self::assertStringContainsString('Já existe uma profissão', $conteudo['errors']['descricao']);
    }

    public function testRetorna422ParaCriarComDescricaoVazia(): void
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

    public function testRetorna422ParaCriarComDescricaoAcimaDe60Caracteres(): void
    {
        $this->client->request(
            'POST',
            '/api/admin/cadastro/profissoes',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['descricao' => str_repeat('A', 61)])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testRetorna422ParaCriarSemCampoDescricao(): void
    {
        $this->client->request(
            'POST',
            '/api/admin/cadastro/profissoes',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    // -------------------------------------------------------------------------
    // PUT /api/admin/cadastro/profissoes/{id}
    // -------------------------------------------------------------------------

    public function testDeveAtualizarProfissaoComSucesso(): void
    {
        $profissao = $this->criarProfissao('T criar profissão');

        $this->client->request(
            'PUT',
            '/api/admin/cadastro/profissoes/' . $profissao->getId(),
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['descricao' => 'T criar profissão editado'])
        );

        self::assertResponseIsSuccessful();
        $this->entityManager->refresh($profissao);
        self::assertEquals('T criar profissão editado', $profissao->getDescricao());
    }

    public function testAtualizacaoRetornaObjetoAtualizado(): void
    {
        $profissao = $this->criarProfissao('T antes da edição');

        $this->client->request(
            'PUT',
            '/api/admin/cadastro/profissoes/' . $profissao->getId(),
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['descricao' => 'T depois da edição'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertEquals('T depois da edição', $conteudo['descricao']);
        self::assertEquals($profissao->getId(), $conteudo['id']);
    }

    public function testRetorna409AoAtualizarParaDescricaoJaExistente(): void
    {
        $this->criarProfissao('T Atualizar repet');
        $profissaoB = $this->criarProfissao('T Atualizar repet B');

        $this->client->request(
            'PUT',
            '/api/admin/cadastro/profissoes/' . $profissaoB->getId(),
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['descricao' => 'T Atualizar repet'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CONFLICT);
    }

    public function testRetorna422ParaAtualizarComDescricaoVazia(): void
    {
        $profissao = $this->criarProfissao('T atualizar inválido');

        $this->client->request(
            'PUT',
            '/api/admin/cadastro/profissoes/' . $profissao->getId(),
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['descricao' => ''])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testRetorna404AoTentarAtualizarIdInexistente(): void
    {
        $this->client->request(
            'PUT',
            '/api/admin/cadastro/profissoes/99999',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['descricao' => 'Qualquer descrição'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    // -------------------------------------------------------------------------
    // POST /api/admin/cadastro/profissoes/{id}/restaurar
    // -------------------------------------------------------------------------

    public function testDeveRestaurarProfissaoComSucesso(): void
    {
        $profissao = $this->criarProfissao('T restaurar profissão');
        $profissao->setExcluidoEm(new \DateTimeImmutable());
        $this->entityManager->flush();

        $this->client->request('POST', "/api/admin/cadastro/profissoes/{$profissao->getId()}/restaurar");

        self::assertResponseIsSuccessful();
        $this->entityManager->refresh($profissao);
        self::assertNull($profissao->getExcluidoEm());
    }

    public function testRestauracaoRetornaExcluidoEmNulo(): void
    {
        $profissao = $this->criarProfissao('T restaurar retorno');
        $profissao->setExcluidoEm(new \DateTimeImmutable());
        $this->entityManager->flush();

        $this->client->request('POST', "/api/admin/cadastro/profissoes/{$profissao->getId()}/restaurar");

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertNull($conteudo['excluidoEm']);
    }

    public function testRetorna404AoTentarRestaurarIdInexistente(): void
    {
        $this->client->request('POST', '/api/admin/cadastro/profissoes/99999/restaurar');

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    // -------------------------------------------------------------------------
    // DELETE /api/admin/cadastro/profissoes/{id}
    // -------------------------------------------------------------------------

    public function testDeveExcluirProfissao(): void
    {
        $profissao = $this->criarProfissao('T excluir profissão');

        $this->client->request('DELETE', '/api/admin/cadastro/profissoes/' . $profissao->getId());

        self::assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);
        $this->entityManager->refresh($profissao);
        self::assertNotNull($profissao->getExcluidoEm());
    }

    public function testExclusaoNaoRemoveRegistroFisicamente(): void
    {
        $profissao = $this->criarProfissao('T soft delete físico');
        $id = $profissao->getId();

        $this->client->request('DELETE', '/api/admin/cadastro/profissoes/' . $id);

        self::assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);

        $this->entityManager->clear();
        $ainda = $this->entityManager->getRepository(Profissao::class)->find($id);
        self::assertNotNull($ainda, 'O registro não deve ser deletado fisicamente.');
        self::assertNotNull($ainda->getExcluidoEm());
    }

    public function testRetorna404AoTentarExcluirIdInexistente(): void
    {
        $this->client->request('DELETE', '/api/admin/cadastro/profissoes/99999');

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function criarProfissao(string $descricao): Profissao
    {
        $profissao = new Profissao($descricao);
        $this->entityManager->persist($profissao);
        $this->entityManager->flush();

        return $profissao;
    }
}
