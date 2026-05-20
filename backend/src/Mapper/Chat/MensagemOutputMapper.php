<?php

namespace App\Mapper\Chat;

use App\Entity\Chat\Mensagem;
use App\Mapper\AbstractMapper;

class MensagemOutputMapper extends AbstractMapper
{
    /** @param Mensagem $mensagem; */
    public function map(mixed $mensagem, array $options = []): array
    {
        $conteudo = $mensagem->getConteudo();
        $tipo = $conteudo['tipo'] ?? 'texto';

        $arquivo = null;
        if ($mensagem->getArquivo()) {
            $arquivo = [
                'id' => $mensagem->getArquivo()->getId()->toString(),
                'mime_type' => $mensagem->getArquivo()->getMimeType(),
            ];
        }

        $referencia = (string) $mensagem->getResponde()?->getId();

        return [
            'id' => $mensagem->getId()->toString(),
            'enviadorPor' => $mensagem->getUsuario()->getId(),
            'tipo' => $tipo,
            'texto' => $conteudo['text'] ?? $conteudo['texto'] ?? null,
            'referencia' => $referencia,
            'arquivo' => $arquivo,
            'enviadoEm' => $mensagem->getEnvioEm()->format('d/m/Y às H:i'),
        ];
    }
}
