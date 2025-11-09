<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            if (!Schema::hasColumn('doctors', 'password')) {
                $table->string('password')->nullable()->after('photo');
            }
        });

        // Make email required (cannot easily change nullability if rows exist without email)
        // We will enforce at application level and try to set not nullable if all rows have email
        if (Schema::hasColumn('doctors', 'email')) {
            try {
                Schema::table('doctors', function (Blueprint $table) {
                    $table->string('email')->nullable(false)->unique()->change();
                });
            } catch (\Throwable $e) {
                // Leave as-is if change fails; validation will enforce requirement
            }
        }
    }

    public function down(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            if (Schema::hasColumn('doctors', 'password')) {
                $table->dropColumn('password');
            }
            if (Schema::hasColumn('doctors', 'email')) {
                try {
                    $table->string('email')->nullable()->unique()->change();
                } catch (\Throwable $e) {
                    // ignore
                }
            }
        });
    }
};
