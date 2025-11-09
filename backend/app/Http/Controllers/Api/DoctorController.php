<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class DoctorController extends Controller
{
    /**
     * Display a listing of doctors.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Check if doctors table exists
            if (!Schema::hasTable('doctors')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Doctors table does not exist. Please run migrations.',
                    'error' => 'Table "doctors" not found. Run: docker-compose exec app php artisan migrate',
                ], 500);
            }

            $perPage = $request->get('per_page', 15);
            $filters = $request->only(['search', 'email', 'specialty']);

            $query = Doctor::query();

            if (isset($filters['search'])) {
                $search = $filters['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'LIKE', "%{$search}%")
                      ->orWhere('last_name', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%")
                      ->orWhere('phone', 'LIKE', "%{$search}%")
                      ->orWhere('id_number', 'LIKE', "%{$search}%");
                });
            }

            if (isset($filters['email'])) {
                $query->where('email', $filters['email']);
            }

            if (isset($filters['specialty'])) {
                $query->where('specialty', 'LIKE', "%{$filters['specialty']}%");
            }

            $doctors = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $doctors->items(),
                'meta' => [
                    'current_page' => $doctors->currentPage(),
                    'per_page' => $doctors->perPage(),
                    'total' => $doctors->total(),
                    'last_page' => $doctors->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching doctors: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch doctors.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Store a newly created doctor.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->all();
            
            // Transform camelCase to snake_case for database
            $data = $this->transformToSnakeCase($data);

            // Validation: email required and unique
            $request->validate([
                'email' => 'required|email|unique:doctors,email',
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
            ]);

            // Default password if not provided
            $plainPassword = $data['password'] ?? '123456';
            $data['password'] = Hash::make($plainPassword);

            $doctor = Doctor::create($data);

            // Try to send notification email (best-effort)
            try {
                if (!empty($doctor->email)) {
                    Mail::raw(
                        "Hello {$doctor->first_name},\n\nYour account has been created.\nDefault password: {$plainPassword}\nPlease log in and change your password.",
                        function ($message) use ($doctor) {
                            $message->to($doctor->email)
                                    ->subject('Your doctor account has been created');
                        }
                    );
                }
            } catch (\Throwable $e) {
                Log::error('Error sending doctor creation email: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Doctor created successfully.',
                'data' => $doctor,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating doctor: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create doctor.',
            ], 500);
        }
    }

    /**
     * Display the specified doctor.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $doctor = Doctor::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $doctor,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Doctor not found.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error fetching doctor: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch doctor.',
            ], 500);
        }
    }

    /**
     * Update the specified doctor.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $data = $request->all();
            
            // Transform camelCase to snake_case for database
            $data = $this->transformToSnakeCase($data);

            $doctor = Doctor::findOrFail($id);
            $doctor->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Doctor updated successfully.',
                'data' => $doctor,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Doctor not found.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error updating doctor: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update doctor.',
            ], 500);
        }
    }

    /**
     * Remove the specified doctor.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $doctor = Doctor::findOrFail($id);
            $doctor->delete();

            return response()->json([
                'success' => true,
                'message' => 'Doctor deleted successfully.',
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Doctor not found.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error deleting doctor: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete doctor.',
            ], 500);
        }
    }

    /**
     * Transform camelCase keys to snake_case
     */
    protected function transformToSnakeCase(array $data): array
    {
        $transformed = [];

        foreach ($data as $key => $value) {
            $snakeKey = str_replace(' ', '_', strtolower(preg_replace('/([A-Z])/', '_$1', $key)));
            $snakeKey = ltrim($snakeKey, '_');
            
            if (is_array($value)) {
                $transformed[$snakeKey] = $this->transformToSnakeCase($value);
            } else {
                $transformed[$snakeKey] = $value;
            }
        }

        return $transformed;
    }
}

