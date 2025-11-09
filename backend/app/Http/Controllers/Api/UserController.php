<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class UserController extends Controller
{
    /**
     * Display a listing of users. Supports ?role=doctor to list doctors only.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $role = $request->get('role');
            $perPage = $request->get('per_page', 15);
            $query = User::query();
            if ($role) {
                $query->where('role', $role);
            }
            if ($search = $request->get('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'ILIKE', "%{$search}%")
                      ->orWhere('last_name', 'ILIKE', "%{$search}%")
                      ->orWhere('email', 'ILIKE', "%{$search}%");
                });
            }
            $users = $query->paginate($perPage);
            return response()->json([
                'success' => true,
                'data' => $users->items(),
                'meta' => [
                    'current_page' => $users->currentPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                    'last_page' => $users->lastPage(),
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Error listing users: '.$e->getMessage());
            return response()->json(['success'=>false,'message'=>'Failed to fetch users.'],500);
        }
    }

    /**
     * Store a newly created user (doctor).
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->all();
            $request->validate([
                'email' => 'required|email|unique:users,email',
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
            ]);
            $plainPassword = $data['password'] ?? '123456';
            $user = User::create([
                'name' => $data['name'] ?? ($data['first_name'].' '.$data['last_name']),
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'specialty' => $data['specialty'] ?? null,
                'id_number' => $data['id_number'] ?? null,
                'address' => $data['address'] ?? null,
                'photo' => $data['photo'] ?? null,
                'role' => $data['role'] ?? 'user',
                'password' => Hash::make($plainPassword),
            ]);
            // send email if doctor account
            if ($user->role === 'doctor') {
                try {
                    Mail::raw("Hello {$user->first_name},\n\nYour account has been created. Default password: {$plainPassword}\nPlease log in and change your password.", function($m) use ($user){
                        $m->to($user->email)->subject('Your doctor account');
                    });
                } catch (\Throwable $e) { Log::error('Mail send failed: '.$e->getMessage()); }
            }
            return response()->json(['success'=>true,'message'=>'User created.','data'=>$user],201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success'=>false,'message'=>'Validation failed.','errors'=>$e->errors()],422);
        }
    }

    public function show(int $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['success'=>false,'message'=>'User not found.'],404);
        }
        return response()->json(['success'=>true,'data'=>$user]);
    }

    public function update(Request $request,int $id): JsonResponse
    {
        $user = User::find($id);
        if(!$user){return response()->json(['success'=>false,'message'=>'User not found.'],404);}        
        $user->update($request->all());
        return response()->json(['success'=>true,'message'=>'User updated.','data'=>$user]);
    }

    public function destroy(int $id): JsonResponse
    {
        $user = User::find($id);
        if(!$user){return response()->json(['success'=>false,'message'=>'User not found.'],404);}        
        $user->delete();
        return response()->json(['success'=>true,'message'=>'User deleted.']);
    }
}
