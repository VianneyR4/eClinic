<?php

namespace Tests\Feature;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class PatientApiTest extends TestCase
{
    use RefreshDatabase;

    protected array $authHeader;

    protected function setUp(): void
    {
        parent::setUp();
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $token = JWTAuth::fromUser($user);
        $this->authHeader = ['Authorization' => 'Bearer ' . $token];
    }

    /**
     * Test fetching all patients.
     */
    public function test_can_fetch_all_patients(): void
    {
        Patient::factory()->count(5)->create();

        $response = $this->withHeaders($this->authHeader)->getJson('/api/v1/patients');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'first_name',
                        'last_name',
                        'email',
                        'phone',
                        'created_at',
                        'updated_at',
                    ],
                ],
                'meta',
            ]);
    }

    /**
     * Test creating a new patient.
     */
    public function test_can_create_patient(): void
    {
        $patientData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'phone' => '1234567890',
            'date_of_birth' => '1990-01-01',
            'address' => [
                'street' => '123 Main St',
                'city' => 'New York',
                'state' => 'NY',
                'zip_code' => '10001',
            ],
        ];

        $response = $this->withHeaders($this->authHeader)->postJson('/api/v1/patients', $patientData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Patient created successfully.',
            ])
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'first_name',
                    'last_name',
                    'email',
                ],
            ]);

        $this->assertDatabaseHas('patients', [
            'email' => 'john.doe@example.com',
        ]);
    }

    /**
     * Test fetching a single patient.
     */
    public function test_can_fetch_single_patient(): void
    {
        $patient = Patient::factory()->create();

        $response = $this->withHeaders($this->authHeader)->getJson("/api/v1/patients/{$patient->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $patient->id,
                    'first_name' => $patient->first_name,
                    'last_name' => $patient->last_name,
                ],
            ]);
    }

    /**
     * Test updating a patient.
     */
    public function test_can_update_patient(): void
    {
        $patient = Patient::factory()->create();

        $updateData = [
            'first_name' => 'Jane',
            'last_name' => 'Smith',
        ];

        $response = $this->withHeaders($this->authHeader)->putJson("/api/v1/patients/{$patient->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Patient updated successfully.',
            ]);

        $this->assertDatabaseHas('patients', [
            'id' => $patient->id,
            'first_name' => 'Jane',
            'last_name' => 'Smith',
        ]);
    }

    /**
     * Test deleting a patient.
     */
    public function test_can_delete_patient(): void
    {
        $patient = Patient::factory()->create();

        $response = $this->withHeaders($this->authHeader)->deleteJson("/api/v1/patients/{$patient->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Patient deleted successfully.',
            ]);

        $this->assertSoftDeleted('patients', [
            'id' => $patient->id,
        ]);
    }

    /**
     * Test validation errors when creating patient.
     */
    public function test_validation_errors_on_create(): void
    {
        $response = $this->withHeaders($this->authHeader)->postJson('/api/v1/patients', []);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'success',
                'message',
                'errors',
            ]);
    }

    /**
     * Test patient not found.
     */
    public function test_returns_404_for_nonexistent_patient(): void
    {
        $response = $this->withHeaders($this->authHeader)->getJson('/api/v1/patients/999');

        $response->assertStatus(404);
    }
}

