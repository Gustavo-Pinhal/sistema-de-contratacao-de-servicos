<?php

namespace App\Entity\Localizacao;

use App\Entity\Auth\Usuario;
use Symfony\Component\Uid\Uuid;

class Endereco
{
    private ?Uuid $id = null;
    private ?Usuario $usuario = null;
    private ?Cep $cep = null;
    private ?string $rua = null;
    private ?string $numero = null;
    private ?string $bairro = null;
    private ?string $complemento = null;

    public function __construct()
    {
        $this->id = Uuid::v7();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getUsuario(): ?Usuario
    {
        return $this->usuario;
    }

    public function setUsuario(?Usuario $usuario): self
    {
        $this->usuario = $usuario;
        return $this;
    }

    public function getCep(): ?Cep
    {
        return $this->cep;
    }

    public function setCep(?Cep $cep): self
    {
        $this->cep = $cep;
        return $this;
    }

    public function getRua(): ?string
    {
        return $this->rua;
    }

    public function setRua(?string $rua): self
    {
        $this->rua = $rua;
        return $this;
    }

    public function getNumero(): ?string
    {
        return $this->numero;
    }

    public function setNumero(?string $numero): self
    {
        $this->numero = $numero;
        return $this;
    }

    public function getBairro(): ?string
    {
        return $this->bairro;
    }

    public function setBairro(?string $bairro): self
    {
        $this->bairro = $bairro;
        return $this;
    }

    public function getComplemento(): ?string
    {
        return $this->complemento;
    }

    public function setComplemento(?string $complemento): self
    {
        $this->complemento = $complemento;
        return $this;
    }
}
