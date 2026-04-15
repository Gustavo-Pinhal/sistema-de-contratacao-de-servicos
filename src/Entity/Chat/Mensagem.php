<?php

namespace App\Entity\Chat;

use App\Dto\Request\Chat\MensagemInputDto;
use App\Entity\Auth\Usuario;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

class Mensagem
{
    #[Groups(['chat:read'])]
    private ?Uuid $id = null;

    #[Groups(['chat:read'])]
    private ?Usuario $usuario = null;

    private ?Sala $sala = null;

    #[Groups(['chat:read'])]
    private array $conteudo = [];

    #[Groups(['chat:read'])]
    private \DateTimeImmutable $envioEm;

    #[Groups(['chat:read'])]
    private ?\DateTimeImmutable $visualizadoEm = null;

    public function __construct()
    {
        $this->id = Uuid::v7();
        $this->envioEm = new \DateTimeImmutable();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getUsuario(): ?Usuario
    {
        return $this->usuario;
    }

    public function setUsuario(Usuario $usuario): self
    {
        $this->usuario = $usuario;
        return $this;
    }

    public function getSala(): ?Sala
    {
        return $this->sala;
    }

    public function setSala(Sala $sala): self
    {
        $this->sala = $sala;
        return $this;
    }

    public function getConteudo(): array
    {
        return $this->conteudo;
    }

    public function setConteudo(array $conteudo): self
    {
        $this->conteudo = $conteudo;
        return $this;
    }

    public function getEnvioEm(): \DateTimeImmutable
    {
        return $this->envioEm;
    }

    public function getVisualizadoEm(): ?\DateTimeImmutable
    {
        return $this->visualizadoEm;
    }

    public function setVisualizadoEm(?\DateTimeImmutable $visualizadoEm): self
    {
        $this->visualizadoEm = $visualizadoEm;
        return $this;
    }

    public static function fromDto(MensagemInputDto $dto): self
    {
        $e = new self();
        $e->setConteudo($dto->conteudo);
        return $e;
    }
}