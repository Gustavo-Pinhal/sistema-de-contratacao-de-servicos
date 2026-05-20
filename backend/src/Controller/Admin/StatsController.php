<?php

namespace App\Controller\Admin;

use App\Repository\Auth\UsuarioRepository;
use App\Repository\Servico\ClienteRepository;
use App\Repository\Servico\OrcamentoRepository;
use App\Repository\Servico\PrestadorRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/stats')]
final class StatsController extends AbstractController
{
    #[Route('', methods: ['GET'], name: 'app_admin_stats')]
    public function index(
        ClienteRepository $clienteRepository,
        PrestadorRepository $prestadorRepository,
        OrcamentoRepository $orcamentoRepository,
        UsuarioRepository $usuarioRepository,
        EntityManagerInterface $em,
    ): JsonResponse {
        $now        = new \DateTimeImmutable();
        $inicioMes  = $now->modify('first day of this month')->setTime(0, 0, 0);
        $inicioMesPassado = $now->modify('first day of last month')->setTime(0, 0, 0);
        $fimMesPassado    = $inicioMes;
        $inicioSemana     = $now->modify('monday this week')->setTime(0, 0, 0);

        $totalClientes    = $clienteRepository->count(['excluidoEm' => null]);
        $totalPrestadores = $prestadorRepository->count(['excluidoEm' => null]);
        $totalOrcamentos  = $orcamentoRepository->count([]);

        $clientesMes = (int) $em->createQuery(
            'SELECT COUNT(c.criadoEm) FROM App\Entity\Servico\Cliente c WHERE c.criadoEm >= :inicio AND c.excluidoEm IS NULL'
        )->setParameter('inicio', $inicioMes)->getSingleScalarResult();

        $clientesMesPassado = (int) $em->createQuery(
            'SELECT COUNT(c.criadoEm) FROM App\Entity\Servico\Cliente c WHERE c.criadoEm >= :inicio AND c.criadoEm < :fim AND c.excluidoEm IS NULL'
        )->setParameter('inicio', $inicioMesPassado)->setParameter('fim', $fimMesPassado)->getSingleScalarResult();

        $clientesPctMes = $clientesMesPassado > 0
            ? round((($clientesMes - $clientesMesPassado) / $clientesMesPassado) * 100)
            : ($clientesMes > 0 ? 100 : 0);

        $prestadoresMes = (int) $em->createQuery(
            'SELECT COUNT(p.criadoEm) FROM App\Entity\Servico\Prestador p WHERE p.criadoEm >= :inicio AND p.excluidoEm IS NULL'
        )->setParameter('inicio', $inicioMes)->getSingleScalarResult();

        $orcamentosSemana = (int) $em->createQuery(
            'SELECT COUNT(o.id) FROM App\Entity\Servico\Orcamento o WHERE o.criadoEm >= :inicio'
        )->setParameter('inicio', $inicioSemana)->getSingleScalarResult();

        $allUsers = $usuarioRepository->findAll();
        $totalEmpresariais = 0;
        $empresariaisMes   = 0;
        foreach ($allUsers as $u) {
            if (in_array('ROLE_EMPRESARIAL', $u->getRoles())) {
                $totalEmpresariais++;
            }
        }

        return $this->json([
            'totalClientes'       => $totalClientes,
            'totalPrestadores'    => $totalPrestadores,
            'totalOrcamentos'     => $totalOrcamentos,
            'totalEmpresariais'   => $totalEmpresariais,
            'clientesPctMes'      => $clientesPctMes,
            'clientesMes'         => $clientesMes,
            'prestadoresMes'      => $prestadoresMes,
            'orcamentosSemana'    => $orcamentosSemana,
        ]);
    }
}
