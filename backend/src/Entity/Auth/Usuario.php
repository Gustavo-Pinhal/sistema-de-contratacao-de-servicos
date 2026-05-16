<?php

namespace App\Entity\Auth;

use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;

class Usuario implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[Groups(['meus_orcamentos:read', 'servico_dashboard:read'])]
    private ?Uuid $id = null;

    private ?string $email = null;

    private array $roles = [];

    private ?string $password = null;

    #[Groups(['servico_dashboard:read',  'meus_orcamentos:read'])]
    private ?string $nome = null;

    private ?Perfil $perfil = null;

    public function __construct()
    {
        $this->roles = [];
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;
        return $this;
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;
        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;
        return $this;
    }

    public function eraseCredentials(): void {}

    public function getNome(): ?string
    {
        return $this->nome;
    }

    public function setNome(?string $nome): self
    {
        $this->nome = $nome;
        return $this;
    }

    public function getPerfil(): ?Perfil
    {
        return $this->perfil;
    }

    public function setPerfil(Perfil $perfil): self
    {
        $this->perfil = $perfil;
        return $this;
    }
}
