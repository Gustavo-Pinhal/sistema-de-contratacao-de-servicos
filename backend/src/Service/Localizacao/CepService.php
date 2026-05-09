<?php

namespace App\Service\Localizacao;

use App\Entity\Localizacao\Cep;
use App\Entity\Localizacao\Municipio;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class CepService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private HttpClientInterface $httpClient
    ) {}

    public function buscarOuCadastrar(string|Cep $numeroCep): ?Cep
    {
        if (is_string($numeroCep)) {
            $numeroCep = preg_replace('/[^0-9]/', '', $numeroCep);
        } else {
            $numeroCep = $numeroCep->getNumero();
        }

        $cep = $this->entityManager->find(Cep::class, $numeroCep);

        if ($cep) {
            return $cep;
        }

        return $this->consultarExternalApi($numeroCep);
    }

    private function consultarExternalApi(string $numeroCep): ?Cep
    {
        try {
            $response = $this->httpClient->request('GET', "https://viacep.com.br/ws/{$numeroCep}/json/");
            $dados = $response->toArray();

            if (isset($dados['erro'])) {
                return null;
            }

            $municipio = $this->obterOuCriarMunicipio($dados);

            $novoCep = new Cep();
            $novoCep->setNumero($dados['cep']);
            $novoCep->setRua($dados['logradouro']);
            $novoCep->setBairro($dados['bairro']);
            $novoCep->setMunicipio($municipio);

            $this->entityManager->persist($novoCep);
            $this->entityManager->flush();

            return $novoCep;
        } catch (\Exception $e) {
            return null;
        }
    }

    private function obterOuCriarMunicipio(array $dados): Municipio
    {
        $repo = $this->entityManager->getRepository(Municipio::class);
        $municipio = $repo->findOneBy(['codigoIbge' => $dados['ibge']]);

        if (!$municipio) {
            $municipio = new Municipio();
            $municipio->setCodigoIbge($dados['ibge']);
            $municipio->setNome($dados['localidade']);
            $municipio->setUf($dados['uf']);

            $this->entityManager->persist($municipio);
        }

        return $municipio;
    }
}
