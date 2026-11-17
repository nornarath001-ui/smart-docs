
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'dashboard.view',
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'roles.view',
            'roles.manage',
            'documents.view',
            'documents.create',
            'documents.update',
            'documents.delete',
            'documents.approve',
            'categories.view',
            'categories.manage',
            'activity.view',
            'settings.manage',
            'ai.use',
        ];

        // Create all permissions.
        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        // Create roles.
        $admin = Role::firstOrCreate([
            'name' => 'Admin',
            'guard_name' => 'web',
        ]);

        $manager = Role::firstOrCreate([
            'name' => 'Manager',
            'guard_name' => 'web',
        ]);

        $staff = Role::firstOrCreate([
            'name' => 'Staff',
            'guard_name' => 'web',
        ]);

        // Admin: all permissions.
        $admin->syncPermissions(Permission::where('guard_name', 'web')->get());

        // Manager: manage operational data, but not system settings or roles.
        $manager->syncPermissions([
            'dashboard.view',
            'users.view',
            'documents.view',
            'documents.create',
            'documents.update',
            'documents.approve',
            'categories.view',
            'ai.use',
            'activity.view',
        ]);

        // Staff: basic document access.
        $staff->syncPermissions([
            'dashboard.view',
            'documents.view',
            'documents.create',
            'ai.use',
        ]);

        // Create the initial administrator using environment variables.
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        if ($email && $password) {
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => 'System Administrator',
                    'password' => Hash::make($password),
                    'is_active' => true,
                ]
            );

            $user->syncRoles([$admin]);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
