<?php

namespace App\Controller;

use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class HelloWorldController extends AbstractController
{
    #[Route('/', name: 'app_hello_world')]
    public function index(Connection $connection): JsonResponse
    {
        try {
            $version = $connection->fetchOne('SELECT version()');

            return $this->json([
                'message' => 'Hello World!',
                'database_version' => $version,
                'status' => 'success'
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Connected failed!',
                'error' => $e->getMessage(),
                'status' => 'error'
            ], 500);
        }
    }
}
