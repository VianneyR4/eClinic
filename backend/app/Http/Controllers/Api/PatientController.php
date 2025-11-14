<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PatientService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(
 *   name="Patients",
 *   description="Patient management endpoints"
 * )
 */
class PatientController extends Controller
{
    protected PatientService $patientService;

    public function __construct(PatientService $patientService)
    {
        $this->patientService = $patientService;
    }

    /**
     * Display a listing of patients.
     *
     * @OA\Get(
     *   path="/api/v1/patients",
     *   tags={"Patients"},
     *   summary="List patients",
     *   @OA\Parameter(name="per_page", in="query", description="Items per page", @OA\Schema(type="integer")),
     *   @OA\Parameter(name="search", in="query", description="Search query", @OA\Schema(type="string")),
     *   @OA\Response(response=200, description="OK")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 15);
            $filters = $request->only(['search', 'email']);

            $patients = $this->patientService->getPaginatedPatients($perPage, $filters);

            return response()->json([
                'success' => true,
                'data' => $patients->items(),
                'meta' => [
                    'current_page' => $patients->currentPage(),
                    'per_page' => $patients->perPage(),
                    'total' => $patients->total(),
                    'last_page' => $patients->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching patients: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch patients.',
            ], 500);
        }
    }

    /**
     * Store a newly created patient.
     *
     * @OA\Post(
     *   path="/api/v1/patients",
     *   tags={"Patients"},
     *   summary="Create patient",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(type="object")
     *   ),
     *   @OA\Response(response=201, description="Created"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->all();
            
            // Transform camelCase to snake_case for database
            $data = $this->transformToSnakeCase($data);

            $patient = $this->patientService->createPatient($data);

            return response()->json([
                'success' => true,
                'message' => 'Patient created successfully.',
                'data' => $patient,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating patient: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create patient.',
            ], 500);
        }
    }

    /**
     * Display the specified patient.
     *
     * @OA\Get(
     *   path="/api/v1/patients/{id}",
     *   tags={"Patients"},
     *   summary="Get patient",
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=404, description="Not found")
     * )
     */
    public function show(int $id): JsonResponse
    {
        try {
            $patient = $this->patientService->getPatientById($id);

            if (!$patient) {
                return response()->json([
                    'success' => false,
                    'message' => 'Patient not found.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $patient,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching patient: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch patient.',
            ], 500);
        }
    }

    /**
     * Update the specified patient.
     *
     * @OA\Put(
     *   path="/api/v1/patients/{id}",
     *   tags={"Patients"},
     *   summary="Update patient",
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(type="object")
     *   ),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=404, description="Not found"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $data = $request->all();
            
            // Transform camelCase to snake_case for database
            $data = $this->transformToSnakeCase($data);

            $patient = $this->patientService->updatePatient($id, $data);

            return response()->json([
                'success' => true,
                'message' => 'Patient updated successfully.',
                'data' => $patient,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating patient: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Failed to update patient.',
            ], $e->getMessage() === 'Patient not found.' ? 404 : 500);
        }
    }

    /**
     * Remove the specified patient.
     *
     * @OA\Delete(
     *   path="/api/v1/patients/{id}",
     *   tags={"Patients"},
     *   summary="Delete patient",
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=404, description="Not found")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->patientService->deletePatient($id);

            return response()->json([
                'success' => true,
                'message' => 'Patient deleted successfully.',
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting patient: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Failed to delete patient.',
            ], $e->getMessage() === 'Patient not found.' ? 404 : 500);
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

