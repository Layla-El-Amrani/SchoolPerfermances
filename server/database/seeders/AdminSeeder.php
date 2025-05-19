<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Admin::create([
            'nom' => 'Admin',
            'prenom' => 'System',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            // 'preferences' => json_encode([
            //     'darkMode' => false,
            //     'notifications' => true,
            //     'newsletter' => true,
            //     'language' => 'fr'
            // ])
        ]);
    }
}
