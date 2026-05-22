<?php

namespace App\Tests\Controller\Prestador;

use App\Entity\Auth\Usuario;
use App\Entity\Localizacao\Cep;
use App\Entity\Localizacao\Endereco;
use App\Entity\Portifolio\Portifolio;
use App\Entity\Portifolio\Projeto;
use App\Entity\Servico\Orcamento;
use App\Entity\Servico\Prestador;
use App\Entity\Servico\Servico;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Testes funcionais para PortifolioController (público) e GerarProjetoController (premium).
 *
 * O DAMA\DoctrineTestBundle envolve cada teste em uma transação revertida
 * automaticamente ao final, garantindo isolamento sem necessidade de
 * limpeza manual do banco de dados.
 */
final class PortifolioControllerTest extends WebTestCase
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

    private function criarServico(string $emailCliente, string $emailPrestador): Servico
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
        $this->entityManager->flush();

        return $servico;
    }

    private function criarServicoConcluido(string $emailCliente, string $emailPrestador): Servico
    {
        $servico   = $this->criarServico($emailCliente, $emailPrestador);
        $orcamento = new Orcamento($servico, 'Orçamento teste', 500.0, null);
        $this->entityManager->persist($orcamento);
        $servico->concluir();
        $this->entityManager->flush();

        return $servico;
    }

    private function criarProjeto(Portifolio $portifolio, Servico $servico, string $titulo = 'Projeto Teste'): Projeto
    {
        $posicao = $portifolio->getProjetos()->count() + 1;
        $projeto = new Projeto(
            $portifolio,
            $servico,
            $titulo,
            'Descrição do projeto.',
            '500.00',
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
    // GET /api/prestador/{id}/portifolio  (acesso público)
    // -------------------------------------------------------------------------

    public function testDeveVisualizarPortifolioPublicamente(): void
    {
        $prestador = $this->promoverParaPremium('joaoaugusto@exemplo.com');

        $this->client->request('GET', "/api/prestador/{$prestador->getId()}/portifolio");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertArrayHasKey('id', $conteudo);
        self::assertArrayHasKey('biografia', $conteudo);
        self::assertArrayHasKey('servicosConcluidos', $conteudo);
        self::assertArrayHasKey('projetos', $conteudo);
    }

    public function testPortifolioPublicoNaoExigeAutenticacao(): void
    {
        $prestador = $this->promoverParaPremium('joaoaugusto@exemplo.com');

        $this->client->request('GET', "/api/prestador/{$prestador->getId()}/portifolio");

        self::assertResponseStatusCodeSame(Response::HTTP_OK);
    }

    public function testPortifolioRetornaProjetosComoArray(): void
    {
        $prestador = $this->promoverParaPremium('joaoaugusto@exemplo.com');

        $this->client->request('GET', "/api/prestador/{$prestador->getId()}/portifolio");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertIsArray($conteudo['projetos']);
    }

    public function testPortifolioComProjetoRetornaEstruturaDoProjeto(): void
    {
        $prestador = $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $servico   = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $this->criarProjeto($prestador->getPortifolio(), $servico, 'Instalação Elétrica');
        $this->entityManager->clear();

        $this->client->request('GET', "/api/prestador/{$prestador->getId()}/portifolio");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertNotEmpty($conteudo['projetos']);
        $projeto = $conteudo['projetos'][0];
        self::assertArrayHasKey('id', $projeto);
        self::assertArrayHasKey('titulo', $projeto);
        self::assertArrayHasKey('descricao', $projeto);
        self::assertArrayHasKey('regiao', $projeto);
        self::assertArrayHasKey('valor', $projeto);
        self::assertArrayHasKey('exibirValor', $projeto);
        self::assertArrayHasKey('concluidoEm', $projeto);
        self::assertArrayHasKey('exibirConcluidoEm', $projeto);
        self::assertArrayHasKey('posicao', $projeto);
        self::assertArrayHasKey('fotos', $projeto);
    }

    public function testPortifolioSemPortifolioRetorna404(): void
    {
        $prestador = $this->buscarPrestador('joaoaugusto@exemplo.com');

        $this->client->request('GET', "/api/prestador/{$prestador->getId()}/portifolio");

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    public function testPortifolioPrestadorInexistenteRetorna404(): void
    {
        $this->client->request('GET', '/api/prestador/00000000-0000-0000-0000-000000000000/portifolio');

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    // -------------------------------------------------------------------------
    // GET /api/servico/{servico}/projeto  (ROLE_PREMIUM)
    // -------------------------------------------------------------------------

    public function testDeveObterResumoDoServicoConcluido(): void
    {
        $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $servico = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('GET', "/api/servico/{$servico->getId()}/projeto");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertArrayHasKey('servico', $conteudo);
        self::assertArrayHasKey('total', $conteudo);
        self::assertArrayHasKey('conclusao', $conteudo);
    }

    public function testResumoRetorna403ParaPrestadorDiferente(): void
    {
        $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $this->promoverParaPremium('lucas.mendes@exemplo.com');
        $servico = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('lucas.mendes@exemplo.com');
        $this->client->request('GET', "/api/servico/{$servico->getId()}/projeto");

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testResumoRetorna401SemAutenticacao(): void
    {
        $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $servico = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->client->request('GET', "/api/servico/{$servico->getId()}/projeto");

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testResumoRetorna403SemRolePremium(): void
    {
        $servico = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('GET', "/api/servico/{$servico->getId()}/projeto");

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    // -------------------------------------------------------------------------
    // POST /api/servico/{servico}/projeto  (ROLE_PREMIUM)
    // -------------------------------------------------------------------------

    public function testDeveCriarProjetoAPartirDeServicoConcluido(): void
    {
        $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $servico = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/projeto",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'titulo'            => 'Instalação Elétrica Comercial',
                'descricao'         => 'Descrição detalhada da instalação realizada.',
                'exibirValor'       => true,
                'exibirConcluidoEm' => true,
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['success']);
        self::assertArrayHasKey('id', $conteudo);
    }

    public function testCriarProjetoPersisteProjeto(): void
    {
        $prestador = $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $servico   = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/projeto",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'titulo'            => 'Projeto Persistido',
                'descricao'         => 'Deve ser salvo no banco.',
                'exibirValor'       => false,
                'exibirConcluidoEm' => false,
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);

        $projetos = $this->entityManager->getRepository(Projeto::class)
            ->findBy(['portifolio' => $prestador->getPortifolio()->getId()]);

        self::assertNotEmpty($projetos, 'Projeto deve ser persistido no banco.');
    }

    public function testCriarProjetoRetorna422ParaServicoNaoConcluido(): void
    {
        $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/projeto",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'titulo'            => 'Projeto Inválido',
                'descricao'         => 'Serviço ainda não concluído.',
                'exibirValor'       => false,
                'exibirConcluidoEm' => false,
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testCriarProjetoRetorna422ParaServicoJaComProjeto(): void
    {
        $prestador = $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $servico   = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $projeto = $this->criarProjeto($prestador->getPortifolio(), $servico, 'Projeto Existente');
        $servico->setProjeto($projeto);
        $this->entityManager->flush();

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/projeto",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'titulo'            => 'Duplicado',
                'descricao'         => 'Não deve criar segundo projeto.',
                'exibirValor'       => false,
                'exibirConcluidoEm' => false,
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testCriarProjetoRetorna422ComTituloVazio(): void
    {
        $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $servico = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/projeto",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'titulo'            => '',
                'descricao'         => 'Descrição válida.',
                'exibirValor'       => false,
                'exibirConcluidoEm' => false,
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testCriarProjetoRetorna403ParaPrestadorDiferente(): void
    {
        $this->promoverParaPremium('joaoaugusto@exemplo.com');
        $this->promoverParaPremium('lucas.mendes@exemplo.com');
        $servico = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('lucas.mendes@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/projeto",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'titulo'            => 'Tentativa',
                'descricao'         => 'Não deve criar.',
                'exibirValor'       => false,
                'exibirConcluidoEm' => false,
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testCriarProjetoRetorna403SemRolePremium(): void
    {
        $servico = $this->criarServicoConcluido('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/projeto",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'titulo'            => 'Sem Premium',
                'descricao'         => 'Não deve criar.',
                'exibirValor'       => false,
                'exibirConcluidoEm' => false,
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }
}
