<?php

namespace App\Entity\Localizacao;

class Cep
{
    private ?string $numero = null;
    private ?string $rua = null;
    private ?string $bairro = null;
    private ?Municipio $municipio = null;

    public function getNumero(): ?string
    {
        return $this->numero;
    }

    public function setNumero(string $numero): self
    {
        $numero = preg_replace('/[^0-9]/', '', $numero);
        $this->numero = $numero;
        return $this;
    }

    public function getRua(): ?string
    {
        return $this->rua;
    }

    public function setRua(string $rua): self
    {
        $this->rua = $rua;
        return $this;
    }

    public function getBairro(): ?string
    {
        return $this->bairro;
    }

    public function setBairro(string $bairro): self
    {
        $this->bairro = $bairro;
        return $this;
    }

    public function getMunicipio(): ?Municipio
    {
        return $this->municipio;
    }

    public function setMunicipio(?Municipio $municipio): self
    {
        $this->municipio = $municipio;
        return $this;
    }
}
