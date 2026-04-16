<?php

namespace App\Command;

use Aws\S3\S3Client;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'app:storage:setup', description: 'Cria os buckets necessários no SeaweedFS')]
class StorageSetupCommand extends Command
{
    private S3Client $s3Client;
    private array $buckets;

    public function __construct(S3Client $s3Client, string $publicBucket, string $privateBucket)
    {
        parent::__construct();
        $this->s3Client = $s3Client;
        $this->buckets = [$publicBucket, $privateBucket];
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        foreach ($this->buckets as $bucket) {
            try {
                if (!$this->s3Client->doesBucketExist($bucket)) {
                    $this->s3Client->createBucket(['Bucket' => $bucket]);
                    $io->success("Bucket '$bucket' criado com sucesso!");
                } else {
                    $io->info("Bucket '$bucket' já existe.");
                }
            } catch (\Exception $e) {
                $io->error("Erro ao criar bucket '$bucket': " . $e->getMessage());
                return Command::FAILURE;
            }
        }

        return Command::SUCCESS;
    }
}