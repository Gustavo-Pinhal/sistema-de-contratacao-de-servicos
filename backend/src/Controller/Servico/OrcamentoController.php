<?php

namespace App\Controller\Servico;

use App\Dto\Request\Servico\OrcamentoInputDto;
use App\Entity\Servico\Servico;
use App\Factory\Servico\OrcamentoFactory;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Auth\Usuario;

#[Route('/servico/{servico}/orcamento')]
final class OrcamentoController extends AbstractController
{
    #[Route('', methods: ['POST'], name: 'app_servico_orcamento_criar')]
    public function criar(
        Servico $servico,
        #[MapRequestPayload] OrcamentoInputDto $dto,
        OrcamentoFactory $factory,
        EntityManagerInterface $manager,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        if (!$usuario->getId()->equals($servico->getPrestador()->getId())) {
            return $this->json(['error' => 'Acesso negado'], Response::HTTP_FORBIDDEN);
        }

        $manager->persist($factory->fromDto($dto, $servico));
        $manager->flush();

        return $this->json(['success' => true]);
    }
}
