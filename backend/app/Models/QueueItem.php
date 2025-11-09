<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class QueueItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'token_number',
        'triage_level',
        'status',
        'queue_date',
    ];

    protected $casts = [
        'queue_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($queueItem) {
            if (empty($queueItem->queue_date)) {
                $queueItem->queue_date = now()->toDateString();
            }
        });
    }

    /**
     * Get the patient that owns the queue item.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Generate the next token number for today.
     */
    public static function generateTokenNumber(): int
    {
        $today = now()->format('Y-m-d');
        
        $lastToken = self::whereDate('queue_date', $today)
            ->max('token_number');

        return ($lastToken ?? 0) + 1;
    }

    /**
     * Scope a query to only include items for today.
     */
    public function scopeToday($query)
    {
        return $query->whereDate('queue_date', now()->toDateString());
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Get triage level priority (higher number = higher priority).
     */
    public function getTriagePriorityAttribute(): int
    {
        return match($this->triage_level) {
            'critical' => 4,
            'high' => 3,
            'medium' => 2,
            'low' => 1,
            default => 2,
        };
    }
}

