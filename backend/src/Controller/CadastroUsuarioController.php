<?php

namespace App\Controller;

use App\Dto\Request\CadastroUsuario\CadastrarClienteInputDto;
use App\Dto\Request\CadastroUsuario\CadastrarPrestadorInputDto;
use App\Entity\Servico\Prestador;
use App\Entity\Servico\Profissao;
use App\Exception\UsuarioJaExisteException;
use App\Factory\Auth\UsuarioFactory;
use App\Repository\Auth\UsuarioRepository;
use App\Service\Auth\CadastrarUsuarioService;
use App\Service\Localizacao\CepService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/cadastro-usuario')]
final class CadastroUsuarioController extends AbstractController
{
    #[Route('/cliente', methods: ['POST'], name: 'app_cadastro_usuario_cliente')]
    public function cadastroCliente(
        #[MapRequestPayload]
        CadastrarClienteInputDto $dto,
        CadastrarUsuarioService $service,
    ): JsonResponse {
        $service->registrarCliente($dto);
        return $this->json(['success' => true]);
    }

    #[Route('/prestador', methods: ['POST'], name: 'app_cadastro_usuario_prestador')]
    public function cadastroPrestador(
        #[MapRequestPayload]
        CadastrarPrestadorInputDto $dto,
        UsuarioRepository $usuarioRepository,
        UsuarioFactory $usuarioFactory,
        CepService $cepService,
        EntityManagerInterface $manager,
    ): JsonResponse {
        $usuarioExistente = $usuarioRepository->findOneBy(['email' => $dto->email]);
        if ($usuarioExistente) {
            throw new UsuarioJaExisteException($dto->email);
        }

        $usuario = $usuarioFactory->criar(
            $dto->email,
            $dto->nome,
            $dto->senha,
            ['PRESTADOR'],
        );

        $cep = $cepService->buscarOuCadastrar($dto->cep);

        $profissao = $manager->getRepository(Profissao::class)->find($dto->profissao);

        if (!$profissao) {
            return $this->json([
                'message' => 'Erro de validação',
                'errors' => ['profissao' => 'A profissão informada não existe.']
            ], 400);
        }

        $prestador = new Prestador();
        $prestador->setUsuario($usuario)
            ->setNome($usuario->getNome())
            ->setCep($cep)
            ->addProfissao($profissao);

        $manager->persist($usuario);
        $manager->persist($prestador);
        $manager->flush();

        return $this->json(['success' => true]);
    }
}
