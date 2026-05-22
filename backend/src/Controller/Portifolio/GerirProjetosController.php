<?php

namespace App\Controller\Portifolio;

use App\Dto\Request\Portifolio\ProjetoInputDto;
use App\Entity\Auth\Usuario;
use App\Entity\Portifolio\Foto;
use App\Entity\Portifolio\Projeto;
use App\Entity\Servico\Prestador;
use App\Entity\Servico\Servico;
use App\Enum\StatusServico;
use App\Factory\Portifolio\FotoFactory;
use App\Mapper\Portifolio\PortifolioOutputMapper;
use App\Repository\Portifolio\FotoRepository;
use App\Service\ProjetoMediaService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Doctrine\Attribute\MapEntity;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_PREMIUM')]
#[Route('/portifolio/projeto')]
final class GerirProjetosController extends AbstractController
{
    #[Route('/meu', methods: ['GET'], name: 'app_portifolio_meu')]
    public function meu(
        EntityManagerInterface $manager,
        PortifolioOutputMapper $mapper,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        $prestador = $manager->getRepository(Prestador::class)->find($usuario->getId());

        if (!$prestador || !$prestador->getPortifolio()) {
            return $this->json(['projetos' => [], 'biografia' => null, 'servicosConcluidos' => 0, 'id' => null]);
        }

        return $this->json(
            $mapper->map($prestador->getPortifolio()),
            context: ['json_encode_options' => JSON_UNESCAPED_SLASHES]
        );
    }

