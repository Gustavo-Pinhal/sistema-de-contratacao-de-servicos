<?php

namespace App\Tests\Controller;

use App\Entity\Auth\Usuario;
use App\Entity\Servico\Prestador;
use App\Entity\Servico\Profissao;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Testes funcionais para CadastroController.
 *
 * O DAMA\DoctrineTestBundle envolve cada teste em uma transação revertida
 * automaticamente ao final, garantindo isolamento sem necessidade de
 * limpeza manual do banco de dados.
 *
 * Os endpoints são públicos (sem autenticação obrigatória).
 */
final class CadastroControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = static::getContainer()->get('doctrine.orm.entity_manager');
    }

    private function buscarIdProfissao(string $descricao): int
    {
        $profissao = $this->entityManager->getRepository(Profissao::class)
            ->findOneBy(['descricao' => $descricao]);

        if (!$profissao) {
            throw new \LogicException("Profissão '$descricao' não encontrada nas fixtures.");
        }

        return $profissao->getId();
    }

    // -------------------------------------------------------------------------
    // POST /api/cadastro/cliente
    // -------------------------------------------------------------------------

    public function testDeveCadastrarClienteComSucesso(): void
    {
        $this->client->request(
            'POST',
            '/api/cadastro/cliente',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'  => 'João Silva',
                'email' => 'joaosilva@teste.com',
                'senha' => 'password123',
            ])
        );

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['success']);
    }

    public function testCadastroClientePersisteDadosNoBanco(): void
    {
        $this->client->request(
            'POST',
            '/api/cadastro/cliente',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'  => 'Maria Souza',
                'email' => 'mariasouza@teste.com',
                'senha' => 'password123',
            ])
        );

        self::assertResponseIsSuccessful();

        $usuario = $this->entityManager->getRepository(Usuario::class)
            ->findOneBy(['email' => 'mariasouza@teste.com']);

        self::assertNotNull($usuario);
        self::assertEquals('Maria Souza', $usuario->getNome());
    }

    public function testCadastroClienteEndpointEPublico(): void
    {
        $this->client->request(
            'POST',
            '/api/cadastro/cliente',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'  => 'Publico Teste',
                'email' => 'publico@teste.com',
                'senha' => 'password123',
            ])
        );

        self::assertResponseIsSuccessful();
    }

    public function testRetorna409AoCadastrarClienteComEmailDuplicado(): void
    {
        $this->client->request(
            'POST',
            '/api/cadastro/cliente',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'  => 'Duplicado Teste',
                'email' => 'cliente@exemplo.com',
                'senha' => 'password123',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CONFLICT);
    }

    public function testRetorna422ParaNomeClienteMenorQue3Caracteres(): void
    {
        $this->client->request(
            'POST',
            '/api/cadastro/cliente',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'  => 'AB',
                'email' => 'curto@teste.com',
                'senha' => 'password123',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testRetorna422ParaEmailClienteInvalido(): void
    {
        $this->client->request(
            'POST',
            '/api/cadastro/cliente',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'  => 'Email Invalido',
                'email' => 'nao-e-um-email',
                'senha' => 'password123',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testRetorna422ParaNomeClienteVazio(): void
    {
        $this->client->request(
            'POST',
            '/api/cadastro/cliente',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'  => '',
                'email' => 'valido@teste.com',
                'senha' => 'password123',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    // -------------------------------------------------------------------------
    // POST /api/cadastro/prestador
    // -------------------------------------------------------------------------

    public function testDeveCadastrarPrestadorComSucesso(): void
    {
        $idProfissao = $this->buscarIdProfissao('Eletricista');

        $this->client->request(
            'POST',
            '/api/cadastro/prestador',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'      => 'Carlos Eletricista',
                'email'     => 'carlos.eletricista@teste.com',
                'profissao' => $idProfissao,
                'cep'       => '78280000',
                'senha'     => 'securepassword',
            ])
        );

        self::assertResponseIsSuccessful();
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertTrue($conteudo['success']);
    }

    public function testCadastroPrestadorPersisteDadosNoBanco(): void
    {
        $idProfissao = $this->buscarIdProfissao('Encanador');

        $this->client->request(
            'POST',
            '/api/cadastro/prestador',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'      => 'Pedro Encanador',
                'email'     => 'pedro.encanador@teste.com',
                'profissao' => $idProfissao,
                'cep'       => '78280000',
                'senha'     => 'securepassword',
            ])
        );

        self::assertResponseIsSuccessful();

        $usuario = $this->entityManager->getRepository(Usuario::class)
            ->findOneBy(['email' => 'pedro.encanador@teste.com']);

        self::assertNotNull($usuario);
        self::assertEquals('Pedro Encanador', $usuario->getNome());

        $prestador = $this->entityManager->getRepository(Prestador::class)->find($usuario->getId());
        self::assertNotNull($prestador, 'Entidade Prestador deve ser criada.');
    }

    public function testCadastroPrestadorAssociaProfissao(): void
    {
        $idProfissao = $this->buscarIdProfissao('Pintor');

        $this->client->request(
            'POST',
            '/api/cadastro/prestador',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'      => 'Ana Pintora',
                'email'     => 'ana.pintora@teste.com',
                'profissao' => $idProfissao,
                'cep'       => '78280000',
                'senha'     => 'securepassword',
            ])
        );

        self::assertResponseIsSuccessful();

        $usuario   = $this->entityManager->getRepository(Usuario::class)->findOneBy(['email' => 'ana.pintora@teste.com']);
        $prestador = $this->entityManager->getRepository(Prestador::class)->find($usuario->getId());

        self::assertNotEmpty($prestador->getProfissoes());
        $descricoes = array_map(fn(Profissao $p) => $p->getDescricao(), $prestador->getProfissoes()->toArray());
        self::assertContains('Pintor', $descricoes);
    }

    public function testRetorna409AoCadastrarPrestadorComEmailDuplicado(): void
    {
        $idProfissao = $this->buscarIdProfissao('Eletricista');

        $this->client->request(
            'POST',
            '/api/cadastro/prestador',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'      => 'Duplicado',
                'email'     => 'joaoaugusto@exemplo.com',
                'profissao' => $idProfissao,
                'cep'       => '78280000',
                'senha'     => 'securepassword',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_CONFLICT);
    }

    public function testRetorna400ParaProfissaoInexistente(): void
    {
        $this->client->request(
            'POST',
            '/api/cadastro/prestador',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'      => 'Sem Profissao',
                'email'     => 'semprofissao@teste.com',
                'profissao' => 999999,
                'cep'       => '78280000',
                'senha'     => 'securepassword',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertArrayHasKey('errors', $conteudo);
        self::assertArrayHasKey('profissao', $conteudo['errors']);
    }

    public function testRetorna400ParaCepInvalido(): void
    {
        $idProfissao = $this->buscarIdProfissao('Eletricista');

        $this->client->request(
            'POST',
            '/api/cadastro/prestador',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'      => 'Cep Invalido',
                'email'     => 'cepinvalido@teste.com',
                'profissao' => $idProfissao,
                'cep'       => '00000000',
                'senha'     => 'securepassword',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
        $conteudo = json_decode($this->client->getResponse()->getContent(), true);
        self::assertArrayHasKey('errors', $conteudo);
        self::assertArrayHasKey('cep', $conteudo['errors']);
    }

    public function testRetorna422ParaCepComMenosDe8Digitos(): void
    {
        $idProfissao = $this->buscarIdProfissao('Eletricista');

        $this->client->request(
            'POST',
            '/api/cadastro/prestador',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'      => 'Cep Curto',
                'email'     => 'cepcurto@teste.com',
                'profissao' => $idProfissao,
                'cep'       => '1234567',
                'senha'     => 'securepassword',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testRetorna422ParaCepComCaracteresNaoNumericos(): void
    {
        $idProfissao = $this->buscarIdProfissao('Eletricista');

        $this->client->request(
            'POST',
            '/api/cadastro/prestador',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'      => 'Cep Letras',
                'email'     => 'cepletras@teste.com',
                'profissao' => $idProfissao,
                'cep'       => 'ABCD1234',
                'senha'     => 'securepassword',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testRetorna422ParaNomePrestadorMenorQue3Caracteres(): void
    {
        $idProfissao = $this->buscarIdProfissao('Eletricista');

        $this->client->request(
            'POST',
            '/api/cadastro/prestador',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'      => 'AB',
                'email'     => 'nomecurto@teste.com',
                'profissao' => $idProfissao,
                'cep'       => '78280000',
                'senha'     => 'securepassword',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testRetorna422ParaEmailPrestadorInvalido(): void
    {
        $idProfissao = $this->buscarIdProfissao('Eletricista');

        $this->client->request(
            'POST',
            '/api/cadastro/prestador',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'nome'      => 'Email Invalido',
                'email'     => 'nao-e-um-email',
                'profissao' => $idProfissao,
                'cep'       => '78280000',
                'senha'     => 'securepassword',
            ])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testRetorna422ParaPayloadPrestadorVazio(): void
    {
        $this->client->request(
            'POST',
            '/api/cadastro/prestador',
            [], [], ['CONTENT_TYPE' => 'application/json'],
            json_encode([])
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}
