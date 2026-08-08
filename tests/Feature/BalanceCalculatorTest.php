<?php

use App\Enums\SettlementStatus;
use App\Enums\SettlementType;
use App\Enums\TripMemberRole;
use App\Models\Expense;
use App\Models\ExpenseItem;
use App\Models\ItemParticipant;
use App\Models\Payment;
use App\Models\Settlement;
use App\Models\Trip;
use App\Models\TripMember;
use App\Models\User;
use App\Services\BalanceCalculator;

test('balance follows paid owed and settlements golden rule', function () {
    $owner = User::factory()->create();
    $friend = User::factory()->create();

    $trip = Trip::factory()->create(['owner_id' => $owner->id]);
    TripMember::create([
        'trip_id' => $trip->id,
        'user_id' => $friend->id,
        'role' => TripMemberRole::Member,
    ]);

    $expense = Expense::create([
        'trip_id' => $trip->id,
        'created_by' => $owner->id,
        'name' => 'Bus Rent',
        'expense_date' => now()->toDateString(),
    ]);

    $item = ExpenseItem::create([
        'expense_id' => $expense->id,
        'name' => 'Bus Fare',
        'total_amount' => 70,
    ]);

    ItemParticipant::create(['expense_item_id' => $item->id, 'user_id' => $owner->id, 'share_amount' => 35]);
    ItemParticipant::create(['expense_item_id' => $item->id, 'user_id' => $friend->id, 'share_amount' => 35]);
    Payment::create(['expense_item_id' => $item->id, 'payer_id' => $owner->id, 'amount_paid' => 70]);

    $calculator = new BalanceCalculator;
    $ownerBalance = $calculator->forUser($trip, $owner);
    $friendBalance = $calculator->forUser($trip, $friend);

    expect($ownerBalance['net_balance'])->toBe(35)
        ->and($friendBalance['net_balance'])->toBe(-35);

    Settlement::create([
        'trip_id' => $trip->id,
        'from_user_id' => $friend->id,
        'to_user_id' => $owner->id,
        'amount' => 35,
        'gift_amount' => 0,
        'status' => SettlementStatus::Forgiven,
        'type' => SettlementType::Forgiveness,
        'confirmed_by' => $owner->id,
        'confirmed_at' => now(),
    ]);

    expect($calculator->forUser($trip, $owner)['net_balance'])->toBe(0)
        ->and($calculator->forUser($trip, $friend)['net_balance'])->toBe(0);
});
