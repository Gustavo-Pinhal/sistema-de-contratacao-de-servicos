<?php

namespace App\Service;

use Aws\S3\S3Client;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class PublicMediaService
{
    public function __construct(
        private S3Client $s3Client,
        private string $publicBucket, // Configure no services.yaml
    ) {}

    public function uploadFotoPerfil(UploadedFile $file, string $usuarioId): string
    {
        $ext = $file->guessExtension() ?? 'jpg';
        $path = "perfis/{$usuarioId}.{$ext}";

        $this->s3Client->putObject([
            'Bucket' => $this->publicBucket,
            'Key' => $path,
            'Body' => fopen($file->getPathname(), 'r'),
            'ACL' => 'public-read',
            'ContentType' => $file->getMimeType(),
        ]);


        return $path;
    }

    public function getUrlPublica(string $usuarioId): string
    {
        $publicHost = rtrim($_ENV['STORAGE_PUBLIC_HOST'] ?? '', '/');
        // Por enquanto, assumimos extensão .jpg ou checamos se existe
        return "{$publicHost}/{$this->publicBucket}/perfis/{$usuarioId}.jpg";
    }
}
