<?php

namespace App\Mapper\Chat;

use App\Dto\Output\Chat\MensagemDto;
use App\Entity\Chat\Mensagem;
use App\Service\ChatMediaService;

class MensagemOutputMapper
{
    public function __construct(
        private ChatMediaService $mediaService
    ) {}

    public function toDto(Mensagem $mensagem): MensagemDto
    {
        $conteudo = $mensagem->getConteudo();
        $tipo = $conteudo['tipo'] ?? 'texto';

        $arquivo = null;
        if ($mensagem->getArquivo()) {
            $arquivo = [
                'id' => $mensagem->getArquivo(),
                'url' => $this->mediaService->generateSecureUrl($mensagem->getArquivo()->getCaminho()),
                'mime_type' => $mensagem->getArquivo()->getMimeType(),
            ];
        }
        
        $referencia = (string) $mensagem->getRespondeA()?->getId();

        return new MensagemDto(
            id: $mensagem->getId()->toString(),
            enviado_por: $mensagem->getUsuario()->getId(),
            tipo: $tipo,
            texto: $conteudo['texto'] ?? null,
            referencia: $referencia,
            arquivo: $arquivo,
            enviado_em: $mensagem->getEnvioEm()->format('d/m/Y às H:i')
        );
    }

    /** @param Mensagem[] $mensagens */
    public function toCollection(iterable $mensagens): array
    {
        $dtos = [];
        foreach ($mensagens as $m) {
            $dtos[] = $this->toDto($m);
        }
        return $dtos;
    }
}