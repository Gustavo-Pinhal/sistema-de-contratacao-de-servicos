<?php

namespace App\Controller;

use App\Dto\Output\Portifolio\PortifolioDto;
use App\Repository\Portifolio\PortifolioRepository;
use App\Repository\Servico\PrestadorRepository;
use App\Service\PerfilMediaService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/prestadores')]
final class PerfilPublicoController extends AbstractController
{
    #[Route('/{id}/perfil', methods: ['GET'], name: 'app_prestadores_perfil_publico')]
    public function perfil(
        string $id,
        PrestadorRepository $prestadorRepository,
        PortifolioRepository $portifolioRepository,
        PerfilMediaService $mediaService,
    ): JsonResponse {
        $prestador = $prestadorRepository->find($id);

        if (!$prestador) {
            return $this->json(['message' => 'Prestador não encontrado.'], 404);
        }

        $usuario = $prestador->getUsuario();

        $profissoes = $prestador->getProfissoes()->map(
            fn($p) => ['id' => $p->getId(), 'descricao' => $p->getDescricao()]
        )->toArray();

        $portifolio = $portifolioRepository->find($id);
        $portifolioData = $portifolio ? PortifolioDto::fromEntity($portifolio) : null;

        return $this->json([
            'id'           => (string) $usuario->getId(),
            'nome'         => $prestador->getNome(),
            'urlPerfil'    => $mediaService->obterUrlFotoPerfil($usuario),
            'profissoes'   => $profissoes,
            'portifolio'   => $portifolioData,
        ], context: ['json_encode_options' => JSON_UNESCAPED_SLASHES]);
    }
}
