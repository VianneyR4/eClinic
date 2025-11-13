<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_login_requires_verification_then_returns_token_after_verification(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@gmail.com',
            'password' => Hash::make('admin123456'),
            'email_verified_at' => null,
        ]);

        // First step: login triggers verification requirement
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@gmail.com',
            'password' => 'admin123456',
        ]);

        $login->assertStatus(403)
            ->assertJson([
                'success' => false,
                'requires_verification' => true,
            ]);

        // Find the latest verification code issued
        $code = \App\Models\VerificationCode::where('user_id', $user->id)->latest('id')->first();
        $this->assertNotNull($code, 'Verification code should be generated on login');

        // Verify email to obtain JWT
        $verify = $this->postJson('/api/v1/auth/verify-email', [
            'email' => 'admin@gmail.com',
            'code' => $code->code,
        ]);

        $verify->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'user' => ['id','name','email'],
                    'token',
                ],
            ])
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@gmail.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_login_requires_verification_for_unverified_email(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => null,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'requires_verification' => true,
            ]);
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $token = JWTAuth::fromUser($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_authenticated_user_can_get_profile(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $token = JWTAuth::fromUser($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'name',
                    'email',
                ],
            ]);
    }
}

