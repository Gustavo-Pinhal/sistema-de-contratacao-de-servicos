<?php

namespace App\Entity\Notificacao;

use App\Entity\Auth\Usuario;
use Symfony\Component\Uid\Uuid;

class Notificacao
{
    private ?Uuid $id = null;
    private Usuario $receiver;
    private ?Usuario $sender = null;
    private array $message;
    private \DateTimeImmutable $createdAt;
    private ?\DateTimeImmutable $viewedAt = null;
    private ?\DateTimeImmutable $deletedAt = null;

    public function __construct(Usuario $receiver, array $message, ?Usuario $sender = null)
    {
        $this->receiver = $receiver;
        $this->message = $message;
        $this->sender = $sender;
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getReceiver(): Usuario
    {
        return $this->receiver;
    }

    public function getSender(): ?Usuario
    {
        return $this->sender;
    }

    public function getMessage(): array
    {
        return $this->message;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getViewedAt(): ?\DateTimeImmutable
    {
        return $this->viewedAt;
    }

    public function markAsViewed(): self
    {
        $this->viewedAt = new \DateTimeImmutable();
        return $this;
    }

    public function getDeletedAt(): ?\DateTimeImmutable
    {
        return $this->deletedAt;
    }

    public function softDelete(): self
    {
        $this->deletedAt = new \DateTimeImmutable();
        return $this;
    }
}
