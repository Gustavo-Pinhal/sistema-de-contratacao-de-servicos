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
    name: 'app:create-user',
    description: 'Cria um novo usuário no banco de dados através de um prompt interativo.',
)]
class CreateUserCommand extends Command
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
            ->addArgument('email', InputArgument::OPTIONAL, 'O e-mail do usuário')
            ->addArgument('password', InputArgument::OPTIONAL, 'A senha do usuário (será criptografada)')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $email = $input->getArgument('email');
        if (!$email) {
            $email = $io->ask('Qual o e-mail do novo usuário?', null, function ($answer) {
                if (!filter_var($answer, FILTER_VALIDATE_EMAIL)) {
                    throw new \RuntimeException('E-mail inválido.');
                }
                return $answer;
            });
        }

        $plainPassword = $input->getArgument('password');
        if (!$plainPassword) {
            $plainPassword = $io->askHidden('Digite a senha do usuário');
            
            if (strlen($plainPassword) < 6) {
                $io->error('A senha deve ter pelo menos 6 caracteres.');
                return Command::FAILURE;
            }
        }

        try {
            $user = new Usuario();
            $user->setEmail($email);
            $user->setRoles(['ROLE_USER']);

            $hashedPassword = $this->passwordHasher->hashPassword($user, $plainPassword);
            $user->setPassword($hashedPassword);

            $this->entityManager->persist($user);
            $this->entityManager->flush();

            $io->success(sprintf('Usuário %s criado com sucesso! ID: %s', $email, $user->getId()));
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('Erro ao criar usuário: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}