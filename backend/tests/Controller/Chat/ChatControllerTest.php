<?php

namespace App\Tests\Controller\Chat;

use App\Entity\Auth\Usuario;
use App\Entity\Chat\Mensagem;
use App\Entity\Localizacao\Cep;
use App\Entity\Localizacao\Endereco;
use App\Entity\Servico\Servico;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Testes funcionais para ChatController.
 *
 * O DAMA\DoctrineTestBundle envolve cada teste em uma transação revertida
 * automaticamente ao final, garantindo isolamento sem necessidade de
 * limpeza manual do banco de dados.
 */
final class ChatControllerTest extends WebTestCase
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

    private function criarServico(string $emailCliente, string $emailPrestador): Servico
    {
        $cliente   = $this->buscarUsuario($emailCliente);
        $prestador = $this->buscarUsuario($emailPrestador);

        $cep = $this->entityManager->getRepository(Cep::class)->find('78280000');

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

    // -------------------------------------------------------------------------
    // GET /api/servico/{id}/chat
    // -------------------------------------------------------------------------

    public function testClienteDeveAbrirChatComSucesso(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', "/api/servico/{$servico->getId()}/chat");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertArrayHasKey('idUsuario', $conteudo);
        self::assertArrayHasKey('idServico', $conteudo);
        self::assertArrayHasKey('mercureToken', $conteudo);
        self::assertArrayHasKey('topico', $conteudo);
        self::assertArrayHasKey('participantes', $conteudo);
        self::assertArrayHasKey('messagens', $conteudo);
    }

    public function testPrestadorDeveAbrirChatComSucesso(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request('GET', "/api/servico/{$servico->getId()}/chat");

        self::assertResponseIsSuccessful();
    }

    public function testChatRetornaIdDoUsuarioAutenticado(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $cliente = $this->buscarUsuario('cliente@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', "/api/servico/{$servico->getId()}/chat");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertEquals((string) $cliente->getId(), $conteudo['idUsuario']);
    }

    public function testChatRetornaParticipantesComCamposCorretos(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', "/api/servico/{$servico->getId()}/chat");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertArrayHasKey('cliente', $conteudo['participantes']);
        self::assertArrayHasKey('prestador', $conteudo['participantes']);
        self::assertArrayHasKey('id', $conteudo['participantes']['cliente']);
        self::assertArrayHasKey('nome', $conteudo['participantes']['cliente']);
        self::assertArrayHasKey('id', $conteudo['participantes']['prestador']);
        self::assertArrayHasKey('nome', $conteudo['participantes']['prestador']);
    }

    public function testChatRetornaMensagensVaziasSemHistorico(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', "/api/servico/{$servico->getId()}/chat");

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);

        self::assertIsArray($conteudo['messagens']);
        self::assertEmpty($conteudo['messagens']);
    }

    public function testTerceiroRetorna403AoAbrirChat(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('bruno@exemplo.com');
        $this->client->request('GET', "/api/servico/{$servico->getId()}/chat");

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testSemAutenticacaoRetorna401(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->client->request('GET', "/api/servico/{$servico->getId()}/chat");

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testServicoInexistenteRetorna404(): void
    {
        $this->autenticar('cliente@exemplo.com');
        $this->client->request('GET', '/api/servico/00000000-0000-0000-0000-000000000000/chat');

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    // -------------------------------------------------------------------------
    // POST /api/servico/{id}/chat
    // -------------------------------------------------------------------------

    public function testClienteDeveEnviarMensagemDeTexto(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/chat",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['texto' => 'Olá, tudo bem?'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertEquals('success', $conteudo['status']);
    }

    public function testPrestadorDeveEnviarMensagemDeTexto(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('joaoaugusto@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/chat",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['texto' => 'Olá! Qual o valor do orçamento?'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
    }

    public function testEnvioMensagemPersisteDadosNoBanco(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $salaId  = $servico->getSala()->getId();

        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/chat",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['texto' => 'Mensagem persistida'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);

        $mensagens = $this->entityManager->getRepository(Mensagem::class)
            ->findBy(['sala' => $salaId]);

        self::assertCount(1, $mensagens, 'Deve haver exatamente 1 mensagem persistida na sala.');
    }

    public function testEnvioMensagemComRespondePersiste(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');
        $salaId  = $servico->getSala()->getId();

        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/chat",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['texto' => 'Primeira mensagem'])
        );
        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);

        $mensagens = $this->entityManager->getRepository(Mensagem::class)
            ->findBy(['sala' => $salaId]);
        self::assertCount(1, $mensagens);

        $primeiraMensagem = $mensagens[0];

        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/chat",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'texto'    => 'Respondendo à primeira mensagem',
                'responde' => (string) $primeiraMensagem->getId(),
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);

        $mensagensAtualizadas = $this->entityManager->getRepository(Mensagem::class)
            ->findBy(['sala' => $salaId]);
        self::assertCount(2, $mensagensAtualizadas, 'Deve haver 2 mensagens após resposta.');
    }

    public function testEnvioMensagemTextoVazioRetorna422(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/chat",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['texto' => ''])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testEnvioMensagemTextoAcimaDe512CaracteresRetorna422(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/chat",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['texto' => str_repeat('A', 513)])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testEnvioMensagemRespondeUuidInvalidoRetorna422(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/chat",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['texto' => 'Texto válido', 'responde' => 'nao-e-uuid'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testTerceiroNaoPodeEnviarMensagem(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('bruno@exemplo.com');
        $this->client->request(
            'POST',
            "/api/servico/{$servico->getId()}/chat",
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode(['texto' => 'Tentativa indevida'])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    // -------------------------------------------------------------------------
    // GET /api/servico/{id}/chat/{mensagemId}/download
    // -------------------------------------------------------------------------

    public function testDownloadArquivoInexistenteRetorna404(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request(
            'GET',
            "/api/servico/{$servico->getId()}/chat/00000000-0000-0000-0000-000000000000/download"
        );

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    public function testDownloadSemAutenticacaoRetorna401(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->client->request(
            'GET',
            "/api/servico/{$servico->getId()}/chat/00000000-0000-0000-0000-000000000000/download"
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    // -------------------------------------------------------------------------
    // POST /api/servico/{id}/chat/upload
    // -------------------------------------------------------------------------

    public function testUploadSemArquivoRetorna400(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('cliente@exemplo.com');
        $this->client->request('POST', "/api/servico/{$servico->getId()}/chat/upload");

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }

    public function testUploadTerceiroRetorna403(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->autenticar('bruno@exemplo.com');
        $this->client->request('POST', "/api/servico/{$servico->getId()}/chat/upload");

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testUploadSemAutenticacaoRetorna401(): void
    {
        $servico = $this->criarServico('cliente@exemplo.com', 'joaoaugusto@exemplo.com');

        $this->client->request('POST', "/api/servico/{$servico->getId()}/chat/upload");

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }
}
