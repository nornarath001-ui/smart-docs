<?php
use App\Http\Controllers\Api\Manager\UserController as ManagerUserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\DocumentController;
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

    Route::middleware(['auth:sanctum', 'active'])->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::get('/dashboard', function () {
        return response()->json([
            'message' => 'Dashboard access granted.',
            'user' => request()->user()->only('id', 'name', 'email'),
            'roles' => request()->user()->getRoleNames(),
            'permissions' => request()->user()->getAllPermissions()->pluck('name'),
        ]);
    })->middleware('permission:dashboard.view');

    Route::prefix('admin')->middleware('role:Admin')->group(function () {
        Route::apiResource('users', UserController::class);
    });

    Route::prefix('manager')->middleware('role:Admin|Manager')->group(function () {
        Route::get('/documents', function () {
            return response()->json(['message' => 'Manager document access granted.']);
        })->middleware('permission:documents.view');
    });

    Route::prefix('staff')->middleware('role:Admin|Manager|Staff')->group(function () {
        Route::get('/documents', function () {
            return response()->json(['message' => 'Document access granted.']);
        })->middleware('permission:documents.view');

        Route::get('/assistant', function () {
            return response()->json(['message' => 'AI assistant access granted.']);
        })->middleware('permission:ai.use');
    });


    Route::get('/dashboard', function () {
    return response()->json([
        'message' => 'Dashboard access granted.',
        'user' => request()->user()->only('id', 'name', 'email'),
        'roles' => request()->user()->getRoleNames(),
        'permissions' => request()->user()->getAllPermissions()->pluck('name'),
    ]);
})->middleware('permission:dashboard.view');
});

Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::prefix('documents')->group(function () {
        Route::get('/', [DocumentController::class, 'index'])->middleware('permission:documents.view');
        Route::post('/', [DocumentController::class, 'store'])->middleware('permission:documents.create');
        Route::get('/{document}', [DocumentController::class, 'show'])->middleware('permission:documents.view');
        Route::put('/{document}', [DocumentController::class, 'update'])->middleware('permission:documents.update');
        Route::delete('/{document}', [DocumentController::class, 'destroy'])->middleware('permission:documents.delete');
        Route::get('/{document}/preview', [DocumentController::class, 'preview'])->middleware('permission:documents.view');
        Route::get('/{document}/download', [DocumentController::class, 'download'])->middleware('permission:documents.view');
    });
});
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

Route::get('/dashboard', function () {
    $users = Schema::hasTable('users')
        ? DB::table('users')->where('is_active', true)->count()
        : 0;

    $documents = Schema::hasTable('documents')
        ? DB::table('documents')->count()
        : 0;

    $pending = Schema::hasTable('documents') && Schema::hasColumn('documents', 'status')
        ? DB::table('documents')->where('status', 'pending')->count()
        : 0;

    $recent = [];

    if (Schema::hasTable('documents')) {
        $recent = DB::table('documents')
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(fn ($doc) => [
                'id' => $doc->id,
                'name' => $doc->name ?? 'Untitled document',
                'owner' => null,
                'status' => $doc->status ?? 'uploaded',
            ]);
    }

    return response()->json([
        'message' => 'Dashboard data loaded.',
        'user' => request()->user()->only('id', 'name', 'email'),
        'stats' => [
            'documents' => $documents,
            'storage' => '0 MB',
            'users' => $users,
            'pending' => $pending,
        ],
        'recent_documents' => $recent,
    ]);


    Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1');

    Route::post('/register', [AuthController::class, 'register'])
        ->middleware('throttle:5,1');

    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
        ->middleware('throttle:5,1');

    Route::post('/reset-password', [AuthController::class, 'resetPassword'])
        ->middleware('throttle:5,1');

    Route::middleware(['auth:sanctum', 'active'])->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::prefix('admin')->middleware('role:Admin')->group(function () {
    Route::apiResource('users', UserController::class);
});
Route::prefix('manager')
    ->middleware('role:Admin|Manager')
    ->group(function () {
        Route::get('/users', [ManagerUserController::class, 'index'])
            ->middleware('permission:users.view');
    });


    Route::prefix('documents')->group(function () {
    Route::get('/', [DocumentController::class, 'index'])
        ->middleware('permission:documents.view');

    Route::post('/', [DocumentController::class, 'store'])
        ->middleware('permission:documents.create');

    Route::get('/{document}', [DocumentController::class, 'show'])
        ->middleware('permission:documents.view');

    Route::put('/{document}', [DocumentController::class, 'update'])
        ->middleware('permission:documents.update');

    Route::delete('/{document}', [DocumentController::class, 'destroy'])
        ->middleware('permission:documents.delete');

    Route::get('/{document}/preview', [DocumentController::class, 'preview'])
        ->middleware('permission:documents.view');

    Route::get('/{document}/download', [DocumentController::class, 'download'])
        ->middleware('permission:documents.view');
});
})->middleware('permission:dashboard.view');
