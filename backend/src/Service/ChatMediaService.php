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
        $url = (string) $request->getUri();

        $publicHost = $_ENV['STORAGE_PUBLIC_HOST'] ?? null;
        if ($publicHost) {
            $parseInternal = parse_url($_ENV['STORAGE_ENDPOINT']);
            $url = str_replace(
                $parseInternal['host'] . ':' . $parseInternal['port'],
                parse_url($publicHost, PHP_URL_HOST) . ':' . parse_url($publicHost, PHP_URL_PORT),
                $url
            );
        }

        return $url;
    }
}
