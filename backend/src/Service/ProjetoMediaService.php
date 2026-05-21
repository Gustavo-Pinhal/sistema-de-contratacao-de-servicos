<?php

namespace App\Service;

use Aws\S3\S3Client;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Uid\Uuid;

class ProjetoMediaService
{
    private const MIME_TYPES_FOTOS = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/heic'
    ];

    public function __construct(
        private S3Client $s3Client,
        private string $publicBucket,
        private string $publicHost,
    ) {}

    /** * @return array{caminho: string, url: string} 
     */
    public function uploadFotoProjeto(UploadedFile $arquivo, Uuid $idProjeto): array
    {
        $mimeType = $arquivo->getMimeType();
        if (!in_array($mimeType, self::MIME_TYPES_FOTOS, true)) {
            throw new \InvalidArgumentException('Arquivo inválido. Apenas fotos JPEG, PNG, WEBP e HEIC são permitidas.');
        }

        $extensao = $arquivo->guessExtension() ?? $arquivo->getClientOriginalExtension();
        $idFoto = Uuid::v7()->toString();

        $caminhoArquivo = sprintf('portifolio/projetos/%s/%s.%s', $idProjeto->toString(), $idFoto, $extensao);

        $this->s3Client->putObject([
            'Bucket'      => $this->publicBucket,
            'Key'         => $caminhoArquivo,
            'Body'        => fopen($arquivo->getPathname(), 'r'),
            'ContentType' => $mimeType,
            'ACL'         => 'public-read',
        ]);

        return [
            'caminho' => $caminhoArquivo,
            'url'     => $this->gerarUrlPublica($caminhoArquivo)
        ];
    }

    public function gerarUrlPublica(string $caminho): string
    {
        if ($this->publicHost) {
            return rtrim($this->publicHost, '/') . '/' . $this->publicBucket . '/' . ltrim($caminho, '/');
        }

        return $this->s3Client->getObjectUrl($this->publicBucket, $caminho);
    }

    public function deletarFotoProjeto(string $caminho): void
    {
        $this->s3Client->deleteObject([
            'Bucket' => $this->publicBucket,
            'Key'    => $caminho,
        ]);
    }
}