    #[Route('', methods: ['POST'], name: 'app_portifolio_projeto_criar')]
    public function criar(
        Request $request,
        EntityManagerInterface $manager,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        $prestador = $manager->getRepository(Prestador::class)->find($usuario->getId());

        if (!$prestador || !$prestador->getPortifolio()) {
            return $this->json(['error' => 'Portfólio não encontrado.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $titulo = $data['titulo'] ?? null;
        $descricao = $data['descricao'] ?? null;

        if (!$titulo || !$descricao) {
            return $this->json(['error' => 'Título e descrição são obrigatórios.'], Response::HTTP_BAD_REQUEST);
        }

        $servicosConcluidos = $manager->getRepository(Servico::class)
            ->findBy(['prestador' => $prestador, 'status' => StatusServico::Concluido]);

        if (empty($servicosConcluidos)) {
            return $this->json(['error' => 'Você não possui serviços concluídos para adicionar ao portfólio.'], Response::HTTP_BAD_REQUEST);
        }

        $servico = $servicosConcluidos[0];
        $portifolio = $prestador->getPortifolio();
        $posicao = $portifolio->getProjetos()->count() + 1;

        $projeto = new Projeto(
            $portifolio,
            $servico,
            $titulo,
            $descricao,
            '0',
            false,
            new \DateTimeImmutable(),
            false,
            $posicao
        );

        $manager->persist($projeto);
        $manager->flush();

        return $this->json([
            'success' => true,
            'id' => $projeto->getId()->toString(),
            'titulo' => $projeto->getTitulo(),
            'descricao' => $projeto->getDescricao(),
            'posicao' => $projeto->getPosicao(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['DELETE'], name: 'app_portifolio_projeto_excluir')]
    public function excluir(
        Projeto $projeto,
        ProjetoMediaService $mediaService,
        EntityManagerInterface $manager,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        $idPrestadorDono = $projeto->getPortifolio()->getPrestador()->getId();
        if (!$idPrestadorDono->equals($usuario->getId())) {
            return $this->json(['error' => 'Acesso negado.'], Response::HTTP_FORBIDDEN);
        }

        foreach ($projeto->getFotos() as $foto) {
            if ($foto->getUrlFoto()) {
                try { $mediaService->deletarFotoProjeto($foto->getUrlFoto()); } catch (\Exception) {}
            }
            $manager->remove($foto);
        }

        $manager->remove($projeto);
        $manager->flush();

        return $this->json(['success' => true]);
    }

    #[Route('/{id}', methods: ['PUT'], name: 'app_portifolio_projeto_editar')]
    public function editar(
        Projeto $projeto,
        #[MapRequestPayload] ProjetoInputDto $dto,
        EntityManagerInterface $manager,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        $idPrestadorDono = $projeto->getPortifolio()->getPrestador()->getId();
        if (!$idPrestadorDono->equals($usuario->getId())) {
            return $this->json(['error' => 'Acesso negado. Você não é o proprietário deste projeto.'], Response::HTTP_FORBIDDEN);
        }

        $projeto->setTitulo($dto->titulo)
            ->setDescricao($dto->descricao)
            ->setExibirValor($dto->exibirValor)
            ->setExibirConcluidoEm($dto->exibirConcluidoEm);
        $manager->flush();

        return $this->json(['success' => true], Response::HTTP_OK);
    }

    #[Route('/{id}/upload', methods: ['POST'], name: 'app_portifolio_projeto_upload')]
    public function upload(
        Projeto $projeto,
        Request $request,
        ProjetoMediaService $mediaService,
        FotoRepository $repository,
        FotoFactory $factory,
        EntityManagerInterface $manager,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        $idPrestadorDono = $projeto->getPortifolio()->getPrestador()->getId();
        if (!$idPrestadorDono->equals($usuario->getId())) {
            return $this->json(['error' => 'Acesso negado. Você não é o proprietário deste projeto.'], Response::HTTP_FORBIDDEN);
        }

        $arquivos = $request->files->get('imagens');
        if (empty($arquivos)) {
            return $this->json(['error' => 'Nenhum arquivo enviado sob a chave "imagens".'], Response::HTTP_BAD_REQUEST);
        }

        if ($arquivos instanceof UploadedFile) {
            $arquivos = [$arquivos];
        }

        $proximaPosicao = $repository->buscarMaiorPosicaoPorProjeto($projeto) + 1;
        $retornoImagens = [];

        try {
            foreach ($arquivos as $arquivo) {
                if (!$arquivo instanceof UploadedFile) {
                    continue;
                }

                $foto = $factory->criarPreenchendoMidia($arquivo, $projeto, $proximaPosicao);

                $manager->persist($foto);

                $retornoImagens[] = [
                    'id' => $foto->getId()->toString(),
                    'url' => $mediaService->gerarUrlPublica($foto->getUrlFoto()),
                    'posicao' => $foto->getPosicao()
                ];

                $proximaPosicao++;
            }

            $manager->flush();
        } catch (\InvalidArgumentException $exception) {
            return $this->json([
                'error' => 'Erro de Validação',
                'message' => $exception->getMessage()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->json([
            'success' => true,
            'imagens' => $retornoImagens
        ], Response::HTTP_CREATED, context: ['json_encode_options' => JSON_UNESCAPED_SLASHES]);
    }

    #[Route('/foto/{fotoId}', methods: ['DELETE'], name: 'app_portifolio_projeto_foto_excluir')]
    public function excluirFoto(
        #[MapEntity(mapping: ['fotoId' => 'id'])] Foto $foto,
        ProjetoMediaService $mediaService,
        EntityManagerInterface $manager,
    ): JsonResponse {
        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        $idPrestadorDono = $foto->getProjeto()->getPortifolio()->getPrestador()->getId();
        if (!$idPrestadorDono->equals($usuario->getId())) {
            return $this->json(['error' => 'Acesso negado. Você não é o proprietário deste projeto.'], Response::HTTP_FORBIDDEN);
        }

        try {
            if ($foto->getUrlFoto()) {
                $mediaService->deletarFotoProjeto($foto->getUrlFoto());
            }

            $manager->remove($foto);
            $manager->flush();
        } catch (\Exception $exception) {
            return $this->json([
                'error' => 'Erro interno',
                'message' => 'Não foi possível remover a foto do armazenamento remoto.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json(['success' => true], Response::HTTP_OK);
    }
}
