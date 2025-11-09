<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AnyJwtAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        // Try user guard first
        Auth::shouldUse('api');
        if (Auth::check()) {
            return $next($request);
        }

        // Try doctor guard
        Auth::shouldUse('doctor');
        if (Auth::check()) {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unauthorized.',
        ], 401);
    }
}
