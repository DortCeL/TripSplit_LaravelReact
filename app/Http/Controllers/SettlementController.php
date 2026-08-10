<?php

namespace App\Http\Controllers;

use App\Enums\SettlementStatus;
use App\Enums\SettlementType;
use App\Models\Settlement;
use App\Models\Trip;
use App\Services\BalanceCalculator;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SettlementController extends Controller
{
    public function index(Trip $trip, BalanceCalculator $balances)
    {
        $this->authorize('view', $trip);

        $settlements = $trip->settlements()
            ->with(['fromUser:id,name', 'toUser:id,name', 'confirmedBy:id,name'])
            ->latest()
            ->get();

        return Inertia::render('Trips/Settlements', [
            'trip' => $trip->only(['id', 'name']),
            'settlements' => $settlements,
            'matrix' => $balances->settlementMatrix($trip),
            'balances' => $balances->forTrip($trip),
            'canConfirm' => request()->user()->can('confirmSettlement', $trip),
            'currentUserId' => request()->user()->id,
        ]);
    }

    public function store(Request $request, Trip $trip)
    {
        $this->authorize('view', $trip);

        $validated = $request->validate([
            'from_user_id' => 'required|integer|exists:users,id',
            'to_user_id' => 'required|integer|exists:users,id|different:from_user_id',
            'amount' => 'required|integer|min:1',
            'paid_amount' => 'nullable|integer|min:1',
        ]);

        if (! $trip->hasMember($request->user())) {
            abort(403);
        }

        foreach ([$validated['from_user_id'], $validated['to_user_id']] as $userId) {
            if (! $trip->members()->where('user_id', $userId)->exists()) {
                throw ValidationException::withMessages([
                    'from_user_id' => 'Both users must be trip members.',
                ]);
            }
        }

        $debtAmount = (int) $validated['amount'];
        $paidAmount = (int) ($validated['paid_amount'] ?? $debtAmount);

        if ($paidAmount < $debtAmount) {
            throw ValidationException::withMessages([
                'paid_amount' => 'Paid amount cannot be less than the debt amount.',
            ]);
        }

        $giftAmount = $paidAmount - $debtAmount;

        Settlement::create([
            'trip_id' => $trip->id,
            'from_user_id' => $validated['from_user_id'],
            'to_user_id' => $validated['to_user_id'],
            'amount' => $debtAmount,
            'gift_amount' => $giftAmount,
            'status' => SettlementStatus::Pending,
            'type' => $giftAmount > 0 ? SettlementType::Gift : SettlementType::Manual,
        ]);

        Inertia::flash([
            'color' => 'green',
            'message' => 'Settlement request created',
            'tripName' => $trip->name,
        ]);

        return redirect()->route('trips.settlements.index', $trip);
    }

    public function confirm(Request $request, Trip $trip, Settlement $settlement)
    {
        $this->authorize('confirmSettlement', $trip);
        abort_unless((int) $settlement->trip_id === (int) $trip->id, 404);

        if ($settlement->status !== SettlementStatus::Pending) {
            throw ValidationException::withMessages([
                'settlement' => 'Only pending settlements can be confirmed.',
            ]);
        }

        if ((int) $settlement->from_user_id === (int) $request->user()->id) {
            throw ValidationException::withMessages([
                'settlement' => 'You cannot confirm your own settlement request.',
            ]);
        }

        $settlement->update([
            'status' => SettlementStatus::Confirmed,
            'confirmed_by' => $request->user()->id,
            'confirmed_at' => now(),
        ]);

        Inertia::flash([
            'color' => 'green',
            'message' => 'Settlement confirmed',
            'tripName' => $trip->name,
        ]);

        return redirect()->route('trips.settlements.index', $trip);
    }

    public function reject(Request $request, Trip $trip, Settlement $settlement)
    {
        $this->authorize('confirmSettlement', $trip);
        abort_unless((int) $settlement->trip_id === (int) $trip->id, 404);

        if ($settlement->status !== SettlementStatus::Pending) {
            throw ValidationException::withMessages([
                'settlement' => 'Only pending settlements can be rejected.',
            ]);
        }

        $settlement->update([
            'status' => SettlementStatus::Rejected,
            'confirmed_by' => $request->user()->id,
            'confirmed_at' => now(),
        ]);

        Inertia::flash([
            'color' => 'red',
            'message' => 'Settlement rejected',
            'tripName' => $trip->name,
        ]);

        return redirect()->route('trips.settlements.index', $trip);
    }

    public function forgive(Request $request, Trip $trip, BalanceCalculator $balances)
    {
        $this->authorize('view', $trip);

        $validated = $request->validate([
            'from_user_id' => 'required|integer|exists:users,id',
            'to_user_id' => 'required|integer|exists:users,id|different:from_user_id',
            'amount' => 'required|integer|min:1',
        ]);

        $creditorId = (int) $validated['to_user_id'];
        $user = $request->user();

        if ((int) $user->id !== $creditorId && ! $trip->isAdmin($user)) {
            throw ValidationException::withMessages([
                'to_user_id' => 'Only the creditor or an admin can forgive this debt.',
            ]);
        }

        $matrix = collect($balances->settlementMatrix($trip));
        $pair = $matrix->first(
            fn ($row) => (int) $row['from_user_id'] === (int) $validated['from_user_id']
                && (int) $row['to_user_id'] === $creditorId
        );

        if (! $pair || $pair['amount'] < (int) $validated['amount']) {
            throw ValidationException::withMessages([
                'amount' => 'Forgiveness amount exceeds outstanding debt between these users.',
            ]);
        }

        Settlement::create([
            'trip_id' => $trip->id,
            'from_user_id' => $validated['from_user_id'],
            'to_user_id' => $creditorId,
            'amount' => (int) $validated['amount'],
            'gift_amount' => 0,
            'status' => SettlementStatus::Forgiven,
            'type' => SettlementType::Forgiveness,
            'confirmed_by' => $user->id,
            'confirmed_at' => now(),
        ]);

        Inertia::flash([
            'color' => 'green',
            'message' => 'Debt forgiven',
            'tripName' => $trip->name,
        ]);

        return redirect()->route('trips.settlements.index', $trip);
    }
}
