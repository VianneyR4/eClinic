<?php

namespace Tests\Unit;

use App\Models\Patient;
use App\Repositories\Contracts\PatientRepositoryInterface;
use App\Services\PatientService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Mockery;
use Tests\TestCase;

class PatientServiceTest extends TestCase
{
    use RefreshDatabase;

    protected PatientService $service;
    protected $mockRepository;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mockRepository = Mockery::mock(PatientRepositoryInterface::class);
        $this->service = new PatientService($this->mockRepository);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /**
     * Test getting all patients.
     */
    public function test_get_all_patients(): void
    {
        $patients = Patient::factory()->count(3)->make();
        
        $this->mockRepository
            ->shouldReceive('all')
            ->once()
            ->with([])
            ->andReturn($patients);

        $result = $this->service->getAllPatients();

        $this->assertInstanceOf(Collection::class, $result);
        $this->assertCount(3, $result);
    }

    /**
     * Test getting paginated patients.
     */
    public function test_get_paginated_patients(): void
    {
        $paginator = new LengthAwarePaginator(
            Patient::factory()->count(2)->make(),
            10,
            15,
            1
        );

        $this->mockRepository
            ->shouldReceive('paginate')
            ->once()
            ->with(15, [])
            ->andReturn($paginator);

        $result = $this->service->getPaginatedPatients(15);

        $this->assertInstanceOf(LengthAwarePaginator::class, $result);
    }

    /**
     * Test creating a patient.
     */
    public function test_create_patient(): void
    {
        $patientData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
        ];

        $patient = Patient::factory()->make($patientData);

        $this->mockRepository
            ->shouldReceive('findByEmail')
            ->once()
            ->with('john@example.com')
            ->andReturn(null);

        $this->mockRepository
            ->shouldReceive('create')
            ->once()
            ->with($patientData)
            ->andReturn($patient);

        $result = $this->service->createPatient($patientData);

        $this->assertInstanceOf(Patient::class, $result);
    }

    /**
     * Test validation error on duplicate email.
     */
    public function test_create_patient_with_duplicate_email_throws_exception(): void
    {
        $patientData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
        ];

        $existingPatient = Patient::factory()->make();

        $this->mockRepository
            ->shouldReceive('findByEmail')
            ->once()
            ->with('john@example.com')
            ->andReturn($existingPatient);

        $this->expectException(\Illuminate\Validation\ValidationException::class);

        $this->service->createPatient($patientData);
    }
}

