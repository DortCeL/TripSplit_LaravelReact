<?php

namespace App\Http\Controllers;

use App\Enums\TripMemberRole;
use App\Enums\TripStatus;
use App\Models\Trip;
use App\Models\TripMember;
use App\Services\BalanceCalculator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TripController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Trip::class);

        $trips = Trip::query()
            ->whereHas('members', fn ($q) => $q->where('user_id', $request->user()->id))
            ->withCount('members')
            ->with('owner:id,name')
            ->latest()
            ->get();

        return Inertia::render('Trips/Index', [
            'trips' => $trips,
        ]);
    }

    public function create()
    {
        $this->authorize('create', Trip::class);

        return Inertia::render('Trips/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', Trip::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $trip = DB::transaction(function () use ($request, $validated) {
            $trip = Trip::create([
                'owner_id' => $request->user()->id,
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'status' => TripStatus::Active,
            ]);

            TripMember::create([
                'trip_id' => $trip->id,
                'user_id' => $request->user()->id,
                'role' => TripMemberRole::Owner,
            ]);

            return $trip;
        });

        Inertia::flash([
            'color' => 'green',
            'message' => 'Trip created successfully',
            'tripName' => $trip->name,
        ]);

        return redirect()->route('trips.show', $trip);
    }

    public function show(Trip $trip, BalanceCalculator $balances)
    {
        $this->authorize('view', $trip);

        $trip->load([
            'owner:id,name',
            'members.user:id,name,email',
            'expenses.items.participants.user:id,name',
            'expenses.items.payments.payer:id,name',
            'expenses.creator:id,name',
        ]);

        return Inertia::render('Trips/Show', [
            'trip' => $trip,
            'balances' => $balances->forTrip($trip),
            'matrix' => $balances->settlementMatrix($trip),
            'canManage' => request()->user()->can('manageExpenses', $trip),
            'canManageMembers' => request()->user()->can('manageMembers', $trip),
            'isOwner' => $trip->isOwner(request()->user()),
        ]);
    }

    public function edit(Trip $trip)
    {
        $this->authorize('update', $trip);

        return Inertia::render('Trips/Edit', [
            'trip' => $trip,
            'isOwner' => $trip->isOwner(request()->user()),
        ]);
    }

    public function update(Request $request, Trip $trip)
    {
        $this->authorize('update', $trip);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:active,completed,archived',
        ]);

        $trip->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? $trip->status,
        ]);

        Inertia::flash([
            'color' => 'green',
            'message' => 'Trip updated successfully',
            'tripName' => $trip->name,
        ]);

        return redirect()->route('trips.show', $trip);
    }

    public function destroy(Trip $trip)
    {
        $this->authorize('delete', $trip);

        $name = $trip->name;

        DB::transaction(function () use ($trip) {
            $trip->load(['expenses.items']);

            foreach ($trip->expenses as $expense) {
                foreach ($expense->items as $item) {
                    $item->payments()->delete();
                    $item->participants()->delete();
                }

                $expense->items()->delete();
            }

            $trip->expenses()->delete();
            $trip->settlements()->delete();
            $trip->members()->delete();
            $trip->delete();
        });

        Inertia::flash([
            'color' => 'red',
            'message' => 'Trip deleted successfully',
            'tripName' => $name,
        ]);

        return redirect()->route('trips.index');
    }

    public function history(Trip $trip)
    {
        $this->authorize('view', $trip);

        $trip->load([
            'expenses.items.participants.user:id,name',
            'expenses.items.payments.payer:id,name',
            'expenses.creator:id,name',
            'settlements.fromUser:id,name',
            'settlements.toUser:id,name',
        ]);

        return Inertia::render('Trips/History', [
            'trip' => $trip,
            'expenses' => $trip->expenses()->with(['items', 'creator'])->latest()->get(),
            'settlements' => $trip->settlements()->with(['fromUser', 'toUser'])->latest()->get(),
        ]);
    }

    public function totals(Trip $trip, BalanceCalculator $balances)
    {
        $this->authorize('view', $trip);

        $expenses = $trip->expenses()->with('items')->get();
        $totalSpent = $expenses->sum(fn ($expense) => $expense->items->sum('total_amount'));

        return Inertia::render('Trips/Totals', [
            'trip' => $trip->only(['id', 'name', 'description', 'status']),
            'totalSpent' => $totalSpent,
            'expenseCount' => $expenses->count(),
            'balances' => $balances->forTrip($trip),
        ]);
    }
}
