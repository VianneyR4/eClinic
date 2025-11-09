<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Search patients and doctors.
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q', '');
        
        if (empty($query)) {
            return response()->json([
                'success' => true,
                'data' => [
                    'patients' => [],
                    'doctors' => [],
                ],
            ]);
        }

        $searchTerm = '%' . $query . '%';

        // Search patients
        $patients = Patient::where(function ($q) use ($searchTerm) {
            $q->where('first_name', 'LIKE', $searchTerm)
              ->orWhere('last_name', 'LIKE', $searchTerm)
              ->orWhere('email', 'LIKE', $searchTerm)
              ->orWhere('phone', 'LIKE', $searchTerm)
              ->orWhere('id_number', 'LIKE', $searchTerm);
        })
        ->whereNull('deleted_at') // Exclude soft-deleted patients
        ->limit(10)
        ->get()
        ->map(function ($patient) {
            return [
                'id' => $patient->id,
                'firstName' => $patient->first_name,
                'lastName' => $patient->last_name,
                'fullName' => $patient->full_name,
                'email' => $patient->email,
                'phone' => $patient->phone,
                'idNumber' => $patient->id_number,
                'photo' => $patient->photo,
                'address' => $patient->formatted_address,
            ];
        });

        // Search users (treated as doctors)
        $doctors = User::where(function ($q) use ($searchTerm) {
            $q->where('first_name', 'LIKE', $searchTerm)
              ->orWhere('last_name', 'LIKE', $searchTerm)
              ->orWhere('name', 'LIKE', $searchTerm)
              ->orWhere('email', 'LIKE', $searchTerm)
              ->orWhere('phone', 'LIKE', $searchTerm)
              ->orWhere('id_number', 'LIKE', $searchTerm)
              ->orWhere('specialty', 'LIKE', $searchTerm);
        })
        ->limit(10)
        ->get()
        ->map(function ($user) {
            $first = $user->first_name;
            $last = $user->last_name;
            $full = trim(($first ?? '').' '.($last ?? ''));
            if ($full === '') {
                $full = $user->name ?: null;
                if ($full) {
                    $parts = preg_split('/\s+/', $full);
                    $first = $first ?: ($parts[0] ?? null);
                    $last = $last ?: (isset($parts[1]) ? implode(' ', array_slice($parts, 1)) : null);
                }
            }
            return [
                'id' => $user->id,
                'firstName' => $first,
                'lastName' => $last,
                'fullName' => $full,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'idNumber' => $user->id_number,
                'photo' => $user->photo,
                'specialty' => $user->specialty,
                'address' => $user->address,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'patients' => $patients,
                'doctors' => $doctors,
            ],
        ]);
    }
}

