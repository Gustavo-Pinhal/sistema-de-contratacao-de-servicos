<?php

namespace App\Factory\Chat;

use App\Dto\Request\Chat\MensagemInputDto;
use App\Entity\Auth\Usuario;
use App\Entity\Chat\Mensagem;
use App\Entity\Chat\Sala;
use Doctrine\ORM\EntityManagerInterface;

class MensagemFactory
{
    public function __construct(
        private EntityManagerInterface $em
    ) {}

    public function criar(
        MensagemInputDto $dto,
        Sala $sala,
        Usuario $usuario
    ): Mensagem {
        $mensagem = new Mensagem();
        $mensagem->setSala($sala);
        $mensagem->setUsuario($usuario);
        $mensagem->setConteudo([
            'tipo' => 'texto',
            'texto' => $dto->texto
        ]);

        if ($dto->responde) {
            $referencia = $this->em->getRepository(Mensagem::class)->find($dto->responde);
            $mensagem->setResponde($referencia);
        }

        return $mensagem;
    }
}
