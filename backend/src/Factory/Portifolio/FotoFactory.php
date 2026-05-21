<?php

namespace App\Factory\Portifolio;

use App\Entity\Portifolio\Foto;
use App\Entity\Portifolio\Projeto;
use App\Service\ProjetoMediaService;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Uid\Uuid;

class FotoFactory
{
    public function __construct(
        private ProjetoMediaService $mediaService
    ) {}

    public function criarPreenchendoMidia(UploadedFile $arquivo, Projeto $projeto, int $posicao): Foto
    {
        $idDefinitivo = Uuid::v7();

        $dadosUpload = $this->mediaService->uploadFotoProjeto($arquivo, $projeto->getId(), $idDefinitivo);

        $foto = new Foto();
        $foto->setId($idDefinitivo)
            ->setProjeto($projeto)
            ->setUrlFoto($dadosUpload['caminho']) // Guarda o caminho relativo do banco
            ->setPosicao($posicao);

        return $foto;
    }
}
