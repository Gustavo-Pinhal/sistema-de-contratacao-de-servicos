<?php

namespace App\Tests\Controller;

use App\Entity\Auth\Usuario;
use App\Entity\Avaliacao\Avaliacao;
use App\Entity\Localizacao\Cep;
use App\Entity\Localizacao\Endereco;
use App\Entity\Servico\Orcamento;
use App\Entity\Servico\Prestador;
use App\Entity\Servico\Profissao;
use App\Entity\Servico\Servico;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Testes funcionais para PrestadorController (GET /api/prestador/{id})
 * e AvaliacoesController (GET /api/prestador/{id}/avaliacoes).
 *
 * Ambos os endpoints são de acesso público (PUBLIC_ACCESS).
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

    private function buscarUsuario(string $email): Usuario
    {
        return $this->entityManager->getRepository(Usuario::class)->findOneBy(['email' => $email]);
    }

    private function buscarPrestador(string $email): Prestador
    {
        $usuario = $this->buscarUsuario($email);
        return $this->entityManager->getRepository(Prestador::class)->find($usuario->getId());
    }

    private function criarServicoConcluido(string $emailCliente, string $emailPrestador): Servico
    {
        $cliente   = $this->buscarUsuario($emailCliente);
        $prestador = $this->buscarUsuario($emailPrestador);
        $cep       = $this->entityManager->getRepository(Cep::class)->find('78280000');

        $endereco = new Endereco();
        $endereco->setUsuario($cliente);
        $endereco->setCep($cep);
        $this->entityManager->persist($endereco);

        $servico = new Servico($cliente, $prestador, $endereco);
        $this->entityManager->persist($servico->getSala());
        $this->entityManager->persist($servico);

        $orcamento = new Orcamento($servico, 'Serviço realizado', 350.0, null);
        $this->entityManager->persist($orcamento);
        $servico->concluir();
        $this->entityManager->flush();

        return $servico;
    }

    // -------------------------------------------------------------------------
    // GET /api/prestador/{id}   (PUBLIC_ACCESS)
    // -------------------------------------------------------------------------

    public function testDeveRetornarPerfilDoPrestador(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $this->client->request('GET', "/api/prestador/{$prestador->getId()}");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertArrayHasKey('nomeComercial', $conteudo);
        self::assertArrayHasKey('nome', $conteudo);
        self::assertArrayHasKey('premium', $conteudo);
        self::assertArrayHasKey('municipio', $conteudo);
        self::assertArrayHasKey('profissoes', $conteudo);
        self::assertArrayHasKey('servicosConcluidos', $conteudo);
    }

    public function testPerfilNaoExigeAutenticacao(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $this->client->request('GET', "/api/prestador/{$prestador->getId()}");

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
    }

    public function testPerfilRetornaProfissoesComoArray(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $this->client->request('GET', "/api/prestador/{$prestador->getId()}");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertIsArray($conteudo['profissoes']);
    }

    public function testPerfilProfissoesContemIdEDescricao(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');
        $profissao = $this->entityManager->getRepository(Profissao::class)
            ->findOneBy(['descricao' => 'Eletricista']);
        $prestador->addProfissao($profissao);
        $this->entityManager->flush();

        $this->client->request('GET', "/api/prestador/{$prestador->getId()}");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertNotEmpty($conteudo['profissoes']);
        self::assertArrayHasKey('id', $conteudo['profissoes'][0]);
        self::assertArrayHasKey('descricao', $conteudo['profissoes'][0]);
    }

    public function testPerfilRetornaPremiumFalsoParaPrestadorInativo(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');
        $prestador->setAtivo(false);
        $this->entityManager->flush();

        $this->client->request('GET', "/api/prestador/{$prestador->getId()}");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertFalse($conteudo['premium']);
    }

    public function testPerfilRetornaPremiumVerdadeiroParaPrestadorAtivo(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');
        $prestador->setAtivo(true);
        $this->entityManager->flush();

        $this->client->request('GET', "/api/prestador/{$prestador->getId()}");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['premium']);
    }

    public function testPerfilRetornaServicosConcluidos(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');
        $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->client->request('GET', "/api/prestador/{$prestador->getId()}");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertGreaterThanOrEqual(1, $conteudo['servicosConcluidos']);
    }

    public function testPerfilRetorna404ParaIdInexistente(): void
    {
        $this->client->request('GET', '/api/prestador/00000000-0000-0000-0000-000000000000');

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    // -------------------------------------------------------------------------
    // GET /api/prestador/{id}/avaliacoes   (PUBLIC_ACCESS)
    // -------------------------------------------------------------------------

    public function testDeveRetornarAvaliacoesDoPrestador(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $this->client->request('GET', "/api/prestador/{$prestador->getId()}/avaliacoes");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertIsArray($conteudo);
    }

    public function testAvaliacoesNaoExigeAutenticacao(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $this->client->request('GET', "/api/prestador/{$prestador->getId()}/avaliacoes");

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
    }

    public function testAvaliacoesRetornaVazioSemAvaliacoes(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $this->client->request('GET', "/api/prestador/{$prestador->getId()}/avaliacoes");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertEmpty($conteudo);
    }

    public function testAvaliacoesRetornaEstruturaDeCampos(): void
    {
        $servico   = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $avaliacao = new Avaliacao($servico, 9.5, 'Excelente profissional.');
        $servico->setAvaliacao($avaliacao);
        $this->entityManager->persist($avaliacao);
        $this->entityManager->flush();

        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');
        $this->entityManager->clear();

        $this->client->request('GET', "/api/prestador/{$prestador->getId()}/avaliacoes");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertNotEmpty($conteudo);
        $item = $conteudo[0];
        self::assertArrayHasKey('id', $item);
        self::assertArrayHasKey('data', $item);
        self::assertArrayHasKey('nota', $item);
        self::assertArrayHasKey('comentario', $item);
        self::assertArrayHasKey('imagens', $item);
        self::assertArrayHasKey('servico', $item);
    }

    public function testAvaliacoesRetornaNotaCorreta(): void
    {
        $servico   = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $avaliacao = new Avaliacao($servico, 8.0, 'Bom serviço.');
        $servico->setAvaliacao($avaliacao);
        $this->entityManager->persist($avaliacao);
        $this->entityManager->flush();

        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');
        $this->entityManager->clear();

        $this->client->request('GET', "/api/prestador/{$prestador->getId()}/avaliacoes");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertEquals(8.0, $conteudo[0]['nota']);
    }

    public function testAvaliacoesRetornaSubobjetoServico(): void
    {
        $servico   = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $avaliacao = new Avaliacao($servico, 7.0, null);
        $servico->setAvaliacao($avaliacao);
        $this->entityManager->persist($avaliacao);
        $this->entityManager->flush();

        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');
        $this->entityManager->clear();

        $this->client->request('GET', "/api/prestador/{$prestador->getId()}/avaliacoes");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertArrayHasKey('servico', $conteudo[0]);
        self::assertArrayHasKey('data', $conteudo[0]['servico']);
        self::assertArrayHasKey('total', $conteudo[0]['servico']);
    }

    public function testAvaliacoesRetorna404ParaIdInexistente(): void
    {
        $this->client->request('GET', '/api/prestador/00000000-0000-0000-0000-000000000000/avaliacoes');

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }
}
