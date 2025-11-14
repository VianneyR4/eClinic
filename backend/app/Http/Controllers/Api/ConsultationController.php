<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\User;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class ConsultationController extends Controller
{
    /**
     * Create a new consultation (any authenticated user)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $principal = JWTAuth::parseToken()->authenticate();
            if (!$principal || !($principal instanceof User)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized.',
                ], 401);
            }

            $validated = $request->validate([
                'patient_id' => 'required|exists:patients,id',
                'title' => 'nullable|string|max:255',
                'report' => 'nullable|string',
                'vitals' => 'nullable|array',
            ]);

            // Ensure patient exists
            $patient = Patient::find($validated['patient_id']);
            if (!$patient) {
                return response()->json([
                    'success' => false,
                    'message' => 'Patient not found.',
                ], 404);
            }

            $consultation = Consultation::create([
                'patient_id' => $patient->id,
                'doctor_id' => $principal->id,
                'title' => $validated['title'] ?? null,
                'report' => $validated['report'] ?? null,
                'vitals' => $validated['vitals'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Consultation created successfully.',
                'data' => $consultation,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating consultation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create consultation.',
            ], 500);
        }
    }

    /**
     * List consultations for a patient.
     */
    public function indexByPatient(int $id): JsonResponse
    {
        try {
            $patient = Patient::find($id);
            if (!$patient) {
                return response()->json([
                    'success' => false,
                    'message' => 'Patient not found.',
                ], 404);
            }

            $items = Consultation::where('patient_id', $patient->id)
                ->orderByDesc('created_at')
                ->with(['doctor:id,first_name,last_name,name,email,phone,specialty,photo'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => $items,
            ]);
        } catch (\Exception $e) {
            Log::error('Error listing consultations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch consultations.',
            ], 500);
        }
    }

    /**
     * Show a consultation detail.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $consultation = Consultation::with(['patient', 'doctor'])->find($id);
            if (!$consultation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Consultation not found.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $consultation,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching consultation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch consultation.',
            ], 500);
        }
    }

    /**
     * Email a consultation report (HTML) to a provided address.
     */
    public function emailReport(Request $request, int $id): JsonResponse
    {
        try {
            $principal = JWTAuth::parseToken()->authenticate();
            if (!$principal || !($principal instanceof User)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized.',
                ], 401);
            }

            $validated = $request->validate([
                'email' => 'required|email',
                'html' => 'required|string',
            ]);

            $consultation = Consultation::with(['patient', 'doctor'])->find($id);
            if (!$consultation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Consultation not found.',
                ], 404);
            }

            // Send HTML email (simple inline body)
            try {
                $subject = 'Consultation Report #'.$consultation->id.' - eClinic';
                Mail::html($validated['html'], function($m) use ($validated, $subject) {
                    $m->to($validated['email'])->subject($subject);
                });
            } catch (\Throwable $e) {
                Log::error('Error sending consultation report email: '.$e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send email. Please try again later.',
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Consultation report sent successfully.',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Email report error: '.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while sending the email.',
            ], 500);
        }
    }
}
