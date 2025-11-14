<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'doctor@gmail.com'],
            [
                'name' => 'Doctor Admin',
                'password' => Hash::make('123456'),
                'email_verified_at' => null,
            ]
        );

        if ($admin->wasRecentlyCreated) {
            $this->command->info('Doctor Admin created successfully!');
            $this->command->info('Email: doctor@gmail.com');
            $this->command->info('Password: 123456');
        } else {
            $this->command->info('Doctor Admin already exists.');
        }
    }
}

