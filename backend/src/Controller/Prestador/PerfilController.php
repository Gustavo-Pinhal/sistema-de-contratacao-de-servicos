<?php

namespace App\Controller\Prestador;

use App\Dto\Request\EditarPerfil\EditarPrestadorInputDto;
use App\Entity\Auth\Perfil;
use App\Mapper\EditarPerfil\PrestadorEditarPerfilOutputMapper;
use App\Repository\Servico\PrestadorRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use App\Entity\Auth\Usuario;
use App\Repository\Servico\ProfissaoRepository;
use App\Service\Localizacao\CepService;
use App\Service\PublicMediaService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;

#[Route('/api/prestador/perfil')]
final class PerfilController extends AbstractController
{
    #[IsGranted('ROLE_PRESTADOR')]
    #[Route('/editar', methods: ['GET'], name: 'app_prestador_perfil_editar_get')]
    public function obterDadosEdicao(
        PrestadorRepository $repositorio,
        PrestadorEditarPerfilOutputMapper $mapper,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();

        $prestador = $repositorio->buscarParaEdicaoDePerfil($usuario);

        return $this->json($mapper->map($prestador));
    }

    #[IsGranted('ROLE_PRESTADOR')]
    #[Route('/editar', methods: ['POST'], name: 'app_prestador_perfil_editar_post')]
    public function editar(
        Request $request,
        #[MapRequestPayload]
        EditarPrestadorInputDto $dto,
        PrestadorRepository $repositorio,
        PublicMediaService $mediaService,
        CepService $cepService,
        ProfissaoRepository $profissaoRepository,
        EntityManagerInterface $manager,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        $prestador = $repositorio->buscarParaEdicaoDePerfil($usuario);

        if (!$prestador) {
            return $this->json(['message' => 'Prestador não encontrado.'], 404);
        }

        try {
            $usuario = $prestador->getUsuario();

            $nomeProfissional = $dto->nomeProfissional ?: $dto->nome;
            $usuario->setNome($dto->nome);
            $usuario->setEmail($dto->email);
            $prestador->setNome($nomeProfissional);

            $cep = $cepService->buscarOuCadastrar($dto->cep);
            $prestador->setCep($cep);

            $prestador->getProfissoes()->clear();
            foreach ($dto->profissoes as $id) {
                $profissao = $profissaoRepository->find($id);
                if ($profissao) {
                    $prestador->addProfissao($profissao);
                }
            }

            $foto = $request->files->get('perfil');
            if ($foto instanceof UploadedFile) {
                $caminho = $mediaService->uploadFotoPerfil($foto, $usuario->getId());

                $perfil = $usuario->getPerfil();

                if (!$perfil) {
                    $perfil = new Perfil($usuario, $caminho);
                    $usuario->setPerfil($perfil);
                } else {
                    $perfil->setCaminhoFoto($caminho);
                }
            }

            $manager->flush();

            return $this->json(['message' => 'Perfil atualizado com sucesso!']);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erro ao atualizar perfil.',
                'errors' => $e->getMessage()
            ], 400);
        }
    }
}
