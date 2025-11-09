<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'last_visited_at')) {
                $table->timestamp('last_visited_at')->nullable()->after('updated_at');
            }
            if (!Schema::hasColumn('patients', 'birthday')) {
                $table->date('birthday')->nullable()->after('date_of_birth');
            }
            if (!Schema::hasColumn('patients', 'blood_group')) {
                $table->string('blood_group', 3)->nullable()->after('birthday');
            }
            if (!Schema::hasColumn('patients', 'gender')) {
                $table->string('gender', 10)->nullable()->after('blood_group');
            }
            if (!Schema::hasColumn('patients', 'vital_signs')) {
                $table->json('vital_signs')->nullable()->after('medical_history');
            }
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            foreach (['last_visited_at', 'birthday', 'blood_group', 'gender', 'vital_signs'] as $col) {
                if (Schema::hasColumn('patients', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
