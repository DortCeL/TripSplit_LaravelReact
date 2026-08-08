<?php

use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\SettlementController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\TripMemberController;
use App\Models\Trip;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        $trips = Trip::query()
            ->whereHas('members', fn ($q) => $q->where('user_id', auth()->id()))
            ->withCount('members')
            ->latest()
            ->take(6)
            ->get();

        return Inertia::render('dashboard', [
            'trips' => $trips,
        ]);
    })->name('dashboard');

    Route::get('trips', [TripController::class, 'index'])->name('trips.index');
    Route::get('trips/create', [TripController::class, 'create'])->name('trips.create');
    Route::post('trips', [TripController::class, 'store'])->name('trips.store');
    Route::get('trips/{trip}', [TripController::class, 'show'])->name('trips.show');
    Route::get('trips/{trip}/edit', [TripController::class, 'edit'])->name('trips.edit');
    Route::put('trips/{trip}', [TripController::class, 'update'])->name('trips.update');
    Route::delete('trips/{trip}', [TripController::class, 'destroy'])->name('trips.destroy');

    Route::get('trips/{trip}/history', [TripController::class, 'history'])->name('trips.history');
    Route::get('trips/{trip}/totals', [TripController::class, 'totals'])->name('trips.totals');

    Route::get('trips/{trip}/members', [TripMemberController::class, 'index'])->name('trips.members.index');
    Route::post('trips/{trip}/members', [TripMemberController::class, 'store'])->name('trips.members.store');
    Route::put('trips/{trip}/members/{member}', [TripMemberController::class, 'update'])->name('trips.members.update');
    Route::delete('trips/{trip}/members/{member}', [TripMemberController::class, 'destroy'])->name('trips.members.destroy');

    Route::get('trips/{trip}/expenses/create', [ExpenseController::class, 'create'])->name('trips.expenses.create');
    Route::post('trips/{trip}/expenses', [ExpenseController::class, 'store'])->name('trips.expenses.store');
    Route::delete('trips/{trip}/expenses/{expense}', [ExpenseController::class, 'destroy'])->name('trips.expenses.destroy');

    Route::get('trips/{trip}/settlements', [SettlementController::class, 'index'])->name('trips.settlements.index');
    Route::post('trips/{trip}/settlements', [SettlementController::class, 'store'])->name('trips.settlements.store');
    Route::post('trips/{trip}/settlements/{settlement}/confirm', [SettlementController::class, 'confirm'])->name('trips.settlements.confirm');
    Route::post('trips/{trip}/settlements/{settlement}/reject', [SettlementController::class, 'reject'])->name('trips.settlements.reject');
    Route::post('trips/{trip}/settlements/forgive', [SettlementController::class, 'forgive'])->name('trips.settlements.forgive');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
