<?php

namespace App\Controller\Prestador;

use App\Dto\Request\EditarPerfil\EditarPrestadorInputDto;
use App\Entity\Auth\Perfil;
use App\Entity\Auth\Usuario;
use App\Mapper\EditarPerfil\PrestadorEditarPerfilOutputMapper;
use App\Repository\Servico\PrestadorRepository;
use App\Repository\Servico\ProfissaoRepository;
use App\Service\Localizacao\CepService;
use App\Service\PublicMediaService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

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
        #[MapRequestPayload] EditarPrestadorInputDto $dto,
        PrestadorRepository $repositorio,
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
            $usuario->setNome($dto->nome);
            $prestador->setNome($dto->nomeProfissional ?: $dto->nome);
            $prestador->setCep($cepService->buscarOuCadastrar($dto->cep));

            $prestador->getProfissoes()->clear();
            foreach ($dto->profissoes as $id) {
                $profissao = $profissaoRepository->find($id);
                if ($profissao) {
                    $prestador->addProfissao($profissao);
                }
            }

            $manager->flush();

            return $this->json(['message' => 'Dados do perfil atualizados com sucesso!']);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Erro ao atualizar dados.', 'errors' => $e->getMessage()], 400);
        }
    }

    #[Route('/foto', methods: ['POST'], name: 'app_prestador_perfil_foto_post')]
    public function atualizarFoto(
        Request $request,
        PublicMediaService $mediaService,
        EntityManagerInterface $manager,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        $foto = $request->files->get('perfil');

        if (!$foto instanceof UploadedFile) {
            return $this->json(['message' => 'Nenhum arquivo de imagem foi enviado.'], 400);
        }

        try {
            $caminho = $mediaService->uploadFotoPerfil($foto, $usuario->getId());

            $perfil = $usuario->getPerfil();

            if (!$perfil) {
                $perfil = new Perfil($usuario, $caminho);
                $usuario->setPerfil($perfil);
                $manager->persist($perfil);
            } else {
                $perfil->setCaminhoFoto($caminho);
            }

            $manager->flush();

            return $this->json([
                'message' => 'Foto de perfil atualizada com sucesso!',
                'url' => $caminho,
            ]);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Erro ao processar imagem.', 'errors' => $e->getMessage()], 400);
        }
    }
}
