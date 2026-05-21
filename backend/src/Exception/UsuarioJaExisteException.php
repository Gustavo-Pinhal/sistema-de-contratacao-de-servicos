<?php

namespace App\Exception;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class UsuarioJaExisteException extends \DomainException implements HttpExceptionInterface
{
    public function __construct(string $email = "")
    {
        $message = sprintf('O e-mail "%s" já está sendo utilizado por outro usuário.', $email);

        parent::__construct($message, Response::HTTP_CONFLICT);
    }

    public function getStatusCode(): int
    {
        return Response::HTTP_CONFLICT;
    }

    public function getHeaders(): array
    {
        return [];
    }
}
