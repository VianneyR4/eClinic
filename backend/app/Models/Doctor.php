<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

/**
 * Doctor model - now uses users table with role='doctor'
 * This is a compatibility layer after merging doctors into users table
 */
class Doctor extends User implements JWTSubject
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'users';

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Always scope to doctors only
        static::addGlobalScope('doctors', function (EloquentBuilder $builder) {
            $builder->where('role', 'doctor');
        });
    }

    /**
     * Create a new Eloquent query builder for the model.
     *
     * @param  \Illuminate\Database\Query\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder|static
     */
    public function newEloquentBuilder($query)
    {
        return new EloquentBuilder($query);
    }

    /**
     * Override create to set role automatically
     */
    public static function create(array $attributes = [])
    {
        $attributes['role'] = 'doctor';
        
        // Ensure name is set if first_name and last_name are provided
        if (!isset($attributes['name']) && isset($attributes['first_name']) && isset($attributes['last_name'])) {
            $attributes['name'] = $attributes['first_name'] . ' ' . $attributes['last_name'];
        }
        
        return parent::create($attributes);
    }

    /**
     * Override fill to set role automatically
     */
    public function fill(array $attributes)
    {
        $attributes['role'] = 'doctor';
        
        // Ensure name is set if first_name and last_name are provided
        if (!isset($attributes['name']) && isset($attributes['first_name']) && isset($attributes['last_name'])) {
            $attributes['name'] = $attributes['first_name'] . ' ' . $attributes['last_name'];
        }
        
        return parent::fill($attributes);
    }

    // JWTSubject implementation (inherited from User, but override custom claims)
    public function getJWTCustomClaims(): array
    {
        return ['type' => 'doctor', 'role' => 'doctor'];
    }
}

