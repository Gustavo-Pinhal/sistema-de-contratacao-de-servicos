<?php

namespace App\Controller\AreaPrestador;

use App\Entity\Auth\Usuario;
use App\Enum\StatusServico;
use App\Repository\Servico\ServicoRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_PRESTADOR')]
#[Route('/api/areaprestador')]
final class DashboardController extends AbstractController
{
    #[Route('/assinar-premium', methods: ['POST'], name: 'app_area_prestador_assinar_premium')]
    public function assinarPremium(EntityManagerInterface $em): JsonResponse
    {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        $roles = $usuario->getRoles();
        if (!in_array('ROLE_PREMIUM', $roles)) {
            $roles[] = 'ROLE_PREMIUM';
            $usuario->setRoles(array_values(array_unique($roles)));
            $em->flush();
        }
        return $this->json(['success' => true, 'roles' => $usuario->getRoles()]);
    }
    #[Route('/servicos', name: 'app_area_prestador_servicos')]
    public function servicos(
        ServicoRepository $repositorio,
    ): JsonResponse {
        $usuario = $this->getUser();
        $servicos = $repositorio->buscarDashboardPrestador($usuario);
        return $this->json($servicos, context: ['groups' => ['servico_dashboard:read']]);
    }

    #[Route('/dashboard', name: 'app_area_prestador_home')]
    public function index(
        ServicoRepository $repositorio,
    ): JsonResponse {
        $usuario = $this->getUser();
        $servicos = $repositorio->buscarDashboardPrestador($usuario);

        $data = [
            'ativos' => [],
            'pendentes' => [],
            'concluidos' => [],
            'cancelados' => [],
        ];

        foreach ($servicos as $servico) {
            match ($servico->getStatus()) {
                StatusServico::EmDecorrencia => $data['ativos'][] = $servico,
                StatusServico::SolicitacaoDeOrcamento => $data['pendentes'][] = $servico,
                StatusServico::Concluido => $data['concluidos'][] = $servico,
                StatusServico::CanceladoPeloCliente,
                StatusServico::CanceladoPeloPrestador => $data['cancelados'][] = $servico,
                default => null
            };
        }

        return $this->json($data, context: [
            'groups' => ['servico_dashboard:read']
        ]);
    }
}
