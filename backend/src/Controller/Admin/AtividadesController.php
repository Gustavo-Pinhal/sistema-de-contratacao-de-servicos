<?php

namespace App\Controller\Admin;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/atividades')]
final class AtividadesController extends AbstractController
{
    #[Route('', methods: ['GET'], name: 'app_admin_atividades')]
    public function index(EntityManagerInterface $em): JsonResponse
    {
        $atividades = [];

        $clientes = $em->createQuery(
            'SELECT u.nome, c.criadoEm
             FROM App\Entity\Servico\Cliente c
             JOIN c.usuario u
             WHERE c.excluidoEm IS NULL
             ORDER BY c.criadoEm DESC'
        )->setMaxResults(5)->getResult();

        foreach ($clientes as $row) {
            $atividades[] = [
                'tipo'    => 'cliente',
                'usuario' => $row['nome'],
                'acao'    => 'registrou-se como novo',
                'alvo'    => 'Cliente',
                'tempo'   => $row['criadoEm']->format(\DateTimeInterface::ATOM),
            ];
        }

        $prestadores = $em->createQuery(
            'SELECT p.nome, p.criadoEm
             FROM App\Entity\Servico\Prestador p
             WHERE p.excluidoEm IS NULL
             ORDER BY p.criadoEm DESC'
        )->setMaxResults(5)->getResult();

        foreach ($prestadores as $row) {
            $atividades[] = [
                'tipo'    => 'prestador',
                'usuario' => $row['nome'],
                'acao'    => 'registrou-se como novo',
                'alvo'    => 'Prestador de Serviço',
                'tempo'   => $row['criadoEm']->format(\DateTimeInterface::ATOM),
            ];
        }

        $orcamentos = $em->createQuery(
            'SELECT uc.nome, o.descricao, o.criadoEm
             FROM App\Entity\Servico\Orcamento o
             JOIN o.servico s
             JOIN s.cliente uc
             WHERE o.excluidoEm IS NULL
             ORDER BY o.criadoEm DESC'
        )->setMaxResults(5)->getResult();

        foreach ($orcamentos as $row) {
            $atividades[] = [
                'tipo'    => 'orcamento',
                'usuario' => $row['nome'],
                'acao'    => 'criou um novo orçamento para',
                'alvo'    => $row['descricao'],
                'tempo'   => $row['criadoEm']->format(\DateTimeInterface::ATOM),
            ];
        }

        usort($atividades, fn($a, $b) => strcmp($b['tempo'], $a['tempo']));

        return $this->json(array_slice($atividades, 0, 10));
    }
}
