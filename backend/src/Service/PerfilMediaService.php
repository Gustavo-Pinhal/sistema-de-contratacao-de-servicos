<?php

namespace App\Service;

use App\Entity\Auth\Usuario;
use Aws\S3\S3Client;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class PerfilMediaService
{
    public function __construct(
        private S3Client $s3Client,
        private string $publicBucket,
        private string $publicHost,
    ) {}

    /** @return array{path: string, mimeType: string, size: int} */
    public function uploadFotoPerfil(UploadedFile $arquivo, Usuario $usuario): array
    {
        $mimeType = $arquivo->getMimeType();
        $tamanho = $arquivo->getSize();
        $extensao = $arquivo->guessExtension() ?? $arquivo->getClientOriginalExtension();

        $nomeArquivo = sprintf('perfis/%s.%s', $usuario->getId()->toString(), $extensao);

        $this->s3Client->putObject([
            'Bucket'      => $this->publicBucket,
            'Key'         => $nomeArquivo,
            'Body'        => fopen($arquivo->getPathname(), 'r'),
            'ContentType' => $mimeType,
            'ACL' => 'public-read',
        ]);

        return [
            'path'     => $nomeArquivo,
            'mimeType' => $mimeType,
            'size'     => $tamanho
        ];
    }

    public function obterUrlFotoPerfil(Usuario $usuario): string
    {
        $perfil = $usuario->getPerfil();

        if (!$perfil || !$perfil->getCaminho()) {
            return '';
        }

        $publicHost = $this->publicHost  ?? null;

        if ($publicHost) {
            return rtrim($publicHost, '/') . '/' . ltrim($perfil->getCaminho(), '/');
        }

        return $this->s3Client->getObjectUrl($this->publicBucket, $perfil->getCaminho());
    }
}
