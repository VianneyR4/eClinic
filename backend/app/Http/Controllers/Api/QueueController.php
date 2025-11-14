<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QueueItem;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(
 *   name="Queue",
 *   description="Patient queue management endpoints"
 * )
 */
class QueueController extends Controller
{
    /**
     * Display a listing of queue items.
     *
     * @OA\Get(
     *   path="/api/v1/queue",
     *   tags={"Queue"},
     *   summary="List queue items",
     *   @OA\Parameter(name="status", in="query", @OA\Schema(type="string", enum={"waiting","in_progress","done","canceled"})),
     *   @OA\Parameter(name="queue_date", in="query", @OA\Schema(type="string", format="date")),
     *   @OA\Response(response=200, description="OK")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Check if queue_items table exists
            if (!Schema::hasTable('queue_items')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Queue items table does not exist. Please run migrations.',
                    'error' => 'Table "queue_items" not found. Run: docker-compose exec app php artisan migrate',
                ], 500);
            }

            $status = $request->get('status');
            $queueDate = $request->get('queue_date', now()->format('Y-m-d'));

            $query = QueueItem::with('patient')
                ->whereDate('queue_date', $queueDate);

            if ($status) {
                $query->where('status', $status);
            }

            $items = $query->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'patientId' => $item->patient_id,
                        'tokenNumber' => $item->token_number,
                        'triageLevel' => $item->triage_level,
                        'status' => $item->status,
                        'queueDate' => $item->queue_date->format('Y-m-d'),
                        'createdAt' => $item->created_at->toISOString(),
                        'patient' => $item->patient ? [
                            'id' => $item->patient->id,
                            'firstName' => $item->patient->first_name,
                            'lastName' => $item->patient->last_name,
                            'fullName' => $item->patient->full_name,
                            'email' => $item->patient->email,
                            'phone' => $item->patient->phone,
                            'photo' => $item->patient->photo,
                            'address' => $item->patient->formatted_address,
                        ] : null,
                    ];
                });

            // Sort by status first, then by triage level (higher first), then by createdAt
            $sortedItems = $items->sortBy(function ($item) {
                $triagePriority = [
                    'critical' => 4,
                    'high' => 3,
                    'medium' => 2,
                    'low' => 1,
                ];
                return [
                    $item['status'],
                    -($triagePriority[$item['triageLevel']] ?? 2), // Negative for descending
                    strtotime($item['createdAt']),
                ];
            })->values();

            return response()->json([
                'success' => true,
                'data' => $sortedItems,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching queue items: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch queue items.',
            ], 500);
        }
    }

    /**
     * Store a newly created queue item.
     *
     * @OA\Post(
     *   path="/api/v1/queue",
     *   tags={"Queue"},
     *   summary="Create queue item",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(required={"patientId","triageLevel"},
     *       @OA\Property(property="patientId", type="integer"),
     *       @OA\Property(property="triageLevel", type="string", enum={"low","medium","high","critical"}),
     *       @OA\Property(property="status", type="string", enum={"waiting","in_progress","done","canceled"})
     *     )
     *   ),
     *   @OA\Response(response=201, description="Created"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'patientId' => 'required|exists:patients,id',
                'triageLevel' => 'required|in:low,medium,high,critical',
                'status' => 'sometimes|in:waiting,in_progress,done,canceled',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $queueDate = $request->get('queue_date', now()->format('Y-m-d'));
            $tokenNumber = QueueItem::generateTokenNumber();

            $queueItem = QueueItem::create([
                'patient_id' => $request->patientId,
                'token_number' => $tokenNumber,
                'triage_level' => $request->triageLevel,
                'status' => $request->get('status', 'waiting'),
                'queue_date' => $queueDate,
            ]);

            $queueItem->load('patient');

            return response()->json([
                'success' => true,
                'message' => 'Queue item created successfully.',
                'data' => [
                    'id' => $queueItem->id,
                    'patientId' => $queueItem->patient_id,
                    'tokenNumber' => $queueItem->token_number,
                    'triageLevel' => $queueItem->triage_level,
                    'status' => $queueItem->status,
                    'queueDate' => $queueItem->queue_date->format('Y-m-d'),
                    'createdAt' => $queueItem->created_at->toISOString(),
                    'patient' => $queueItem->patient ? [
                        'id' => $queueItem->patient->id,
                        'firstName' => $queueItem->patient->first_name,
                        'lastName' => $queueItem->patient->last_name,
                        'fullName' => $queueItem->patient->full_name,
                        'email' => $queueItem->patient->email,
                        'phone' => $queueItem->patient->phone,
                        'photo' => $queueItem->patient->photo,
                        'address' => $queueItem->patient->formatted_address,
                    ] : null,
                ],
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating queue item: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create queue item.',
            ], 500);
        }
    }

    /**
     * Update the specified queue item.
     *
     * @OA\Put(
     *   path="/api/v1/queue/{id}",
     *   tags={"Queue"},
     *   summary="Update queue item",
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\RequestBody(
     *     required=false,
     *     @OA\JsonContent(
     *       @OA\Property(property="status", type="string", enum={"waiting","in_progress","done","canceled"}),
     *       @OA\Property(property="triageLevel", type="string", enum={"low","medium","high","critical"})
     *     )
     *   ),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=404, description="Not found"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $queueItem = QueueItem::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'status' => 'sometimes|in:waiting,in_progress,done,canceled',
                'triageLevel' => 'sometimes|in:low,medium,high,critical',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors' => $validator->errors(),
                ], 422);
            }

            if ($request->has('status')) {
                $queueItem->status = $request->status;
            }

            if ($request->has('triageLevel')) {
                $queueItem->triage_level = $request->triageLevel;
            }

            $queueItem->save();
            $queueItem->load('patient');

            return response()->json([
                'success' => true,
                'message' => 'Queue item updated successfully.',
                'data' => [
                    'id' => $queueItem->id,
                    'patientId' => $queueItem->patient_id,
                    'tokenNumber' => $queueItem->token_number,
                    'triageLevel' => $queueItem->triage_level,
                    'status' => $queueItem->status,
                    'queueDate' => $queueItem->queue_date->format('Y-m-d'),
                    'createdAt' => $queueItem->created_at->toISOString(),
                    'patient' => $queueItem->patient ? [
                        'id' => $queueItem->patient->id,
                        'firstName' => $queueItem->patient->first_name,
                        'lastName' => $queueItem->patient->last_name,
                        'fullName' => $queueItem->patient->full_name,
                        'email' => $queueItem->patient->email,
                        'phone' => $queueItem->patient->phone,
                        'photo' => $queueItem->patient->photo,
                        'address' => $queueItem->patient->formatted_address,
                    ] : null,
                ],
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Queue item not found.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error updating queue item: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update queue item.',
            ], 500);
        }
    }

    /**
     * Remove the specified queue item.
     *
     * @OA\Delete(
     *   path="/api/v1/queue/{id}",
     *   tags={"Queue"},
     *   summary="Delete queue item",
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=404, description="Not found")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $queueItem = QueueItem::findOrFail($id);
            $queueItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Queue item deleted successfully.',
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Queue item not found.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error deleting queue item: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete queue item.',
            ], 500);
        }
    }
}

