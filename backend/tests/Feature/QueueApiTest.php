<?php

namespace Tests\Feature;

use App\Models\Patient;
use App\Models\QueueItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QueueApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create authenticated user
        $this->user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $this->token = $this->user->createToken('test-token')->plainTextToken;
    }

    public function test_can_create_queue_item(): void
    {
        $patient = Patient::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/queue', [
                'patientId' => $patient->id,
                'triageLevel' => 'high',
                'status' => 'waiting',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'patientId',
                    'tokenNumber',
                    'triageLevel',
                    'status',
                ],
            ]);

        $this->assertDatabaseHas('queue_items', [
            'patient_id' => $patient->id,
            'triage_level' => 'high',
            'status' => 'waiting',
        ]);
    }

    public function test_can_get_queue_items(): void
    {
        $patient = Patient::factory()->create();
        QueueItem::factory()->create([
            'patient_id' => $patient->id,
            'status' => 'waiting',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/queue');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'patientId',
                        'tokenNumber',
                        'status',
                    ],
                ],
            ]);
    }

    public function test_can_update_queue_item_status(): void
    {
        $patient = Patient::factory()->create();
        $queueItem = QueueItem::factory()->create([
            'patient_id' => $patient->id,
            'status' => 'waiting',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->putJson("/api/v1/queue/{$queueItem->id}", [
                'status' => 'in_progress',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'in_progress',
                ],
            ]);

        $this->assertDatabaseHas('queue_items', [
            'id' => $queueItem->id,
            'status' => 'in_progress',
        ]);
    }
}

