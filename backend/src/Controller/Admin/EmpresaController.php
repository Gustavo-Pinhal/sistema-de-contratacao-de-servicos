<?php

namespace App\Controller\Admin;

use App\Dto\Request\Admin\Empresa\CriarEmpresaInputDto;
use App\Exception\UsuarioJaExisteException;
use App\Factory\Empresarial\EmpresaFactory;
use App\Mapper\Admin\EmpresaOutputMapper;
use App\Repository\Auth\UsuarioRepository;
use App\Repository\Empresarial\EmpresaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_ADMIN')]
#[Route('/admin/empresas')]
final class EmpresaController extends AbstractController
{
    public function __construct(
        private EmpresaRepository $empresaRepository,
        private UsuarioRepository $usuarioRepository,
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('', methods: ['GET'], name: 'app_admin_empresa_listar')]
    public function listar(
        EmpresaOutputMapper $mapper,
    ): JsonResponse {
        $empresas = $this->empresaRepository->findBy(['excluidoEm' => null]);
        return $this->json(
            $mapper->mapCollection($empresas),
            context: ['json_encode_options' => JSON_UNESCAPED_SLASHES]
        );
    }

    #[Route('', methods: ['POST'], name: 'app_admin_empresa_criar')]
    public function criar(
        #[MapRequestPayload] CriarEmpresaInputDto $dto,
        EmpresaFactory $factory,
        EmpresaOutputMapper $mapper,
    ): JsonResponse {
        $usuarioExistente = $this->usuarioRepository->findOneBy(['email' => $dto->email]);
        if ($usuarioExistente) {
            throw new UsuarioJaExisteException($dto->email);
        }

        $empresa = $factory->fromDto($dto);
        $this->entityManager->persist($empresa->getUsuario());
        $this->entityManager->persist($empresa);
        $this->entityManager->flush();

        return $this->json($mapper->map($empresa), Response::HTTP_CREATED);
    }
}
