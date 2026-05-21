<?php

declare(strict_types=1);

namespace App\Metrics;

use Artprima\PrometheusMetricsBundle\Metrics\ExceptionMetricsCollectorInterface;
use Artprima\PrometheusMetricsBundle\Metrics\MetricsCollectorInitTrait;
use Artprima\PrometheusMetricsBundle\Metrics\RequestMetricsCollectorInterface;
use Artprima\PrometheusMetricsBundle\Metrics\TerminateMetricsCollectorInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\TerminateEvent;

final class ApiBusinessMetricsCollector implements RequestMetricsCollectorInterface, TerminateMetricsCollectorInterface, ExceptionMetricsCollectorInterface
{
    use MetricsCollectorInitTrait;

    /** @var array<int, float> */
    private array $startedAtByRequestId = [];

    public function collectRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();

        if (!$this->isApiRequest($request)) {
            return;
        }

        $route = $this->resolveRoute($request);
        $method = $request->getMethod();
        $area = $this->resolveArea($route);

        $this->startedAtByRequestId[spl_object_id($request)] = microtime(true);

        $counter = $this->collectionRegistry->getOrRegisterCounter(
            $this->namespace,
            'custom_http_requests_total',
            'Total de requisicoes HTTP da API por rota/metodo/area',
            ['route', 'method', 'area']
        );

        $counter->inc([$route, $method, $area]);
    }

    public function collectResponse(TerminateEvent $event): void
    {
        $request = $event->getRequest();

        if (!$this->isApiRequest($request)) {
            return;
        }

        $response = $event->getResponse();
        $route = $this->resolveRoute($request);
        $method = $request->getMethod();
        $area = $this->resolveArea($route);
        $statusClass = $this->resolveStatusClass($response->getStatusCode());

        $responsesCounter = $this->collectionRegistry->getOrRegisterCounter(
            $this->namespace,
            'custom_http_responses_total',
            'Total de respostas HTTP da API por rota/metodo/area/status',
            ['route', 'method', 'area', 'status_class']
        );

        $responsesCounter->inc([$route, $method, $area, $statusClass]);

        $requestId = spl_object_id($request);
        $startedAt = $this->startedAtByRequestId[$requestId] ?? microtime(true);
        $duration = max(0.0, microtime(true) - $startedAt);

        $histogram = $this->collectionRegistry->getOrRegisterHistogram(
            $this->namespace,
            'custom_http_request_duration_seconds',
            'Duracao das requisicoes HTTP da API em segundos',
            ['route', 'method', 'area'],
            [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]
        );

        $histogram->observe($duration, [$route, $method, $area]);

        if ('app_admin_cadastro_profissao' === $route
            || 'app_admin_cadastro_profissao_criar' === $route
            || 'app_admin_cadastro_profissao_atualizar' === $route
            || 'app_admin_cadastro_profissao_restaurar' === $route
            || 'app_admin_cadastro_profissao_excluir' === $route
        ) {
            $operationCounter = $this->collectionRegistry->getOrRegisterCounter(
                $this->namespace,
                'admin_profissoes_operations_total',
                'Operacoes executadas no cadastro admin de profissoes',
                ['operation', 'status_class']
            );

            $operationCounter->inc([$this->resolveAdminProfissaoOperation($route, $method), $statusClass]);
        }

        unset($this->startedAtByRequestId[$requestId]);
    }

    public function collectException(ExceptionEvent $event): void
    {
        $request = $event->getRequest();

        if (!$this->isApiRequest($request)) {
            return;
        }

        $route = $this->resolveRoute($request);
        $method = $request->getMethod();
        $area = $this->resolveArea($route);
        $exceptionClass = $event->getThrowable()::class;

        $counter = $this->collectionRegistry->getOrRegisterCounter(
            $this->namespace,
            'custom_http_exceptions_total',
            'Total de excecoes da API por rota/metodo/area/tipo',
            ['route', 'method', 'area', 'exception_class']
        );

        $counter->inc([$route, $method, $area, $exceptionClass]);
    }

    private function isApiRequest(Request $request): bool
    {
        return str_starts_with($request->getPathInfo(), '/api/');
    }

    private function resolveRoute(Request $request): string
    {
        $route = $request->attributes->get('_route');

        if (!is_string($route) || '' === $route) {
            return 'unknown';
        }

        return $route;
    }

    private function resolveArea(string $route): string
    {
        if (str_starts_with($route, 'app_admin_')) {
            return 'admin';
        }

        if (str_starts_with($route, 'app_area_prestador_')) {
            return 'prestador';
        }

        if (str_starts_with($route, 'app_api_cliente_')) {
            return 'cliente';
        }

        if (str_starts_with($route, 'app_ui_')) {
            return 'ui';
        }

        if ('api_login_check' === $route) {
            return 'auth';
        }

        return 'api';
    }

    private function resolveStatusClass(int $statusCode): string
    {
        return match (true) {
            $statusCode >= Response::HTTP_OK && $statusCode < Response::HTTP_MULTIPLE_CHOICES => '2xx',
            $statusCode >= Response::HTTP_MULTIPLE_CHOICES && $statusCode < Response::HTTP_BAD_REQUEST => '3xx',
            $statusCode >= Response::HTTP_BAD_REQUEST && $statusCode < Response::HTTP_INTERNAL_SERVER_ERROR => '4xx',
            default => '5xx',
        };
    }

    private function resolveAdminProfissaoOperation(string $route, string $method): string
    {
        return match ($route) {
            'app_admin_cadastro_profissao' => 'GET' === $method ? 'listar' : 'desconhecida',
            'app_admin_cadastro_profissao_criar' => 'criar',
            'app_admin_cadastro_profissao_atualizar' => 'atualizar',
            'app_admin_cadastro_profissao_restaurar' => 'restaurar',
            'app_admin_cadastro_profissao_excluir' => 'excluir',
            default => 'desconhecida',
        };
    }
}
