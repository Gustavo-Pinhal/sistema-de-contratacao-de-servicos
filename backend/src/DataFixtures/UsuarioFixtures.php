<?php

namespace App\DataFixtures;

use App\Dto\Cadastro\CadastrarClienteInputDto;
use App\Dto\Cadastro\CadastrarPrestadorInputDto;
use App\Entity\Servico\Profissao;
use App\Factory\Auth\UsuarioFactory;
use App\Factory\Servico\ClienteFactory;
use App\Factory\Servico\PrestadorFactory;
use App\Service\Localizacao\CepService;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UsuarioFixtures extends Fixture implements DependentFixtureInterface
{
    public function __construct(
        private UsuarioFactory $usuarioFactory,
        private PrestadorFactory $prestadorFactory,
        private ClienteFactory $clienteFactory,
        private CepService $cepService,
        private UserPasswordHasherInterface $hasher
    ) {}

    public function load(ObjectManager $manager): void
    {
        $admin = $this->usuarioFactory->criar(
            'admin@teste.com',
            'Admin de Teste',
            '123456',
            ['ROLE_ADMIN'],
        );
        $this->addReference('user-admin', $admin);
        $manager->persist($admin);

        $cep = $this->cepService->buscarOuCadastrar('78280000');

        $profissaoEletrista = $this->getReference('profissão Eletricista', Profissao::class);
        $prestadorComum = $this->prestadorFactory->criar(
            new CadastrarPrestadorInputDto(
                'Prestador Comum',
                'prestcomum@exemplo.com',
                $profissaoEletrista->getId(),
                '78280000',
                '123456',
            ),
            $cep,
        );
        $manager->persist($prestadorComum->getUsuario());
        $manager->persist($prestadorComum);

        $prestadorPremium = $this->prestadorFactory->criar(
            new CadastrarPrestadorInputDto(
                'Prestador Premium',
                'prestprem@exemplo.com',
                $profissaoEletrista->getId(),
                '78280000',
                '123456',
            ),
            $cep,
        );
        $prestadorPremium->getUsuario()->setRoles(['PRESTADOR', 'PREMIUM']);
        $manager->persist($prestadorPremium->getUsuario());
        $manager->persist($prestadorPremium);

        $cliente = $this->clienteFactory->criar(new CadastrarClienteInputDto(
            'Usuário Cliente',
            'cliente@exemplo.com',
            '11999999999',
            '123456',
        ),);
        $manager->persist($cliente->getUsuario());
        $manager->persist($cliente);

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            ProfissaoFixtures::class,
        ];
    }
}
