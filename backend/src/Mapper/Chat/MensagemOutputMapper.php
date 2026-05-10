<?php

namespace App\Mapper\Chat;

use App\Dto\Response\Chat\MensagemOutputDto;
use App\Entity\Chat\Mensagem;
use App\Service\ChatMediaService;

class MensagemOutputMapper
{
    public function __construct(
        private ChatMediaService $midiaService
    ) {}

    public function paraDto(Mensagem $mensagem): MensagemOutputDto
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

        return new MensagemOutputDto(
            id: $mensagem->getId()->toString(),
            enviado_por: $mensagem->getUsuario()->getId(),
            tipo: $tipo,
            texto: $conteudo['texto'] ?? null,
            referencia: $referencia,
            arquivo: $arquivo,
            enviado_em: $mensagem->getEnvioEm()->format('d/m/Y às H:i')
        );
    }

    /**
     *  @param Mensagem[] $mensagens 
     *  @return MensagemOutputDto[]
     */
    public function paraCollection(iterable $mensagens): array
    {
        $dtos = [];
        foreach ($mensagens as $mensagem) {
            $dtos[] = $this->paraDto($mensagem);
        }
        return $dtos;
    }
}
