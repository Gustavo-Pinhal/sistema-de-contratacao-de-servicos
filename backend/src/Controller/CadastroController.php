<?php

namespace App\Controller;

use App\Dto\Cadastro\CadastrarClienteInputDto;
use App\Dto\Cadastro\CadastrarPrestadorInputDto;
use App\Entity\Servico\Profissao;
use App\Exception\UsuarioJaExisteException;
use App\Factory\Servico\ClienteFactory;
use App\Factory\Servico\PrestadorFactory;
use App\Repository\Auth\UsuarioRepository;
use App\Service\Localizacao\CepService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/cadastro')]
final class CadastroController extends AbstractController
{
    public function __construct(
        private UsuarioRepository $usuarioRepository,
        private EntityManagerInterface $manager,
    ) {}

    #[Route('/cliente', methods: ['POST'], name: 'app_cadastro_cliente')]
    public function criarCliente(
        #[MapRequestPayload] CadastrarClienteInputDto $dto,
        ClienteFactory $factory,
    ): JsonResponse {
        $usuarioExistente = $this->usuarioRepository->findOneBy(['email' => $dto->email]);
        if ($usuarioExistente) {
            throw new UsuarioJaExisteException($dto->email);
        }

        $cliente = $factory->criar($dto);

        $this->manager->persist($cliente->getUsuario());
        $this->manager->persist($cliente);
        $this->manager->flush();

        return $this->json(['success' => true]);
    }

    #[Route('/prestador', methods: ['POST'], name: 'app_cadastro_prestador')]
    public function cadastroPrestador(
        #[MapRequestPayload] CadastrarPrestadorInputDto $dto,
        CepService $cepService,
        PrestadorFactory $factory,
    ): JsonResponse {
        $usuarioExistente = $this->usuarioRepository->findOneBy(['email' => $dto->email]);
        if ($usuarioExistente) {
            throw new UsuarioJaExisteException($dto->email);
        }

        $profissao = $this->manager->getRepository(Profissao::class)->find($dto->profissao);
        if (!$profissao) {
            return $this->json([
                'message' => 'Erro de validação',
                'errors' => ['profissao' => 'Profissão inexistente.']
            ], 400);
        }

        $cep = $cepService->buscarOuCadastrar($dto->cep);
        if (!$cep) {
            return $this->json(['message' => 'Erro de validação', 'errors' => ['cep' => 'CEP inválido.']], 400);
        }

        $prestador = $factory->criar($dto, $cep);

        $this->manager->persist($prestador->getUsuario());
        $prestador->setId($prestador->getUsuario()->getId());
        $this->manager->persist($prestador);
        $this->manager->flush();
        $prestador->addProfissao($profissao);
        $this->manager->flush();

        return $this->json(['success' => true]);
    }
}
