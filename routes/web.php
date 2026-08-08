<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TripController;

// Routes inside this can be accessed by anyone
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Routes inside this can only be accessed if the user is authenticated
Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('trips', [TripController::class, 'index'])->name('trips.index'); // GET trips VIEW + ACTION

    Route::get('trips/create', [TripController::class, 'create'])->name('trips.create'); // create trip VIEW
    Route::post('trips', [TripController::class, 'store'])->name('trips.store'); // ACTION create trip  

    Route::get('trips/{trip}/edit', [TripController::class, 'edit'])->name('trips.edit'); // edit trip VIEW
    Route::put('trips/{trip}', [TripController::class, 'update'])->name('trips.update'); // update trip ACTION

    Route::delete('trips/{trip}', [TripController::class, 'destroy'])->name('trips.destroy'); // delete trip ACTION
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
