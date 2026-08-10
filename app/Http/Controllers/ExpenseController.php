<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\ExpenseItem;
use App\Models\ItemParticipant;
use App\Models\Payment;
use App\Models\Trip;
use App\Services\SplitCalculator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function create(Trip $trip)
    {
        $this->authorize('manageExpenses', $trip);

        $trip->load('members.user:id,name');

        return Inertia::render('Trips/Expenses/Create', [
            'trip' => $trip->only(['id', 'name']),
            'members' => $trip->members->map(fn ($m) => [
                'id' => $m->user->id,
                'name' => $m->user->name,
            ]),
        ]);
    }

    public function store(Request $request, Trip $trip, SplitCalculator $splitter)
    {
        $this->authorize('manageExpenses', $trip);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'note' => 'nullable|string',
            'expense_date' => 'nullable|date',
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string|max:255',
            'items.*.total_amount' => 'required|integer|min:1',
            'items.*.participant_ids' => 'required|array|min:1',
            'items.*.participant_ids.*' => 'integer|exists:users,id',
            'items.*.shares' => 'nullable|array',
            'items.*.shares.*.user_id' => 'required_with:items.*.shares|integer|exists:users,id',
            'items.*.shares.*.share_amount' => 'required_with:items.*.shares|integer|min:0',
            'items.*.payers' => 'required|array|min:1',
            'items.*.payers.*.payer_id' => 'required|integer|exists:users,id',
            'items.*.payers.*.handed_over' => 'required|integer|min:0',
            'items.*.change_taker_id' => 'nullable|integer|exists:users,id',
            'items.*.change_amount' => 'nullable|integer|min:0',
        ]);

        $memberIds = $trip->members()->pluck('user_id')->all();

        DB::transaction(function () use ($request, $trip, $validated, $splitter, $memberIds) {
            $expense = Expense::create([
                'trip_id' => $trip->id,
                'created_by' => $request->user()->id,
                'name' => $validated['name'],
                'note' => $validated['note'] ?? null,
                'expense_date' => $validated['expense_date'] ?? now()->toDateString(),
            ]);

            foreach ($validated['items'] as $itemData) {
                foreach ($itemData['participant_ids'] as $participantId) {
                    if (! in_array($participantId, $memberIds, true)) {
                        throw ValidationException::withMessages([
                            'items' => 'All participants must be trip members.',
                        ]);
                    }
                }

                $item = ExpenseItem::create([
                    'expense_id' => $expense->id,
                    'name' => $itemData['name'],
                    'total_amount' => $itemData['total_amount'],
                ]);

                if (! empty($itemData['shares'])) {
                    $sharesMap = collect($itemData['shares'])
                        ->mapWithKeys(fn ($s) => [(int) $s['user_id'] => (int) $s['share_amount']])
                        ->all();
                    $splitter->assertSharesMatchTotal($sharesMap, (int) $itemData['total_amount']);
                } else {
                    $sharesMap = $splitter->equalSplit(
                        (int) $itemData['total_amount'],
                        $itemData['participant_ids']
                    );
                }

                foreach ($sharesMap as $userId => $shareAmount) {
                    ItemParticipant::create([
                        'expense_item_id' => $item->id,
                        'user_id' => $userId,
                        'share_amount' => $shareAmount,
                    ]);
                }

                $changeTakerId = (int) ($itemData['change_taker_id'] ?? ($itemData['payers'][0]['payer_id'] ?? 0));
                $changeAmount = (int) ($itemData['change_amount'] ?? 0);

                $netPayments = $splitter->netPayments(
                    $itemData['payers'],
                    $changeTakerId,
                    $changeAmount,
                    (int) $itemData['total_amount']
                );

                foreach ($netPayments as $payment) {
                    if (! in_array($payment['payer_id'], $memberIds, true)) {
                        throw ValidationException::withMessages([
                            'items' => 'All payers must be trip members.',
                        ]);
                    }

                    Payment::create([
                        'expense_item_id' => $item->id,
                        'payer_id' => $payment['payer_id'],
                        'amount_paid' => $payment['amount_paid'],
                    ]);
                }
            }
        });

        Inertia::flash([
            'color' => 'green',
            'message' => 'Expense created successfully',
            'tripName' => $validated['name'],
        ]);

        return redirect()->route('trips.show', $trip);
    }

    public function destroy(Trip $trip, Expense $expense)
    {
        $this->authorize('manageExpenses', $trip);
        abort_unless((int) $expense->trip_id === (int) $trip->id, 404);

        $name = $expense->name;
        $expense->delete();

        Inertia::flash([
            'color' => 'red',
            'message' => 'Expense deleted',
            'tripName' => $name,
        ]);

        return redirect()->route('trips.show', $trip);
    }
}
