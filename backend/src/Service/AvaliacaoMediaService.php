<?php

namespace App\Service;

use App\Entity\Avaliacao\Avaliacao;
use App\Entity\Avaliacao\Imagem;
use Aws\S3\S3Client;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class AvaliacaoMediaService
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

    public function uploadFotoAvaliacao(UploadedFile $arquivo, Avaliacao $avaliacao): Imagem
    {
        $mimeType = $arquivo->getMimeType();
        if (!in_array($mimeType, self::MIME_TYPES_FOTOS, true)) {
            throw new \InvalidArgumentException('O arquivo enviado não é uma foto válida (Apenas JPEG, PNG, WEBP e HEIC são permitidos).');
        }

        $tamanho = $arquivo->getSize();
        $extensao = $arquivo->guessExtension() ?? $arquivo->getClientOriginalExtension();

        $imagem = new Imagem();
        $imagem->setAvaliacao($avaliacao)
            ->setMimeType($mimeType)
            ->setTamanho($tamanho);

        $idServico = $avaliacao->getServico()->getId();
        $idImagem = $imagem->getId();

        $nomeArquivo = sprintf('avaliacoes/%s/%s.%s', $idServico, $idImagem, $extensao);
        $imagem->setCaminho($nomeArquivo);

        $this->s3Client->putObject([
            'Bucket'      => $this->publicBucket,
            'Key'         => $nomeArquivo,
            'Body'        => fopen($arquivo->getPathname(), 'r'),
            'ContentType' => $mimeType,
            'ACL'         => 'public-read',
        ]);

        return  $imagem;
    }

    public function obterUrlFoto(Imagem $imagem): string
    {
        $caminho = $imagem->getCaminho();

        if ($this->publicHost) {
            return rtrim($this->publicHost, '/') . '/' . $this->publicBucket . '/' . ltrim($caminho, '/');
        }

        return $this->s3Client->getObjectUrl($this->publicBucket, $caminho);
    }
}
