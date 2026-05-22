<?php

namespace App\Tests\Controller;

use App\Entity\Servico\Prestador;
use App\Entity\Servico\Profissao;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Testes funcionais para BuscaController.
 *
 * O DAMA\DoctrineTestBundle envolve cada teste em uma transação revertida
 * automaticamente ao final, garantindo isolamento sem necessidade de
 * limpeza manual do banco de dados.
 *
 * O endpoint é público (sem autenticação obrigatória).
 */
final class BuscaControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = static::getContainer()->get('doctrine.orm.entity_manager');
    }

    private function buscarProfissao(string $descricao): Profissao
    {
        $profissao = $this->entityManager->getRepository(Profissao::class)
            ->findOneBy(['descricao' => $descricao]);

        if (!$profissao) {
            throw new \LogicException("Profissão '$descricao' não encontrada. Verifique se carregou as fixtures.");
        }

        return $profissao;
    }

    // -------------------------------------------------------------------------
    // GET /api/busca
    // -------------------------------------------------------------------------

    public function testDeveListarTodosPrestadoresSemFiltro(): void
    {
        $this->client->request('GET', '/api/busca');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertIsArray($conteudo);
        self::assertNotEmpty($conteudo);
    }

    public function testEndpointEPublicoSemAutenticacao(): void
    {
        $this->client->request('GET', '/api/busca');

        self::assertResponseIsSuccessful();
    }

    public function testListagemRetornaEstruturaDeCamposCorreta(): void
    {
        $this->client->request('GET', '/api/busca');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertNotEmpty($conteudo);
        $item = $conteudo[0];

        self::assertArrayHasKey('usuario', $item);
        self::assertArrayHasKey('id', $item['usuario']);
        self::assertArrayHasKey('nome', $item);
        self::assertArrayHasKey('urlPerfil', $item);
        self::assertArrayHasKey('profissoes', $item);
        self::assertArrayHasKey('premium', $item);
        self::assertIsBool($item['premium']);
    }

    public function testProfissoesDoCampoContemIdEDescricao(): void
    {
        $this->client->request('GET', '/api/busca');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertNotEmpty($conteudo);

        foreach ($conteudo as $prestador) {
            self::assertIsArray($prestador['profissoes']);
            foreach ($prestador['profissoes'] as $profissao) {
                self::assertArrayHasKey('id', $profissao);
                self::assertArrayHasKey('descricao', $profissao);
            }
        }
    }

    public function testListagemRetornaNomesCorretos(): void
    {
        $this->client->request('GET', '/api/busca');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        $nomes = array_column($conteudo, 'nome');

        self::assertContains('João Augusto', $nomes);
        self::assertContains('Lucas Mendes', $nomes);
    }

    public function testListagemOmitePrestadoresExcluidos(): void
    {
        $prestador = $this->entityManager->getRepository(Prestador::class)
            ->findOneBy(['nome' => 'João Augusto']);

        $prestador->setExcluidoEm(new \DateTimeImmutable());
        $this->entityManager->flush();

        $this->client->request('GET', '/api/busca');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        $nomes = array_column($conteudo, 'nome');
        self::assertNotContains('João Augusto', $nomes);
    }

    // -------------------------------------------------------------------------
    // GET /api/busca?profissao={id}
    // -------------------------------------------------------------------------

    public function testFiltrarPorProfissaoRetornaSomenteAquelaProfissao(): void
    {
        $profissao = $this->buscarProfissao('Pintor');
        $prestador = $this->entityManager->getRepository(Prestador::class)
            ->findOneBy(['nome' => 'Bruno Santos']);
        $prestador->addProfissao($profissao);
        $this->entityManager->flush();

        $this->client->request('GET', '/api/busca?profissao=' . $profissao->getId());

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertNotEmpty($conteudo);

        foreach ($conteudo as $item) {
            $idsProfissoes = array_column($item['profissoes'], 'id');
            self::assertContains($profissao->getId(), $idsProfissoes);
        }
    }

    public function testFiltrarPorProfissaoNaoRetornaPrestadoresDeOutraProfissao(): void
    {
        $eletricista = $this->buscarProfissao('Eletricista');
        $pintor      = $this->buscarProfissao('Pintor');

        $prestadorPintor = $this->entityManager->getRepository(Prestador::class)
            ->findOneBy(['nome' => 'Bruno Santos']);
        $prestadorPintor->addProfissao($pintor);

        $prestadorEletrista = $this->entityManager->getRepository(Prestador::class)
            ->findOneBy(['nome' => 'João Augusto']);
        $prestadorEletrista->addProfissao($eletricista);

        $this->entityManager->flush();

        $this->client->request('GET', '/api/busca?profissao=' . $pintor->getId());

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        $nomes = array_column($conteudo, 'nome');
        self::assertContains('Bruno Santos', $nomes);
        self::assertNotContains('João Augusto', $nomes);
    }

    public function testFiltrarPorProfissaoRetornaVazioParaProfissaoSemPrestadores(): void
    {
        $profissao = $this->buscarProfissao('Chaveiro');

        $this->client->request('GET', '/api/busca?profissao=' . $profissao->getId());

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertIsArray($conteudo);
        self::assertEmpty($conteudo, 'Profissão sem prestadores deve retornar array vazio.');
    }

    public function testFiltrarPorProfissaoInexistenteRetornaVazio(): void
    {
        $this->client->request('GET', '/api/busca?profissao=999999');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertIsArray($conteudo);
        self::assertEmpty($conteudo);
    }

    public function testFiltrarPorEletristaRetornaPrestadoresCorretos(): void
    {
        $profissao = $this->buscarProfissao('Eletricista');

        $joao  = $this->entityManager->getRepository(Prestador::class)->findOneBy(['nome' => 'João Augusto']);
        $lucas = $this->entityManager->getRepository(Prestador::class)->findOneBy(['nome' => 'Lucas Mendes']);
        $joao->addProfissao($profissao);
        $lucas->addProfissao($profissao);
        $this->entityManager->flush();

        $this->client->request('GET', '/api/busca?profissao=' . $profissao->getId());

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertNotEmpty($conteudo);

        $nomes = array_column($conteudo, 'nome');
        self::assertContains('João Augusto', $nomes);
        self::assertContains('Lucas Mendes', $nomes);
    }

    public function testResultadosOrdenadosAlfabeticamente(): void
    {
        $this->client->request('GET', '/api/busca');

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        $nomes = array_column($conteudo, 'nome');
        $nomesOrdenados = $nomes;
        sort($nomesOrdenados);

        self::assertEquals($nomesOrdenados, $nomes, 'Os resultados devem ser ordenados alfabeticamente por nome.');
    }
}
