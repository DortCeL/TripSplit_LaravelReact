<?php

use App\Enums\SettlementStatus;
use App\Enums\TripMemberRole;
use App\Models\Settlement;
use App\Models\Trip;
use App\Models\TripMember;
use App\Models\User;
use App\Services\BalanceCalculator;

test('admin can create expense with net payments after change', function () {
    $owner = User::factory()->create();
    $b = User::factory()->create();
    $c = User::factory()->create();

    $trip = Trip::factory()->create(['owner_id' => $owner->id]);
    TripMember::create(['trip_id' => $trip->id, 'user_id' => $b->id, 'role' => TripMemberRole::Member]);
    TripMember::create(['trip_id' => $trip->id, 'user_id' => $c->id, 'role' => TripMemberRole::Member]);

    $this->actingAs($owner)
        ->post(route('trips.expenses.store', $trip), [
            'name' => 'Bus Rent',
            'note' => null,
            'expense_date' => now()->toDateString(),
            'items' => [
                [
                    'name' => 'Bus Fare',
                    'total_amount' => 105,
                    'participant_ids' => [$owner->id, $b->id, $c->id],
                    'payers' => [
                        ['payer_id' => $owner->id, 'handed_over' => 500],
                    ],
                    'change_taker_id' => $owner->id,
                    'change_amount' => 395,
                ],
            ],
        ])
        ->assertRedirect(route('trips.show', $trip));

    $trip->refresh();
    $balances = (new BalanceCalculator)->forTrip($trip)->keyBy('user_id');

    expect($balances[$owner->id]['total_paid'])->toBe(105)
        ->and($balances[$owner->id]['total_owed'])->toBe(35)
        ->and($balances[$owner->id]['net_balance'])->toBe(70)
        ->and($balances[$b->id]['net_balance'])->toBe(-35)
        ->and($balances[$c->id]['net_balance'])->toBe(-35);
});

test('member cannot create expenses', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $trip = Trip::factory()->create(['owner_id' => $owner->id]);
    TripMember::create(['trip_id' => $trip->id, 'user_id' => $member->id, 'role' => TripMemberRole::Member]);

    $this->actingAs($member)
        ->post(route('trips.expenses.store', $trip), [
            'name' => 'Food',
            'items' => [
                [
                    'name' => 'Rice',
                    'total_amount' => 100,
                    'participant_ids' => [$owner->id, $member->id],
                    'payers' => [['payer_id' => $member->id, 'handed_over' => 100]],
                    'change_taker_id' => $member->id,
                    'change_amount' => 0,
                ],
            ],
        ])
        ->assertForbidden();
});

test('settlement overpay stores gift amount and confirmation updates balances', function () {
    $owner = User::factory()->create();
    $debtor = User::factory()->create();
    $trip = Trip::factory()->create(['owner_id' => $owner->id]);
    TripMember::create(['trip_id' => $trip->id, 'user_id' => $debtor->id, 'role' => TripMemberRole::Member]);

    $this->actingAs($owner)->post(route('trips.expenses.store', $trip), [
        'name' => 'Taxi',
        'items' => [[
            'name' => 'Fare',
            'total_amount' => 77,
            'participant_ids' => [$owner->id, $debtor->id],
            'payers' => [['payer_id' => $owner->id, 'handed_over' => 77]],
            'change_taker_id' => $owner->id,
            'change_amount' => 0,
        ]],
    ])->assertRedirect();

    // 77 / 2 => 39 and 38
    $balances = (new BalanceCalculator)->forTrip($trip->fresh())->keyBy('user_id');
    $debt = abs(min($balances[$debtor->id]['net_balance'], 0));

    $this->actingAs($debtor)->post(route('trips.settlements.store', $trip), [
        'from_user_id' => $debtor->id,
        'to_user_id' => $owner->id,
        'amount' => $debt,
        'paid_amount' => $debt + 3,
    ])->assertRedirect(route('trips.settlements.index', $trip));

    $settlement = Settlement::query()->first();
    expect($settlement->gift_amount)->toBe(3)
        ->and($settlement->status)->toBe(SettlementStatus::Pending);

    $this->actingAs($owner)
        ->post(route('trips.settlements.confirm', [$trip, $settlement]))
        ->assertRedirect();

    $after = (new BalanceCalculator)->forTrip($trip->fresh())->keyBy('user_id');

    expect($settlement->fresh()->gift_amount)->toBe(3)
        ->and($after[$debtor->id]['net_balance'])->toBe(0)
        ->and($after[$owner->id]['net_balance'])->toBe(0);
});

test('user cannot confirm own settlement request', function () {
    $owner = User::factory()->create();
    $debtor = User::factory()->create();
    $trip = Trip::factory()->create(['owner_id' => $owner->id]);
    TripMember::create(['trip_id' => $trip->id, 'user_id' => $debtor->id, 'role' => TripMemberRole::Admin]);

    $settlement = Settlement::create([
        'trip_id' => $trip->id,
        'from_user_id' => $debtor->id,
        'to_user_id' => $owner->id,
        'amount' => 20,
        'gift_amount' => 0,
        'status' => SettlementStatus::Pending,
        'type' => 'manual',
    ]);

    $this->actingAs($debtor)
        ->post(route('trips.settlements.confirm', [$trip, $settlement]))
        ->assertSessionHasErrors('settlement');
});
