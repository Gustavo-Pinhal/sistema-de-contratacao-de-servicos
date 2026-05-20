<?php

namespace App\Controller;

use App\Entity\Auth\Usuario;
use App\Entity\Servico\Servico;
use App\Enum\StatusServico;
use App\Repository\Servico\PrestadorRepository;
use App\Repository\Servico\ServicoRepository;
use App\Service\PerfilMediaService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/servico')]
final class ServicoController extends AbstractController
{
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    #[Route('/{id}', methods: ['GET'], name: 'app_servico_detalhe')]
    public function detalhe(
        string $id,
        ServicoRepository $repositorio,
        PrestadorRepository $prestadorRepositorio,
        PerfilMediaService $mediaService,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();

        $servico = $repositorio->find($id);

        if (!$servico) {
            return $this->json(['message' => 'Serviço não encontrado.'], 404);
        }

        $clienteId = (string) $servico->getCliente()->getId();
        $prestadorUsuario = $servico->getPrestador();
        $prestadorUserId = (string) $prestadorUsuario->getId();
        $usuarioId = (string) $usuario->getId();

        if ($clienteId !== $usuarioId && $prestadorUserId !== $usuarioId) {
            return $this->json(['message' => 'Acesso negado.'], 403);
        }

        $prestadorEntity = $prestadorRepositorio->find($prestadorUsuario->getId());
        $endereco = $servico->getEndereco();

        $descricao = null;
        $sala = $servico->getSala();
        if ($sala) {
            $primeiraMensagem = $sala->getMensagens()->first();
            if ($primeiraMensagem) {
                $conteudo = $primeiraMensagem->getConteudo();
                $descricao = is_array($conteudo) ? ($conteudo['text'] ?? null) : $conteudo;
            }
        }

        $statusLabel = match ($servico->getStatus()) {
            StatusServico::SolicitacaoDeOrcamento => 'Em Orçamento',
            StatusServico::EmDecorrencia          => 'Em Andamento',
            StatusServico::Concluido              => 'Concluído',
            StatusServico::CanceladoPeloCliente,
            StatusServico::CanceladoPeloPrestador => 'Cancelado',
            default                               => 'Desconhecido',
        };

        return $this->json([
            'id'          => (string) $servico->getId(),
            'status'      => $statusLabel,
            'descricao'   => $descricao,
            'endereco'    => $endereco ? $endereco->exibir() : null,
            'inicio'      => $servico->getInicio()->format('d/m/Y'),
            'prestador'   => [
                'id'        => $prestadorUserId,
                'nome'      => $prestadorEntity ? $prestadorEntity->getNome() : $prestadorUsuario->getNome(),
                'urlPerfil' => $mediaService->obterUrlFotoPerfil($prestadorUsuario),
            ],
        ], context: ['json_encode_options' => JSON_UNESCAPED_SLASHES]);
    }
}
