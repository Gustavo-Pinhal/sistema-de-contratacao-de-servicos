<?php

namespace App\Service;

use App\Entity\Chat\Sala;
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
        Sala $sala,
    ): string {
        $mimeType = $file->getMimeType();

        $typeDir = $this->determineDirectoryByMimeType($mimeType);

        $safeFilename = bin2hex(random_bytes(16));
        $extension = $file->guessExtension() ?? $file->getClientOriginalExtension();

        $fileName = sprintf(
            'chats/%s/%s/%s.%s',
            $sala->getId(),
            $typeDir,
            $safeFilename,
            $extension
        );

        $this->s3Client->putObject([
            'Bucket'              => $this->privateBucket,
            'Key'                  => $fileName,
            'Body'                 => fopen($file->getPathname(), 'r'),
            'ContentType'          => $mimeType,
            'ServerSideEncryption' => 'AES256',
        ]);

        return $fileName;
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

    private function determineDirectoryByMimeType(string $mimeType): string
    {
        return match (true) {
            str_contains($mimeType, 'image') => 'imagens',
            str_contains($mimeType, 'video') => 'videos',
            str_contains($mimeType, 'audio') => 'audios',
            default                          => 'others',
        };
    }
}
