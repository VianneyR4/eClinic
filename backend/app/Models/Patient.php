<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'id_number',
        'date_of_birth',
        'address',
        'medical_history',
        'photo',
    ];

    protected $casts = [
        'date_of_birth' => 'datetime',
        'birthday' => 'date',
        'address' => 'array',
        'medical_history' => 'array',
        'vital_signs' => 'array',
        'last_visited_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the patient's full name.
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

    /**
     * Get the queue items for the patient.
     */
    public function queueItems()
    {
        return $this->hasMany(QueueItem::class);
    }
}

