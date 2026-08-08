<?php

namespace App\Policies;

use App\Enums\TripMemberRole;
use App\Models\Trip;
use App\Models\User;

class TripPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Trip $trip): bool
    {
        return $trip->hasMember($user);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Trip $trip): bool
    {
        return $trip->isAdmin($user);
    }

    public function delete(User $user, Trip $trip): bool
    {
        return $trip->isOwner($user);
    }

    public function manageMembers(User $user, Trip $trip): bool
    {
        return $trip->isAdmin($user);
    }

    public function manageExpenses(User $user, Trip $trip): bool
    {
        return $trip->isAdmin($user);
    }

    public function confirmSettlement(User $user, Trip $trip): bool
    {
        return $trip->isAdmin($user);
    }

    public function demoteAdmin(User $user, Trip $trip): bool
    {
        return $trip->isOwner($user);
    }

    public function removeMember(User $user, Trip $trip, User $target): bool
    {
        if (! $trip->isAdmin($user)) {
            return false;
        }

        if ($trip->isOwner($target)) {
            return false;
        }

        $targetRole = $trip->memberRole($target);

        if ($targetRole === TripMemberRole::Admin && ! $trip->isOwner($user)) {
            return false;
        }

        return true;
    }
}
