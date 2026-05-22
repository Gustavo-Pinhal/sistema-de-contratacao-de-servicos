<?php

namespace App\Tests\Controller\Portifolio;

use App\Entity\Auth\Usuario;
use App\Entity\Localizacao\Cep;
use App\Entity\Localizacao\Endereco;
use App\Entity\Portifolio\Portifolio;
use App\Entity\Portifolio\Projeto;
use App\Entity\Servico\Prestador;
use App\Entity\Servico\Servico;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Testes funcionais para GerirProjetosController.
 *
 * O DAMA\DoctrineTestBundle envolve cada teste em uma transação revertida
 * automaticamente ao final, garantindo isolamento sem necessidade de
 * limpeza manual do banco de dados.
 *
 * Todos os endpoints exigem ROLE_PREMIUM.
 */
final class GerirProjetosControllerTest extends WebTestCase
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

    /**
     * Promove um prestador existente para ROLE_PREMIUM e cria portfólio.
     */
    private function promoverParaPremium(string $email): Prestador
    {
        $usuario   = $this->buscarUsuario($email);
        $prestador = $this->buscarPrestador($email);

        $usuario->setRoles(['ROLE_PRESTADOR', 'ROLE_PREMIUM']);
        $prestador->setAtivo(true);

        $portifolio = new Portifolio($prestador);
        $this->entityManager->persist($portifolio);
        $this->entityManager->flush();

        return $prestador;
    }

    /**
     * Cria um serviço concluído para o prestador (necessário para criar projetos).
     */
    private function criarServicoConcluido(string $emailCliente, string $emailPrestador): Servico
    {
        $cliente   = $this->buscarUsuario($emailCliente);
        $prestador = $this->buscarUsuario($emailPrestador);

        $cep      = $this->entityManager->getRepository(Cep::class)->find('78280000');
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

    /**
     * Cria um projeto diretamente no portfólio (sem passar pelo endpoint de criar).
     */
    private function criarProjeto(Portifolio $portifolio, Servico $servico, string $titulo = 'Projeto Teste'): Projeto
    {
        $posicao = $portifolio->getProjetos()->count() + 1;
        $projeto = new Projeto(
            $portifolio,
            $servico,
            $titulo,
            'Descrição do projeto de teste.',
            '0',
            false,
            new \DateTimeImmutable(),
            false,
            $posicao,
        );
        $this->entityManager->persist($projeto);
        $this->entityManager->flush();

        return $projeto;
    }

    // -------------------------------------------------------------------------
    // GET /api/portifolio/projeto/meu
    // -------------------------------------------------------------------------

    public function testDeveRetornarPortifolioDoAutenticado(): void
    {
        $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $this->autenticar('joaoaugusto@exemplo.com');

        $this->client->request('GET', '/api/portifolio/projeto/meu');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertArrayHasKey('projetos', $conteudo);
        self::assertArrayHasKey('biografia', $conteudo);
        self::assertArrayHasKey('servicosConcluidos', $conteudo);
        self::assertArrayHasKey('id', $conteudo);
    }

    public function testPortifolioSemProjetosRetornaArrayVazio(): void
    {
        $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $this->autenticar('joaoaugusto@exemplo.com');

        $this->client->request('GET', '/api/portifolio/projeto/meu');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertIsArray($conteudo['projetos']);
        self::assertEmpty($conteudo['projetos']);
    }

    public function testPrestadorSemPortifolioRetornaEstruturaVazia(): void
    {
        $usuario = $this->buscarUsuario('joaoaugusto@exemplo.com');
        $usuario->setRoles(['ROLE_PRESTADOR', 'ROLE_PREMIUM']);
        $this->entityManager->flush();

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('GET', '/api/portifolio/projeto/meu');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertEmpty($conteudo['projetos']);
        self::assertNull($conteudo['id']);
        self::assertSame(0, $conteudo['servicosConcluidos']);
    }

    public function testGetMeuRetorna403SemRolePremium(): void
    {
        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('GET', '/api/portifolio/projeto/meu');

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testGetMeuRetorna401SemAutenticacao(): void
    {
        $this->client->request('GET', '/api/portifolio/projeto/meu');
        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    // -------------------------------------------------------------------------
    // POST /api/portifolio/projeto
    // -------------------------------------------------------------------------

    public function testDeveCriarProjetoComSucesso(): void
    {
        $prestador = $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $servico   = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $orcamento = new \App\Entity\Servico\Orcamento($servico, 'Orçamento teste', 100.0, null);
        $this->entityManager->persist($orcamento);
        $servico->concluir();
        $this->entityManager->flush();

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            '/api/portifolio/projeto',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['titulo' => 'Novo Projeto', 'descricao' => 'Descrição completa do projeto.'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['success']);
        self::assertArrayHasKey('id', $conteudo);
        self::assertArrayHasKey('titulo', $conteudo);
        self::assertArrayHasKey('descricao', $conteudo);
        self::assertArrayHasKey('posicao', $conteudo);
    }

    public function testCriarProjetoRetorna404SemPortifolio(): void
    {
        $usuario = $this->buscarUsuario('joaoaugusto@exemplo.com');
        $usuario->setRoles(['ROLE_PRESTADOR', 'ROLE_PREMIUM']);
        $this->entityManager->flush();

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            '/api/portifolio/projeto',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['titulo' => 'Projeto', 'descricao' => 'Desc'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    public function testCriarProjetoRetorna400SemTitulo(): void
    {
        $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $this->autenticar('joaoaugusto@exemplo.com');

        $this->client->request(
            'POST',
            '/api/portifolio/projeto',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['descricao' => 'Sem titulo'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }

    public function testCriarProjetoRetorna400SemDescricao(): void
    {
        $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $this->autenticar('joaoaugusto@exemplo.com');

        $this->client->request(
            'POST',
            '/api/portifolio/projeto',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['titulo' => 'Sem descricao'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }

    public function testCriarProjetoSemServicoConcluido(): void
    {
        $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $this->autenticar('joaoaugusto@exemplo.com');

        $this->client->request(
            'POST',
            '/api/portifolio/projeto',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['titulo' => 'Projeto', 'descricao' => 'Sem servico concluido'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }

    public function testCriarProjetoRetorna403SemRolePremium(): void
    {
        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            '/api/portifolio/projeto',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['titulo' => 'Projeto', 'descricao' => 'Desc'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    // -------------------------------------------------------------------------
    // DELETE /api/portifolio/projeto/{id}
    // -------------------------------------------------------------------------

    public function testDeveExcluirProjetoProprio(): void
    {
        $prestador  = $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $servico    = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $portifolio = $prestador->getPortifolio();
        $projeto    = $this->criarProjeto($portifolio, $servico, 'Projeto para excluir');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('DELETE', "/api/portifolio/projeto/{$projeto->getId()}");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['success']);
    }

    public function testExcluirProjetoRemoveEntidadeNoBanco(): void
    {
        $prestador  = $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $servico    = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $portifolio = $prestador->getPortifolio();
        $projeto    = $this->criarProjeto($portifolio, $servico, 'Projeto para remover');
        $projetoId  = $projeto->getId();

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('DELETE', "/api/portifolio/projeto/{$projetoId}");

        self::assertResponseIsSuccessful();

        $this->entityManager->clear();
        $projetoRemovido = $this->entityManager->getRepository(Projeto::class)->find($projetoId);
        self::assertNull($projetoRemovido, 'Projeto deve ser removido do banco após exclusão.');
    }

    public function testExcluirProjetoRetorna403ParaOutroPrestador(): void
    {
        $prestadorDono  = $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $servico        = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $projeto        = $this->criarProjeto($prestadorDono->getPortifolio(), $servico);

        $this->promoverParaPremium('lucas.mendes@exemplo.com');
        $this->autenticar('lucas.mendes@exemplo.com');
        $this->client->request('DELETE', "/api/portifolio/projeto/{$projeto->getId()}");

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testExcluirProjetoRetorna404ParaProjetoInexistente(): void
    {
        $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('DELETE', '/api/portifolio/projeto/00000000-0000-0000-0000-000000000000');

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    // -------------------------------------------------------------------------
    // PUT /api/portifolio/projeto/{id}
    // -------------------------------------------------------------------------

    public function testDeveEditarProjetoProprio(): void
    {
        $prestador  = $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $servico    = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $projeto    = $this->criarProjeto($prestador->getPortifolio(), $servico, 'Título Original');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'PUT',
            "/api/portifolio/projeto/{$projeto->getId()}",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'titulo'           => 'Título Atualizado',
                'descricao'        => 'Descrição atualizada.',
                'exibirValor'      => true,
                'exibirConcluidoEm' => true,
            ])
        );

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['success']);
    }

    public function testEditarProjetoAtualizaDadosNoBanco(): void
    {
        $prestador  = $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $servico    = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $projeto    = $this->criarProjeto($prestador->getPortifolio(), $servico, 'Antes');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'PUT',
            "/api/portifolio/projeto/{$projeto->getId()}",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'titulo'           => 'Depois',
                'descricao'        => 'Nova descrição.',
                'exibirValor'      => true,
                'exibirConcluidoEm' => false,
            ])
        );

        self::assertResponseIsSuccessful();
        $this->entityManager->refresh($projeto);
        self::assertEquals('Depois', $projeto->getTitulo());
        self::assertTrue($projeto->isExibirValor());
    }

    public function testEditarProjetoRetorna403ParaOutroPrestador(): void
    {
        $prestadorDono = $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $servico       = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $projeto       = $this->criarProjeto($prestadorDono->getPortifolio(), $servico);

        $this->promoverParaPremium('lucas.mendes@exemplo.com');
        $this->autenticar('lucas.mendes@exemplo.com');
        $this->client->request(
            'PUT',
            "/api/portifolio/projeto/{$projeto->getId()}",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'titulo'           => 'Hackeado',
                'descricao'        => 'Tentativa',
                'exibirValor'      => false,
                'exibirConcluidoEm' => false,
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    // -------------------------------------------------------------------------
    // POST /api/portifolio/projeto/{id}/upload
    // -------------------------------------------------------------------------

    public function testUploadSemArquivoRetorna400(): void
    {
        $prestador = $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $servico   = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $projeto   = $this->criarProjeto($prestador->getPortifolio(), $servico);

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('POST', "/api/portifolio/projeto/{$projeto->getId()}/upload");

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }

    public function testUploadRetorna403ParaOutroPrestador(): void
    {
        $prestadorDono = $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $servico       = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $projeto       = $this->criarProjeto($prestadorDono->getPortifolio(), $servico);

        $this->promoverParaPremium('lucas.mendes@exemplo.com');
        $this->autenticar('lucas.mendes@exemplo.com');
        $this->client->request('POST', "/api/portifolio/projeto/{$projeto->getId()}/upload");

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    // -------------------------------------------------------------------------
    // DELETE /api/portifolio/projeto/foto/{fotoId}
    // -------------------------------------------------------------------------

    public function testExcluirFotoInexistenteRetorna404(): void
    {
        $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('DELETE', '/api/portifolio/projeto/foto/00000000-0000-0000-0000-000000000000');

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }
}
