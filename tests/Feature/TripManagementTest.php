<?php

use App\Enums\TripMemberRole;
use App\Models\Expense;
use App\Models\ExpenseItem;
use App\Models\ItemParticipant;
use App\Models\Payment;
use App\Models\Settlement;
use App\Models\Trip;
use App\Models\TripMember;
use App\Models\User;

test('user can create a trip and becomes owner', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('trips.store'), [
            'name' => 'Cox Bazar',
            'description' => 'Beach trip',
        ])
        ->assertRedirect();

    $trip = Trip::query()->first();

    expect($trip)->not->toBeNull()
        ->and($trip->owner_id)->toBe($user->id)
        ->and($trip->members()->where('user_id', $user->id)->where('role', TripMemberRole::Owner)->exists())->toBeTrue();
});

test('user can create a trip with empty description and view it', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('trips.store'), [
            'name' => 'Empty Desc',
            'description' => '',
        ]);

    $trip = Trip::query()->where('name', 'Empty Desc')->first();

    expect($trip)->not->toBeNull();

    $response->assertRedirect(route('trips.show', $trip));

    $this->actingAs($user)
        ->get(route('trips.show', $trip))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Trips/Show')
            ->where('trip.id', $trip->id)
            ->where('trip.name', 'Empty Desc'));
});

test('members only see their own trips', function () {
    $owner = User::factory()->create();
    $outsider = User::factory()->create();

    Trip::factory()->create(['owner_id' => $owner->id, 'name' => 'Secret Trip']);

    $this->actingAs($outsider)
        ->get(route('trips.index'))
        ->assertInertia(fn ($page) => $page
            ->component('Trips/Index')
            ->has('trips', 0));

    $this->actingAs($owner)
        ->get(route('trips.index'))
        ->assertInertia(fn ($page) => $page
            ->component('Trips/Index')
            ->has('trips', 1));
});

test('only owner can delete a trip', function () {
    $owner = User::factory()->create();
    $admin = User::factory()->create();
    $trip = Trip::factory()->create(['owner_id' => $owner->id]);

    TripMember::create([
        'trip_id' => $trip->id,
        'user_id' => $admin->id,
        'role' => TripMemberRole::Admin,
    ]);

    $this->actingAs($admin)
        ->delete(route('trips.destroy', $trip))
        ->assertForbidden();

    $this->actingAs($owner)
        ->delete(route('trips.destroy', $trip))
        ->assertRedirect(route('trips.index'));

    expect(Trip::query()->find($trip->id))->toBeNull();
});

test('deleting a trip removes members expenses payments and settlements', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $trip = Trip::factory()->create(['owner_id' => $owner->id]);

    TripMember::create([
        'trip_id' => $trip->id,
        'user_id' => $member->id,
        'role' => TripMemberRole::Member,
    ]);

    $this->actingAs($owner)->post(route('trips.expenses.store', $trip), [
        'name' => 'Hotel',
        'note' => null,
        'expense_date' => now()->toDateString(),
        'items' => [
            [
                'name' => 'Room',
                'total_amount' => 200,
                'participant_ids' => [$owner->id, $member->id],
                'payers' => [
                    ['payer_id' => $owner->id, 'handed_over' => 200],
                ],
                'change_taker_id' => $owner->id,
                'change_amount' => 0,
            ],
        ],
    ])->assertRedirect(route('trips.show', $trip));

    $this->actingAs($member)->post(route('trips.settlements.store', $trip), [
        'from_user_id' => $member->id,
        'to_user_id' => $owner->id,
        'amount' => 100,
        'paid_amount' => 100,
    ])->assertRedirect(route('trips.settlements.index', $trip));

    $tripId = $trip->id;

    expect(TripMember::query()->where('trip_id', $tripId)->count())->toBeGreaterThan(0)
        ->and(Expense::query()->where('trip_id', $tripId)->count())->toBe(1)
        ->and(Settlement::query()->where('trip_id', $tripId)->count())->toBe(1);

    $this->actingAs($owner)
        ->delete(route('trips.destroy', $trip))
        ->assertRedirect(route('trips.index'));

    expect(Trip::query()->find($tripId))->toBeNull()
        ->and(TripMember::query()->where('trip_id', $tripId)->count())->toBe(0)
        ->and(Expense::query()->where('trip_id', $tripId)->count())->toBe(0)
        ->and(ExpenseItem::query()->count())->toBe(0)
        ->and(Payment::query()->count())->toBe(0)
        ->and(ItemParticipant::query()->count())->toBe(0)
        ->and(Settlement::query()->where('trip_id', $tripId)->count())->toBe(0);
});

test('admin can add members by email', function () {
    $owner = User::factory()->create();
    $friend = User::factory()->create(['email' => 'friend@example.com']);
    $trip = Trip::factory()->create(['owner_id' => $owner->id]);

    $this->actingAs($owner)
        ->post(route('trips.members.store', $trip), [
            'email' => 'friend@example.com',
            'role' => 'member',
        ])
        ->assertRedirect(route('trips.members.index', $trip));

    expect($trip->fresh()->hasMember($friend))->toBeTrue();
});
