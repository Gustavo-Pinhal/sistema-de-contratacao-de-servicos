<?php

namespace App\Command;

use App\Entity\Auth\Usuario;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-admin',
    description: 'Cria um novo usuário administrador do sistema.',
)]
class CreateAdminCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::OPTIONAL, 'O e-mail do administrador')
            ->addArgument('nome', InputArgument::OPTIONAL, 'O nome do administrador')
            ->addArgument('password', InputArgument::OPTIONAL, 'A senha do administrador')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $email = $input->getArgument('email') ?? $io->ask('Qual o e-mail do novo administrador?', 'admin@sistema.com');
        $nome = $input->getArgument('nome') ?? $io->ask('Qual o nome do novo administrador?', 'Administrador');
        $plainPassword = $input->getArgument('password');

        if (!$plainPassword) {
            $plainPassword = $io->askHidden('Digite a senha do administrador');
        }

        if (!$plainPassword || strlen($plainPassword) < 6) {
            $io->error('A senha deve ter pelo menos 6 caracteres.');
            return Command::FAILURE;
        }

        try {
            $user = new Usuario();
            $user->setEmail($email);
            $user->setRoles(['ROLE_ADMIN']);
            $user->setNome($nome);

            $hashedPassword = $this->passwordHasher->hashPassword($user, $plainPassword);
            $user->setPassword($hashedPassword);

            $this->entityManager->persist($user);
            $this->entityManager->flush();

            $io->success(sprintf('Administrador %s criado com sucesso!', $email));

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('Erro ao criar administrador: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
