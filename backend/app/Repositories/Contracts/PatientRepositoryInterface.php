<?php

namespace App\Repositories\Contracts;

use App\Models\Patient;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface PatientRepositoryInterface
{
    public function all(array $filters = []): Collection;

    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator;

    public function find(int $id): ?Patient;

    public function findByEmail(string $email): ?Patient;

    public function create(array $data): Patient;

    public function update(int $id, array $data): bool;

    public function delete(int $id): bool;
}

