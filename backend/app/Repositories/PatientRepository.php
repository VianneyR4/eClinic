<?php

namespace App\Repositories;

use App\Models\Patient;
use App\Repositories\Contracts\PatientRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class PatientRepository implements PatientRepositoryInterface
{
    protected Patient $model;

    public function __construct(Patient $model)
    {
        $this->model = $model;
    }

    public function all(array $filters = []): Collection
    {
        $query = $this->model->newQuery();

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('id_number', 'like', "%{$search}%");
            });
        }

        if (isset($filters['email'])) {
            $query->where('email', $filters['email']);
        }

        return $query->get();
    }

    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('id_number', 'like', "%{$search}%");
            });
        }

        if (isset($filters['email'])) {
            $query->where('email', $filters['email']);
        }

        return $query->paginate($perPage);
    }

    public function find(int $id): ?Patient
    {
        return $this->model->find($id);
    }

    public function findByEmail(string $email): ?Patient
    {
        return $this->model->where('email', $email)->first();
    }

    public function create(array $data): Patient
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): bool
    {
        $patient = $this->find($id);
        
        if (!$patient) {
            return false;
        }

        return $patient->update($data);
    }

    public function delete(int $id): bool
    {
        $patient = $this->find($id);
        
        if (!$patient) {
            return false;
        }

        return $patient->delete();
    }
}

