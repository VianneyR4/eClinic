<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class Doctor extends Model implements JWTSubject
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'specialty',
        'id_number',
        'address',
        'photo',
        'password',
    ];

    protected $casts = [
        'address' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'password' => 'hashed',
    ];

    protected $hidden = [
        'password',
    ];

    /**
     * Get the doctor's full name.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Get formatted address string.
     */
    public function getFormattedAddressAttribute(): string
    {
        if (!$this->address || !is_array($this->address)) {
            return '';
        }

        $parts = array_filter([
            $this->address['street'] ?? null,
            $this->address['city'] ?? null,
            $this->address['state'] ?? null,
            $this->address['zipCode'] ?? null,
        ]);

        return implode(', ', $parts);
    }

    // JWTSubject implementation
    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return ['type' => 'doctor'];
    }
}

