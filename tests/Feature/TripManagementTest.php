<?php

use App\Enums\TripMemberRole;
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
