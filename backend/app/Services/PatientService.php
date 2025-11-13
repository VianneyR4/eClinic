<?php

namespace App\Services;

use App\Models\Patient;
use App\Repositories\Contracts\PatientRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class PatientService
{
    protected PatientRepositoryInterface $repository;

    public function __construct(PatientRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get all patients with optional filters
     */
    public function getAllPatients(array $filters = []): Collection
    {
        return $this->repository->all($filters);
    }

    /**
     * Get paginated patients
     */
    public function getPaginatedPatients(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        return $this->repository->paginate($perPage, $filters);
    }

    /**
     * Get a patient by ID
     */
    public function getPatientById(int $id): ?Patient
    {
        return $this->repository->find($id);
    }

    /**
     * Create a new patient
     */
    public function createPatient(array $data): Patient
    {
        $this->validatePatientData($data);

        // Check if email already exists
        if (isset($data['email']) && $this->repository->findByEmail($data['email'])) {
            throw ValidationException::withMessages([
                'email' => ['A patient with this email already exists.'],
            ]);
        }

        return $this->repository->create($data);
    }

    /**
     * Update a patient
     */
    public function updatePatient(int $id, array $data): Patient
    {
        $patient = $this->repository->find($id);

        if (!$patient) {
            throw new \Exception('Patient not found.');
        }

        $this->validatePatientData($data, $id);

        // Check if email already exists (excluding current patient)
        if (isset($data['email'])) {
            $existingPatient = $this->repository->findByEmail($data['email']);
            if ($existingPatient && $existingPatient->id !== $id) {
                throw ValidationException::withMessages([
                    'email' => ['A patient with this email already exists.'],
                ]);
            }
        }

        $this->repository->update($id, $data);

        return $this->repository->find($id);
    }

    /**
     * Delete a patient
     */
    public function deletePatient(int $id): bool
    {
        $patient = $this->repository->find($id);

        if (!$patient) {
            throw new \Exception('Patient not found.');
        }

        return $this->repository->delete($id);
    }

    /**
     * Validate patient data
     */
    protected function validatePatientData(array $data, ?int $patientId = null): void
    {
        $rules = [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'id_number' => 'nullable|string|max:50',
            'photo' => 'nullable|string|max:255',
            'date_of_birth' => 'nullable|date',
            'birthday' => 'nullable|date',
            'blood_group' => 'nullable|string|in:O+,O-,A+,A-,B+,B-,AB+,AB-',
            'gender' => 'nullable|string|in:Male,Female',
            'address' => 'nullable|array',
            'address.street' => 'nullable|string|max:255',
            'address.city' => 'nullable|string|max:255',
            'address.state' => 'nullable|string|max:255',
            'address.zip_code' => 'nullable|string|max:20',
            'address.zipCode' => 'nullable|string|max:20',
            'medical_history' => 'nullable|array',
            'medical_history.*.condition' => 'nullable|string|max:255',
            'medical_history.*.diagnosis_date' => 'nullable|date',
            'medical_history.*.notes' => 'nullable|string',
            'vital_signs' => 'nullable|array',
            'vital_signs.blood_pressure' => 'nullable|string|max:50',
            'vital_signs.heart_rate' => 'nullable|numeric',
            'vital_signs.spo2' => 'nullable|numeric',
            'vital_signs.temperature' => 'nullable|numeric',
            'vital_signs.respiratory_rate' => 'nullable|numeric',
            'vital_signs.weight' => 'nullable|numeric',
            'last_visited_at' => 'nullable|date',
        ];

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }
    }
}

