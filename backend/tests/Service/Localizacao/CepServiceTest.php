<?php

namespace App\Tests\Service\Localizacao;

use App\Entity\Localizacao\Cep;
use App\Entity\Localizacao\Municipio;
use App\Repository\Localizacao\MunicipioRepository;
use App\Service\Localizacao\CepService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class CepServiceTest extends TestCase
{
    private mixed $entityManager;
    private mixed $httpClient;
    private CepService $service;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->httpClient = $this->createMock(HttpClientInterface::class);

        $this->service = new CepService($this->entityManager, $this->httpClient);
    }

    public function testDeveRetornarCepSeExistirNoBanco(): void
    {
        $cepExistente = new Cep();
        $cepExistente->setNumero('78280000');

        $this->entityManager->expects($this->once())
            ->method('find')
            ->with(Cep::class, '78280000')
            ->willReturn($cepExistente);

        $this->httpClient->expects($this->never())->method('request');

        $resultado = $this->service->buscarOuCadastrar('78280-000');

        $this->assertSame($cepExistente, $resultado);
    }

    public function testDeveRetornarCepSeExistirNoBancoRecebendoEntidade(): void
    {
        $cep = new Cep();
        $cep->setNumero('78280000');

        $this->entityManager->expects($this->once())
            ->method('find')
            ->with(Cep::class, '78280000')
            ->willReturn($cep);

        $this->httpClient->expects($this->never())->method('request');

        $resultado = $this->service->buscarOuCadastrar($cep);

        $this->assertSame($cep, $resultado);
    }

    public function testDeveBuscarNaApiESalvarSeNaoExistirNoBanco(): void
    {
        $this->entityManager->method('find')->willReturn(null);

        $response = $this->createMock(ResponseInterface::class);
        $response->method('toArray')->willReturn([
            'cep' => '78280-000',
            'logradouro' => 'Rua Teste',
            'bairro' => 'Centro',
            'localidade' => 'Mirassol',
            'uf' => 'MT',
            'ibge' => '5105622'
        ]);

        $this->httpClient->expects($this->once())
            ->method('request')
            ->willReturn($response);

        $municipio = new Municipio();
        $repo = $this->createMock(MunicipioRepository::class);
        $repo->method('findOneBy')->willReturn($municipio);

        $this->entityManager->method('getRepository')->willReturn($repo);

        $this->entityManager->expects($this->once())->method('persist');
        $this->entityManager->expects($this->once())->method('flush');

        $resultado = $this->service->buscarOuCadastrar('78280000');

        $this->assertInstanceOf(Cep::class, $resultado);
        $this->assertEquals('78280000', $resultado->getNumero());
    }

    public function testDeveRetornarNullSeApiDerErro(): void
    {
        $this->entityManager->method('find')->willReturn(null);

        $response = $this->createMock(ResponseInterface::class);
        $response->method('toArray')->willReturn(['erro' => true]);

        $this->httpClient->method('request')->willReturn($response);

        $resultado = $this->service->buscarOuCadastrar('00000000');

        $this->assertNull($resultado);
    }
}
