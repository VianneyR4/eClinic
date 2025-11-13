<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add doctor-specific columns + role to users table
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'first_name')) {
                $table->string('first_name')->nullable()->after('name');
            }
            if (!Schema::hasColumn('users', 'last_name')) {
                $table->string('last_name')->nullable()->after('first_name');
            }
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'specialty')) {
                $table->string('specialty')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('users', 'id_number')) {
                $table->string('id_number')->nullable()->unique()->after('specialty');
            }
            if (!Schema::hasColumn('users', 'address')) {
                $table->json('address')->nullable()->after('id_number');
            }
            if (!Schema::hasColumn('users', 'photo')) {
                $table->string('photo')->nullable()->after('address');
            }
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('user')->after('photo')->index();
            }
        });

        // 2. Move existing doctors into users table
        if (Schema::hasTable('doctors')) {
            // Check if password column exists in doctors table
            $hasPasswordColumn = Schema::hasColumn('doctors', 'password');
            
            if ($hasPasswordColumn) {
                // Insert doctors rows into users with role='doctor' (with password)
                DB::statement("INSERT INTO users (name, first_name, last_name, email, phone, specialty, id_number, address, photo, password, role, created_at, updated_at) 
                    SELECT CONCAT(first_name,' ',last_name), first_name, last_name, email, phone, specialty, id_number, address, photo, COALESCE(password,''), 'doctor', NOW(), NOW() 
                    FROM doctors 
                    ON CONFLICT (email) DO NOTHING");
            } else {
                // Insert doctors rows into users with role='doctor' (without password - will be empty string)
                DB::statement("INSERT INTO users (name, first_name, last_name, email, phone, specialty, id_number, address, photo, password, role, created_at, updated_at) 
                    SELECT CONCAT(first_name,' ',last_name), first_name, last_name, email, phone, specialty, id_number, address, photo, '', 'doctor', NOW(), NOW() 
                    FROM doctors 
                    ON CONFLICT (email) DO NOTHING");
            }
        }

        // 3. Update consultations foreign key to reference users.id (if consultations exists)
        if (Schema::hasTable('consultations')) {
            // Drop old FK if exists
            DB::statement("ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_doctor_id_foreign");
            // Ensure doctor_id column exists; keep same name but point to users
            DB::statement("ALTER TABLE consultations ADD CONSTRAINT consultations_doctor_id_foreign FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE");
        }

        // 4. Drop doctors table
        Schema::dropIfExists('doctors');
    }

    public function down(): void
    {
        // Not fully reversible; just recreate doctors table minimally
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('specialty')->nullable();
            $table->string('id_number')->nullable()->unique();
            $table->json('address')->nullable();
            $table->string('photo')->nullable();
            $table->string('password')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Move back doctors with role='doctor'
        DB::statement("INSERT INTO doctors (first_name, last_name, email, phone, specialty, id_number, address, photo, password, created_at, updated_at) \n            SELECT first_name, last_name, email, phone, specialty, id_number, address, photo, password, NOW(), NOW() FROM users WHERE role='doctor'");

        // Remove role and doctor-specific columns from users (safe drop if exists)
        Schema::table('users', function (Blueprint $table) {
            foreach (['first_name','last_name','phone','specialty','id_number','address','photo','role'] as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
