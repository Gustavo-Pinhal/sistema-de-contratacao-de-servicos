<?php

namespace App\Controller\Admin;

use App\Entity\Portifolio\Portifolio;
use App\Entity\Servico\Prestador;
use App\Mapper\Admin\PrestadorOutputMapper;
use App\Repository\Servico\PrestadorRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin/prestador')]
final class PrestadorController extends AbstractController
{
    #[Route('', methods: ['GET'], name: 'app_admin_prestador')]
    public function index(
        PrestadorRepository $repository,
        PrestadorOutputMapper $mapper,
    ): JsonResponse {
        $prestadores = $repository->findAll();
        return $this->json($mapper->mapCollection($prestadores));
    }

    #[Route('/{id}/promover', methods: ['POST'], name: 'app_admin_prestador_promover')]
    public function concederPremium(
        Prestador $prestador,
        EntityManagerInterface $manager,
    ): JsonResponse {
        $prestador->setAtivo(true);
        $prestador->getUsuario()->setRoles(['ROLE_PRESTADOR', 'ROLE_PREMIUM']);
        if (is_null($prestador->getPortifolio())) {
            $portifolio = new Portifolio($prestador);

            $manager->persist($portifolio);
        }

        $manager->flush();
        return $this->json(['success' => true]);
    }

    #[Route('/{id}/demover', methods: ['POST'], name: 'app_admin_prestador_demover')]
    public function demoverPremium(
        Prestador $prestador,
        EntityManagerInterface $manager,
    ): JsonResponse {
        $prestador->setAtivo(false);
        $prestador->getUsuario()->setRoles(['ROLE_PRESTADOR']);

        $manager->flush();
        return $this->json(['success' => true]);
    }
}
