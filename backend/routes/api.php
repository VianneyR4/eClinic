<?php

use App\Http\Controllers\Api\PatientController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::prefix('v1')->group(function () {
    // Auth routes (public)
    Route::post('auth/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
    Route::post('auth/verify-email', [\App\Http\Controllers\Api\AuthController::class, 'verifyEmail']);
    Route::post('auth/resend-verification', [\App\Http\Controllers\Api\AuthController::class, 'resendVerificationCode']);
    
    // Health check (public)
    Route::get('health', function () {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
        ]);
    });

});

// Protected routes (require authentication via user or doctor)
Route::prefix('v1')->middleware('any.jwt')->group(function () {
    // Auth routes (protected)
    Route::post('auth/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::get('auth/me', [\App\Http\Controllers\Api\AuthController::class, 'me']);
    
    // Patient routes
    Route::apiResource('patients', PatientController::class);
    
    // User routes (includes doctors via role filter)
    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);
    
    // Search route
    Route::get('search', [\App\Http\Controllers\Api\SearchController::class, 'search']);
    
    // Queue routes
    Route::apiResource('queue', \App\Http\Controllers\Api\QueueController::class);

    // Consultation routes
    Route::post('consultations', [\App\Http\Controllers\Api\ConsultationController::class, 'store']);
    Route::get('patients/{id}/consultations', [\App\Http\Controllers\Api\ConsultationController::class, 'indexByPatient']);
    Route::get('consultations/{id}', [\App\Http\Controllers\Api\ConsultationController::class, 'show']);
});

