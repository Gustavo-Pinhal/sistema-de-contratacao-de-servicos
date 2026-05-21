<?php

namespace App\Controller\Empresarial;

use App\Dto\Cadastro\CadastrarPrestadorInputDto;
use App\Dto\Request\Empresarial\DesfiliarInputDto;
use App\Entity\Empresarial\Empresa;
use App\Entity\Empresarial\EmpresaPrestador;
use App\Entity\Servico\Profissao;
use App\Exception\UsuarioJaExisteException;
use App\Factory\Servico\PrestadorFactory;
use App\Repository\Auth\UsuarioRepository;
use App\Service\Localizacao\CepService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use App\Entity\Auth\Usuario;
use App\Factory\Notificacao\NotificacaoFactory;
use App\Mapper\Empresarial\PrestadorOutputMapper;
use App\Repository\Empresarial\EmpresaPrestadorRepository;
use App\Repository\Empresarial\EmpresaRepository;
use App\Repository\Servico\PrestadorRepository;
use App\Dto\Request\Empresarial\ConviteInputDto;
use App\Mapper\Empresarial\NotificacaoOutputMapper;
use App\Repository\Notificacao\NotificacaoRepository;
use Symfony\Component\HttpFoundation\Response;

#[IsGranted('ROLE_EMPRESA')]
#[Route('/empresarial/prestador')]
final class PrestadorController extends AbstractController
{
    #[Route('', methods: ['GET'], name: 'app_empresarial_prestador_listar')]
    public function index(
        PrestadorRepository $prestadorRepository,
        PrestadorOutputMapper $mapper,
    ): JsonResponse {
        /** @var Usuario $usuarioLogado */
        $usuario = $this->getUser();
        $prestadores = $prestadorRepository->findPrestadoresPorEmpresa($usuario);

        return $this->json(
            $mapper->mapCollection($prestadores),
            Response::HTTP_OK,
        );
    }

    #[Route('/criar', methods: ['POST'], name: 'app_empresarial_prestador_criar')]
    public function criar(
        #[MapRequestPayload] CadastrarPrestadorInputDto $dto,
        UsuarioRepository $usuarioRepository,
        EntityManagerInterface $manager,
        CepService $cepService,
        PrestadorFactory $factory,
    ): JsonResponse {
        $usuarioExistente = $usuarioRepository->findOneBy(['email' => $dto->email]);
        if ($usuarioExistente) {
            throw new UsuarioJaExisteException($dto->email);
        }

        $profissao = $manager->getRepository(Profissao::class)->find($dto->profissao);
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

        /** @var Usuario $usuario */
        $usuario = $this->getUser();
        $empresa = $manager->getRepository(Empresa::class)->find($usuario->getId());

        $prestador = $factory->criar($dto, $profissao, $cep);

        $manager->persist($prestador->getUsuario());
        $manager->persist($prestador);
        $relacao = new EmpresaPrestador($empresa, $prestador->getId());

        $manager->persist($relacao);
        $manager->flush();

        return $this->json(['success' => true]);
    }

    #[Route('/convidar', methods: ['POST'], name: 'app_empresarial_prestador_convidar')]
    public function convidar(
        #[MapRequestPayload] ConviteInputDto $dto,
        EntityManagerInterface $manager,
        UsuarioRepository $usuarioRepository,
        PrestadorRepository $prestadorRepository,
        EmpresaPrestadorRepository $empresaPrestadorRepository,
        EmpresaRepository $empresaRepository,
        NotificacaoFactory $notificacaoFactory,
    ): JsonResponse {
        /** @var Usuario $usuarioLogado */
        $usuarioLogado = $this->getUser();

        $empresaRemetente = $empresaRepository->find($usuarioLogado->getId());
        if (!$empresaRemetente || $empresaRemetente->getExcluidoEm() !== null) {
            return $this->json([
                'error' => 'A conta logada não possui uma empresa ativa configurada.'
            ], Response::HTTP_FORBIDDEN);
        }

        $usuarioAlvo = $usuarioRepository->findOneBy(['email' => strtolower(trim($dto->email))]);
        if (!$usuarioAlvo) {
            return $this->json([
                'error' => 'Nenhum usuário foi localizado com o e-mail informado.'
            ], Response::HTTP_NOT_FOUND);
        }

        $prestador = $prestadorRepository->find($usuarioAlvo->getId());
        if (!$prestador || !$prestador->isAtivo() || $prestador->getExcluidoEm() !== null) {
            return $this->json([
                'error' => 'O usuário localizado não possui um perfil de prestador ativo de serviços.'
            ], Response::HTTP_BAD_REQUEST);
        }

        $vinculoExistente = $empresaPrestadorRepository->findOneBy([
            'idPrestador' => $prestador->getId(),
            'excluidoEm' => null
        ]);

        if ($vinculoExistente) {
            return $this->json([
                'error' => 'Este prestador já possui um vínculo ativo com outra empresa.'
            ], Response::HTTP_CONFLICT);
        }

        $notificacao = $notificacaoFactory->criarConviteFiliacao(
            receiver: $usuarioAlvo,
            companyName: $usuarioLogado->getNome(),
            sender: $usuarioLogado
        );

        $manager->persist($notificacao);
        $manager->flush();

        return $this->json([
            'success' => true
        ], Response::HTTP_OK);
    }

    #[Route('/desfiliar', methods: ['POST'], name: 'app_empresarial_prestador_desfiliar')]
    public function desfiliar(
        #[MapRequestPayload] DesfiliarInputDto $dto,
        EntityManagerInterface $manager,
        EmpresaPrestadorRepository $empresaPrestadorRepository,
    ): JsonResponse {
        /** @var Usuario $usuarioLogado */
        $usuarioLogado = $this->getUser();

        $vinculo = $empresaPrestadorRepository->findOneBy([
            'idPrestador' => $dto->prestadorId,
            'empresa'     => $usuarioLogado->getId(),
            'excluidoEm'  => null
        ]);

        if (!$vinculo) {
            return $this->json([
                'error' => 'Vínculo não encontrado, já desfeito ou o prestador não pertence à sua empresa.'
            ], Response::HTTP_NOT_FOUND);
        }

        $vinculo->setExcluidoEm(new \DateTimeImmutable());

        $manager->flush();

        return $this->json([
            'success' => true
        ], Response::HTTP_OK);
    }

    #[Route('/pendentes', methods: ['GET'], name: 'app_empresarial_prestadores_pendentes')]
    public function listarEnviadasPendentes(
        NotificacaoRepository $notificacaoRepository,
        NotificacaoOutputMapper $mapper,
    ): JsonResponse {
        /** @var Usuario $empresaLogada */
        $empresaLogada = $this->getUser();
        $notificacoes = $notificacaoRepository->findEnviadasENaoVisualizadas($empresaLogada);

        return $this->json($mapper->mapCollection($notificacoes), Response::HTTP_OK);
    }
}
