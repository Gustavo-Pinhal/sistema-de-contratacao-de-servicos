<?php

namespace App\Service;

use App\Entity\Chat\Arquivo;
use Aws\S3\S3Client;
use GuzzleHttp\Psr7\Uri;
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
        $publicHost = $_ENV['STORAGE_PUBLIC_HOST'] ?? null;

        $cmd = $this->s3Client->getCommand('GetObject', [
            'Bucket' => $this->privateBucket,
            'Key'    => $filePath,
        ]);

        $publicUri = new Uri($publicHost);

        $request = $this->s3Client->createPresignedRequest($cmd, $expiration);

        $newUri = $request->getUri()
            ->withScheme($publicUri->getScheme())
            ->withHost($publicUri->getHost())
            ->withPort($publicUri->getPort());

        if ($publicUri->getPath() !== '') {
            $newUri = $newUri->withPath(rtrim($publicUri->getPath(), '/') . '/' . ltrim($newUri->getPath(), '/'));
        }

        return (string) $newUri;
    }
}
