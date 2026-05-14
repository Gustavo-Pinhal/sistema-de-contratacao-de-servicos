<?php

namespace App\DataFixtures;

use App\DataFixtures\ProfissaoFixtures;
use App\Dto\Request\CadastroUsuario\CadastrarPrestadorInputDto;
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
            ['João Augusto', 'joaoaugusto@exemplo.com', '99999999999', 'Eletricista', '78280000'],
            ['Maicon Do Grau', 'maicon@exemplo.com', '99999999998', 'Eletricista', '78285000'],
            ['Bruno Santos', 'bruno@exemplo.com', '99999999997', 'Pintor', '78280000'],
            ['Carlos Henrique', 'carlos.henrique@exemplo.com', '99999999991', 'Encanador', '78280000'],
            ['Ricardo Alves', 'ricardo.alves@exemplo.com', '99999999992', 'Pedreiro', '78280000'],
            ['Fernando Lima', 'fernando.lima@exemplo.com', '99999999993', 'Marceneiro', '78280000'],
            ['Juliano Costa', 'juliano.costa@exemplo.com', '99999999994', 'Jardineiro', '78280000'],
            ['Patrícia Souza', 'patricia.souza@exemplo.com', '99999999995', 'Diarista', '78280000'],
            ['Vanessa Martins', 'vanessa.martins@exemplo.com', '99999999996', 'Pintor', '78280000'],
            ['Eduardo Ferreira', 'eduardo.ferreira@exemplo.com', '99999999997', 'Técnico de Ar Condicionado', '78280000'],
            ['Roberto Nunes', 'roberto.nunes@exemplo.com', '99999999998', 'Chaveiro', '78280000'],
            ['Lucas Mendes', 'lucas.mendes@exemplo.com', '99999999989', 'Eletricista', '78280000'],
            ['André Oliveira', 'andre.oliveira@exemplo.com', '99999999988', 'Encanador', '78280000'],
            ['Gabriel Rocha', 'gabriel.rocha@exemplo.com', '99999999987', 'Pedreiro', '78280000'],
            ['Camila Barbosa', 'camila.barbosa@exemplo.com', '99999999986', 'Diarista', '78280000'],
        ];

        foreach ($prestadoresData as $data) {
            // Buscamos a referência DENTRO do loop para evitar erros de inicialização
            $profissao = $this->getReference('profissão ' . $data[3], Profissao::class);
            $cep = $this->cepService->buscarOuCadastrar($data[4]);

            $prestador = $this->factory->criar(
                new CadastrarPrestadorInputDto(
                    nome: $data[0],
                    email: $data[1],
                    telefone: $data[2],
                    profissao: $profissao->getId(),
                    cep: $data[4],
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
