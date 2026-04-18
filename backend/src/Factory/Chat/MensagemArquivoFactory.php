<?php

namespace App\Factory\Chat;

use App\Entity\Auth\Usuario;
use App\Entity\Chat\Arquivo;
use App\Entity\Chat\Mensagem;
use App\Entity\Chat\Sala;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class MensagemArquivoFactory
{
    public function create(
        UploadedFile $file,
        Sala $sala,
        Usuario $usuario
    ): Mensagem {
        $mensagem = new Mensagem();
        $mensagem->setUsuario($usuario);
        $mensagem->setSala($sala);

        $arquivo = new Arquivo();
        $arquivo->setMensagem($mensagem);
        $arquivo->setMimeType($file->getMimeType());
        $arquivo->setTamanho($file->getSize());
        
        $mensagem->setArquivo($arquivo);

        $mensagem->setConteudo([
            'tipo' => $this->determineType($file->getMimeType()),
            'original_name' => $file->getClientOriginalName()
        ]);

        return $mensagem;
    }

    private function determineType(string $mimeType): string
    {
        return match (true) {
            str_contains($mimeType, 'audio') => 'audio',
            str_contains($mimeType, 'video') => 'video',
            str_contains($mimeType, 'image') => 'foto',
            default                          => 'arquivo',
        };
    }
}