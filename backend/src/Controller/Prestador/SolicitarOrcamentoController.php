<?php

namespace App\Controller\Prestador;

use App\Dto\Request\Prestador\SolicitarOrcamentoInputDto;
use App\Entity\Chat\Mensagem;
use App\Entity\Chat\Sala;
use App\Entity\Servico\Prestador;
use App\Factory\Servico\ServicoFactory;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
final class SolicitarOrcamentoController extends AbstractController
{
    #[IsGranted('ROLE_CLIENTE')]
    #[Route('/prestadores/{id}/solicitar', methods: ['POST'], name: 'app_prestador_solicitacao_orcamento_criar')]
    public function criar(
        Prestador $prestador,
        #[MapRequestPayload]
        SolicitarOrcamentoInputDto $dto,
        ServicoFactory $factory,
        EntityManagerInterface $manager,
    ): JsonResponse {
        $uCliente = $this->getUser();
        $uPrestador = $prestador->getUsuario();

        $servico = $factory->aPartirDeSolicitacaoOrcamento(
            $dto,
            $uPrestador,
            $uCliente,
        );

        $mensagem = new Mensagem()
            ->setUsuario($uCliente)
            ->setConteudo([
                'tipo' => 'text',
                'text' => $dto->descricao,
            ]);

        $sala = new Sala();
        $sala->setServico($servico)
            ->setCliente($uCliente)
            ->setPrestador($uPrestador)
            ->addMensagem($mensagem);

        $manager->persist($servico);
        $manager->persist($sala);
        $manager->flush();

        return $this->json([
            'success' => true,
            'idServico' => $servico->getId(),
        ]);
    }
}
