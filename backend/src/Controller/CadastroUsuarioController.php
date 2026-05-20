<?php

namespace App\Controller;

use App\Dto\Request\CadastroUsuario\CadastrarClienteInputDto;
use App\Dto\Request\CadastroUsuario\CadastrarPrestadorInputDto;
use App\Entity\Servico\Profissao;
use App\Exception\UsuarioJaExisteException;
use App\Factory\Auth\UsuarioFactory;
use App\Factory\Servico\ClienteFactory;
use App\Factory\Servico\PrestadorFactory;
use App\Repository\Auth\UsuarioRepository;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/cadastro-usuario')]
final class CadastroUsuarioController extends AbstractController
{
    public function __construct(
        private UsuarioRepository $usuarioRepository,
        private UsuarioFactory $usuarioFactory,
        private EntityManagerInterface $manager,
    ) {}

    #[Route('/cliente', methods: ['POST'], name: 'app_cadastro_usuario_cliente')]
    public function cadastroCliente(
        #[MapRequestPayload]
        CadastrarClienteInputDto $dto,
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

    #[Route('/prestador', methods: ['POST'], name: 'app_cadastro_usuario_prestador')]
    public function cadastroPrestador(
        #[MapRequestPayload]
        CadastrarPrestadorInputDto $dto,
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

        $prestador = $factory->criar($dto, $profissao);

        $this->manager->persist($prestador->getUsuario());
        $this->manager->persist($prestador);
        $this->manager->flush();

        return $this->json(['success' => true]);
    }
}
