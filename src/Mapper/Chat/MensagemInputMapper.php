<?php

namespace App\Mapper\Chat;

use App\Dto\Input\Chat\MensagemDto;
use App\Entity\Auth\Usuario;
use App\Entity\Chat\Mensagem;
use App\Entity\Chat\Arquivo;
use App\Entity\Chat\Sala;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Uid\Uuid;

class MensagemInputMapper
{
    public function __construct(
        private EntityManagerInterface $em
    ) {}

    public function toEntity(MensagemDto $dto, Sala $sala, Usuario $usuario): Mensagem
    {
        $mensagem = new Mensagem();
        $mensagem->setSala($sala);
        $mensagem->setUsuario($usuario);
        
        $mensagem->setConteudo(['tipo' => 'texto']);

        if ($dto->responde) {
            $referencia = $this->em->getReference(Mensagem::class, $dto->responde);
            $mensagem->setRespondeA($referencia);
        }

        return $mensagem;
    }
}