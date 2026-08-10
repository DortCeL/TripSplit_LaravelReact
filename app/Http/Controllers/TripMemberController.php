<?php

namespace App\Http\Controllers;

use App\Enums\TripMemberRole;
use App\Models\Trip;
use App\Models\TripMember;
use App\Models\User;
use App\Services\BalanceCalculator;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class TripMemberController extends Controller
{
    public function index(Trip $trip)
    {
        $this->authorize('view', $trip);

        $trip->load('members.user:id,name,email');

        return Inertia::render('Trips/Members', [
            'trip' => $trip->only(['id', 'name']),
            'members' => $trip->members,
            'canManageMembers' => request()->user()->can('manageMembers', $trip),
            'isOwner' => $trip->isOwner(request()->user()),
        ]);
    }

    public function store(Request $request, Trip $trip)
    {
        $this->authorize('manageMembers', $trip);

        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'role' => ['required', Rule::in(['admin', 'member'])],
        ]);

        $user = User::query()->where('email', $validated['email'])->firstOrFail();

        if ($trip->hasMember($user)) {
            throw ValidationException::withMessages([
                'email' => 'This user is already a trip member.',
            ]);
        }

        TripMember::create([
            'trip_id' => $trip->id,
            'user_id' => $user->id,
            'role' => TripMemberRole::from($validated['role']),
        ]);

        Inertia::flash([
            'color' => 'green',
            'message' => 'Member added',
            'tripName' => $user->name,
        ]);

        return redirect()->route('trips.members.index', $trip);
    }

    public function update(Request $request, Trip $trip, TripMember $member)
    {
        $this->authorize('manageMembers', $trip);

        abort_unless((int) $member->trip_id === (int) $trip->id, 404);

        $validated = $request->validate([
            'role' => ['required', Rule::in(['admin', 'member'])],
        ]);

        $newRole = TripMemberRole::from($validated['role']);

        if ($member->role === TripMemberRole::Owner) {
            throw ValidationException::withMessages([
                'role' => 'Cannot change the owner role.',
            ]);
        }

        if ($member->role === TripMemberRole::Admin && $newRole === TripMemberRole::Member) {
            $this->authorize('demoteAdmin', $trip);
        }

        if ($newRole === TripMemberRole::Admin && ! $trip->isAdmin($request->user())) {
            abort(403);
        }

        $member->update(['role' => $newRole]);

        Inertia::flash([
            'color' => 'green',
            'message' => 'Member role updated',
            'tripName' => $member->user->name,
        ]);

        return redirect()->route('trips.members.index', $trip);
    }

    public function destroy(Trip $trip, TripMember $member, BalanceCalculator $balances)
    {
        $this->authorize('removeMember', [$trip, $member->user]);

        abort_unless((int) $member->trip_id === (int) $trip->id, 404);

        $balance = $balances->forUser($trip, $member->user);

        if ($balance['net_balance'] !== 0) {
            throw ValidationException::withMessages([
                'member' => 'User still has outstanding balances. Settle or forgive debts first.',
            ]);
        }

        $name = $member->user->name;
        $member->delete();

        Inertia::flash([
            'color' => 'red',
            'message' => 'Member removed',
            'tripName' => $name,
        ]);

        return redirect()->route('trips.members.index', $trip);
    }
}
