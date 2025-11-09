<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\QueueItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class QueueItemFactory extends Factory
{
    protected $model = QueueItem::class;

    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'token_number' => QueueItem::generateTokenNumber(),
            'triage_level' => $this->faker->randomElement(['low', 'medium', 'high', 'critical']),
            'status' => $this->faker->randomElement(['waiting', 'in_progress', 'done', 'canceled']),
            'queue_date' => now()->toDateString(),
        ];
    }
}

