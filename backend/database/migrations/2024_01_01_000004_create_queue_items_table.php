<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('queue_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->integer('token_number');
            $table->enum('triage_level', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->enum('status', ['waiting', 'in_progress', 'done', 'canceled'])->default('waiting');
            $table->date('queue_date');
            $table->timestamps();

            $table->index(['status', 'queue_date']);
            $table->index(['triage_level', 'status']);
            $table->index(['token_number', 'queue_date']);
            $table->unique(['token_number', 'queue_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('queue_items');
    }
};

