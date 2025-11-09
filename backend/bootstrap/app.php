<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'jwt.auth' => \PHPOpenSourceSaver\JWTAuth\Http\Middleware\Authenticate::class,
            'jwt.refresh' => \PHPOpenSourceSaver\JWTAuth\Http\Middleware\RefreshToken::class,
            'any.jwt' => \App\Http\Middleware\AnyJwtAuth::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->renderable(function (Throwable $e, $request) {
            if ($request->expectsJson() || str_starts_with($request->path(), 'api/')) {
                $status = 500;
                $message = 'Something went wrong. Please try again.';
                $e = $e;

                if ($e instanceof \Illuminate\Validation\ValidationException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Validation failed.',
                        'errors' => $e->errors(),
                    ], 422);
                }

                if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthorized.',
                    ], 401);
                }

                if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface) {
                    $status = $e->getStatusCode();
                    if ($status === 404) {
                        $message = 'Resource not found.';
                    } elseif ($status === 403) {
                        $message = 'Forbidden.';
                    } elseif ($status === 405) {
                        $message = 'Method not allowed.';
                    } elseif ($status === 429) {
                        $message = 'Too many requests. Please slow down.';
                    } else {
                        $message = 'Request could not be processed.';
                    }
                } elseif ($e instanceof \Illuminate\Database\QueryException || $e instanceof \PDOException) {
                    $status = 503;
                    $message = 'from app.php: Service is temporarily unavailable. Please try again in a moment';
                    $e = $e;
                }

                return response()->json([
                    'success' => false,
                    'message' => $message,
                    'error' => $e
                ], $status);
            }

            // Fallback to default rendering for non-API requests
            return null;
        });
    })->create();

