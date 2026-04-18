<?php

namespace App\Service;

use App\Entity\Chat\Arquivo;
use Aws\S3\S3Client;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class ChatMediaService
{
    public function __construct(
        private S3Client $s3Client,
        private string $privateBucket,
    ) {}

    public function uploadChatFile(
        UploadedFile $file,
        Arquivo $arquivo,
    ): string {
        $mimeType = $file->getMimeType();

        $idArquivo = $arquivo->getId();
        $extencao = $file->guessExtension() ?? $file->getClientOriginalExtension();

        $nomeArquivo = "chats/{$idArquivo}.{$extencao}";

        $this->s3Client->putObject([
            'Bucket'              => $this->privateBucket,
            'Key'                  => $nomeArquivo,
            'Body'                 => fopen($file->getPathname(), 'r'),
            'ContentType'          => $mimeType,
            'ServerSideEncryption' => 'AES256',
        ]);

        return $nomeArquivo;
    }

    public function generateSecureUrl(string $filePath, string $expiration = '+20 minutes'): string
    {
        $cmd = $this->s3Client->getCommand('GetObject', [
            'Bucket' => $this->privateBucket,
            'Key'    => $filePath,
        ]);

        $request = $this->s3Client->createPresignedRequest($cmd, $expiration);

        return (string) $request->getUri();
    }
}
