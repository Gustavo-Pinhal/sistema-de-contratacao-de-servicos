<?php

namespace App\Mapper\Chat;

use App\Entity\Chat\Mensagem;
use App\Service\ChatMediaService;

class MensagemOutputMapper
{
    public function __construct(
        private ChatMediaService $midiaService
    ) {}

    public function mensagem(Mensagem $mensagem): array
    {
        $conteudo = $mensagem->getConteudo();
        $tipo = $conteudo['tipo'] ?? 'texto';

        $arquivo = null;
        if ($mensagem->getArquivo()) {
            $arquivo = [
                'id' => $mensagem->getArquivo()->getId(),
                'url' => $this->midiaService->generateSecureUrl($mensagem->getArquivo()->getCaminho()),
                'mime_type' => $mensagem->getArquivo()->getMimeType(),
            ];
        }

        $referencia = (string) $mensagem->getResponde()?->getId();

        return [
            'id' => $mensagem->getId()->toString(),
            'enviador_por' => $mensagem->getUsuario()->getId(),
            'tipo' => $tipo,
            'texto' => $conteudo['text'] ?? null,
            'referencia' => $referencia,
            'arquivo' => $arquivo,
            'enviado_em' => $mensagem->getEnvioEm()->format('d/m/Y às H:i'),
        ];
    }

    /**
     *  @param Mensagem[] $mensagens 
     */
    public function mensagens(array $mensagens): array
    {
        return array_map([$this, 'mensagem'], $mensagens);
    }
}
