<?php

namespace App\Controller\AreaPrestador;

use App\Enum\StatusServico;
use App\Mapper\Servico\ServicosOutputMapper;
use App\Repository\Notificacao\NotificacaoRepository;
use App\Repository\Servico\ServicoRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use App\Entity\Auth\Usuario;
use App\Entity\Empresarial\Empresa;
use App\Entity\Empresarial\EmpresaPrestador;
use App\Entity\Notificacao\Notificacao;
use App\Entity\Portifolio\Portifolio;
use App\Entity\Servico\Prestador;
use App\Mapper\AreaPrestador\NotificacaoOutputMapper;
use Doctrine\ORM\EntityManagerInterface;

#[IsGranted('ROLE_PRESTADOR')]
#[Route('/areaprestador')]
final class DashboardController extends AbstractController
{
    #[Route('/dashboard', name: 'app_area_prestador_home')]
    public function index(
        ServicoRepository $repositorio,
        ServicosOutputMapper $mapper,
        EntityManagerInterface $manager,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        $servicos = $repositorio->buscarDashboardPrestador($usuario);

        $ativos = [];
        $pendentes = [];
        $concluidos = [];
        $cancelados = [];

        foreach ($servicos as $servico) {
            $status = $servico->getStatus();
            if ($status === StatusServico::Expirado) {
                continue;
            }
            match ($status) {
                StatusServico::EmDecorrencia => $ativos[] = $servico,
                StatusServico::SolicitacaoDeOrcamento => $pendentes[] = $servico,
                StatusServico::Concluido => $concluidos[] = $servico,
                StatusServico::CanceladoPeloCliente,
                StatusServico::CanceladoPeloPrestador => $cancelados[] = $servico,
                default => null,
            };
        }

        /** @var EmpresaPrestador $relacao */
        $relacao = $manager->getRepository(EmpresaPrestador::class)->find($usuario->getId());
        return $this->json([
            'filiado' => !is_null($relacao) ? [
                'id' => $relacao->getEmpresa()->getId(),
                'nome' => $relacao->getEmpresa()->getUsuario()->getNome(),
            ] : null,
            'ativos' => $mapper->mapCollection($ativos, ['completo' => true]),
            'pendentes' => $mapper->mapCollection($pendentes, ['completo' => true]),
            'concluidos' => $mapper->mapCollection($concluidos, ['completo' => true]),
            'cancelados' => $mapper->mapCollection($cancelados, ['completo' => true]),
        ]);
    }

    #[Route('/notificacoes', methods: ['GET'], name: 'app_area_prestador_notificacoes')]
    public function notificacoes(
        NotificacaoRepository $repositorio,
        NotificacaoOutputMapper $mapper,
    ): JsonResponse {
        /** @var Usuario $usuario; */
        $usuario = $this->getUser();

        $notificacoes = $repositorio->findTodasPorUsuario($usuario);
        return $this->json($mapper->mapCollection($notificacoes));
    }


    #[Route('/{id}/visualizar', methods: ['POST'], name: 'app_area_prestador_visualizar')]
    public function visualizar(
        Notificacao $notificacao,
        EntityManagerInterface $manager,
    ): JsonResponse {
        $notificacao->markAsViewed();
        $manager->flush();
        return $this->json(['success' => true]);
    }

    #[Route('/convite/{id}/aceitar', methods: ['POST'], name: 'app_area_prestador_convite')]
    public function aceitarConvite(
        Notificacao $convite,
        EntityManagerInterface $manager,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();

        $empresa = $manager->getRepository(Empresa::class)->find($convite->getSender());
        /** @var Prestador $prestador */
        $prestador = $manager->getRepository(Prestador::class)->find($usuario->getId());

        $relacao = new EmpresaPrestador($empresa, $usuario->getId());
        $prestador->getUsuario()->setRoles(['ROLE_PRESTADOR', 'ROLE_PREMIUM']);
        $prestador->setAtivo(true);
        if (is_null($prestador->getPortifolio())) {
            $portifolio = new Portifolio($prestador);

            $manager->persist($portifolio);
        }

        $manager->persist($relacao);
        $convite->softDelete();
        $manager->flush();

        return $this->json(['success' => true]);
    }

    #[Route('/convite/{id}/declinar', methods: ['POST'], name: 'app_area_prestador_declinar')]
    public function declinarConvite(
        Notificacao $convite,
        EntityManagerInterface $manager,
    ): JsonResponse {
        $convite->softDelete();
        $manager->flush();

        return $this->json(['success' => true]);
    }
}
