<?php

namespace Database\Factories;

use App\Enums\TripMemberRole;
use App\Enums\TripStatus;
use App\Models\Trip;
use App\Models\TripMember;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Trip>
 */
class TripFactory extends Factory
{
    protected $model = Trip::class;

    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'status' => TripStatus::Active,
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Trip $trip) {
            if ($trip->owner_id) {
                TripMember::query()->firstOrCreate(
                    [
                        'trip_id' => $trip->id,
                        'user_id' => $trip->owner_id,
                    ],
                    [
                        'role' => TripMemberRole::Owner,
                    ]
                );
            }
        });
    }
}
