<?php

namespace App\DataFixtures;

use App\DataFixtures\ProfissaoFixtures;
use App\Dto\Cadastro\CadastrarPrestadorInputDto;
use App\Entity\Servico\Profissao;
use App\Factory\Servico\PrestadorFactory;
use App\Service\Localizacao\CepService;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class PrestadoresFixtures extends Fixture implements DependentFixtureInterface
{
    public function __construct(
        private PrestadorFactory $factory,
        private CepService $cepService,
    ) {}

    public function load(ObjectManager $manager): void
    {
        // Guardamos apenas os dados necessários para a criação
        $prestadoresData = [
            ['João Augusto', 'joaoaugusto@exemplo.com', 'Eletricista', '78280000'],
            ['Maicon Do Grau', 'maicon@exemplo.com', 'Eletricista', '78285000'],
            ['Bruno Santos', 'bruno@exemplo.com', 'Pintor', '78280000'],
            ['Carlos Henrique', 'carlos.henrique@exemplo.com', 'Encanador', '78280000'],
            ['Ricardo Alves', 'ricardo.alves@exemplo.com', 'Pedreiro', '78280000'],
            ['Fernando Lima', 'fernando.lima@exemplo.com', 'Marceneiro', '78280000'],
            ['Juliano Costa', 'juliano.costa@exemplo.com', 'Jardineiro', '78280000'],
            ['Patrícia Souza', 'patricia.souza@exemplo.com', 'Diarista', '78280000'],
            ['Vanessa Martins', 'vanessa.martins@exemplo.com', 'Pintor', '78280000'],
            ['Eduardo Ferreira', 'eduardo.ferreira@exemplo.com', 'Técnico de Ar Condicionado', '78280000'],
            ['Roberto Nunes', 'roberto.nunes@exemplo.com', 'Chaveiro', '78280000'],
            ['Lucas Mendes', 'lucas.mendes@exemplo.com', 'Eletricista', '78280000'],
            ['André Oliveira', 'andre.oliveira@exemplo.com', 'Encanador', '78280000'],
            ['Gabriel Rocha', 'gabriel.rocha@exemplo.com', 'Pedreiro', '78280000'],
            ['Camila Barbosa', 'camila.barbosa@exemplo.com', 'Diarista', '78280000'],
        ];

        foreach ($prestadoresData as $data) {
            // Buscamos a referência DENTRO do loop para evitar erros de inicialização
            $profissao = $this->getReference('profissão ' . $data[2], Profissao::class);
            $cep = $this->cepService->buscarOuCadastrar($data[3]);

            $prestador = $this->factory->criar(
                new CadastrarPrestadorInputDto(
                    nome: $data[0],
                    email: $data[1],
                    profissao: $profissao->getId(),
                    cep: $data[3],
                    senha: '123456',
                ),
                $profissao,
                $cep,
            );

            // IMPORTANTE: Persistir o Usuario primeiro (se não houver cascade no XML)
            $manager->persist($prestador->getUsuario());
            $manager->persist($prestador);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            ProfissaoFixtures::class,
        ];
    }
}
