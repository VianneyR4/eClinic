<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Doctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Mail\VerificationCodeMail;
use Illuminate\Database\QueryException;
use PDOException;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenExpiredException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenInvalidException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;
use App\Models\VerificationCode;

class AuthController extends Controller
{
    /**
     * Login user and return token.
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Try login as User (2-step verification)
            $user = User::where('email', $request->email)->first();
            if ($user && Hash::check($request->password, $user->password)) {
                $code = str_pad((string) rand(100000, 999999), 6, '0', STR_PAD_LEFT);
                VerificationCode::create([
                    'user_id' => $user->id,
                    'code' => $code,
                    'used' => false,
                    'expires_at' => now()->addMinutes(15),
                ]);

                try {
                    $this->sendVerificationEmail($user, $code);
                } catch (\Exception $e) {
                    Log::error('Error sending verification email: ' . $e->getMessage());
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Verification code sent. Please check your email to continue.',
                    'requires_verification' => true,
                    'type' => 'user',
                ], 403);
            }

            // Try login as Doctor (password-only)
            $doctor = Doctor::where('email', $request->email)->first();
            if ($doctor && Hash::check($request->password, $doctor->password)) {
                $token = JWTAuth::fromUser($doctor);
                return response()->json([
                    'success' => true,
                    'message' => 'Login successful.',
                    'data' => [
                        'type' => 'doctor',
                        'doctor' => [
                            'id' => $doctor->id,
                            'first_name' => $doctor->first_name,
                            'last_name' => $doctor->last_name,
                            'email' => $doctor->email,
                        ],
                        'token' => $token,
                    ],
                ]);
            }

            // If neither matched
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials.',
            ], 401);
        } catch (QueryException $e) {
            Log::error('Login DB query error: ' . $e->getMessage());

            // Provide a non-technical, user-friendly message
            $message = 'Login Service is temporarily unavailable. Please try again in a moment.';

            return response()->json([
                'success' => false,
                'message' => $message,
            ], 503);
        } catch (PDOException $e) {
            Log::error('Login PDO error: ' . $e->getMessage());

            $message = 'Database connection error. Please check database configuration.';

            return response()->json([
                'success' => false,
                'message' => $message,
            ], 503);
        } catch (\Exception $e) {
            Log::error('Login error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Something went wrong. Please try again.',
            ], 500);
        }
    }

    /**
     * Logout user.
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            // Invalidate the current JWT token
            try {
                JWTAuth::parseToken()->invalidate();
            } catch (\Exception $e) {
                Log::warning('JWT invalidate warning: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Logout successful.',
            ]);
        } catch (\Exception $e) {
            Log::error('Logout error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred during logout.',
            ], 500);
        }
    }

    /**
     * Verify email with code.
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'code' => 'required|string|size:6',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found.',
                ], 404);
            }

            // Find a valid, unused verification code
            $record = VerificationCode::where('user_id', $user->id)
                ->where('code', $request->code)
                ->where('used', false)
                ->where('expires_at', '>', now())
                ->latest('id')
                ->first();

            if (!$record) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired verification code.',
                ], 400);
            }

            // Mark used and verify email timestamp
            $record->update(['used' => true]);
            if (!$user->email_verified_at) {
                $user->forceFill(['email_verified_at' => now()])->save();
            }

            // Create JWT token after verification
            $token = JWTAuth::fromUser($user);

            return response()->json([
                'success' => true,
                'message' => 'Email verified successfully.',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ],
                    'token' => $token,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Email verification error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred during email verification.',
            ], 500);
        }
    }

    /**
     * Resend verification code.
     */
    public function resendVerificationCode(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found.',
                ], 404);
            }

            if ($user->email_verified_at) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email already verified.',
                ], 400);
            }

            // Always create and send a new verification code
            $code = str_pad((string) rand(100000, 999999), 6, '0', STR_PAD_LEFT);
            VerificationCode::create([
                'user_id' => $user->id,
                'code' => $code,
                'used' => false,
                'expires_at' => now()->addMinutes(15),
            ]);

            try {
                $this->sendVerificationEmail($user, $code);
            } catch (\Exception $e) {
                Log::error('Error sending verification email: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send verification email. Please try again.',
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Verification code sent successfully.',
            ]);
        } catch (\Exception $e) {
            Log::error('Resend verification code error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred. Please try again.',
            ], 500);
        }
    }

    /**
     * Get authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        try {
            $principal = JWTAuth::parseToken()->authenticate();
            if (!$principal) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized.',
                ], 401);
            }

            // Determine type and shape accordingly
            if ($principal instanceof User) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'type' => 'user',
                        'id' => $principal->id,
                        'name' => $principal->name,
                        'email' => $principal->email,
                        'email_verified_at' => $principal->email_verified_at,
                    ],
                ]);
            }

            if ($principal instanceof Doctor) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'type' => 'doctor',
                        'id' => $principal->id,
                        'name' => trim(($principal->first_name ?? '') . ' ' . ($principal->last_name ?? '')),
                        'email' => $principal->email,
                    ],
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $principal,
            ]);
        } catch (TokenExpiredException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Session expired. Please log in again.',
            ], 401);
        } catch (TokenInvalidException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token. Please log in again.',
            ], 401);
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Authorization token not found.',
            ], 401);
        } catch (\Exception $e) {
            Log::error('Get user error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred.',
            ], 500);
        }
    }

    /**
     * Send verification email.
     */
    private function sendVerificationEmail(User $user, string $code): void
    {
        try {
            Mail::to($user->email)->send(new VerificationCodeMail($code, $user->name));
        } catch (\Exception $e) {
            Log::error('Mail sending failed: ' . $e->getMessage());
            throw $e;
        }
    }
}

