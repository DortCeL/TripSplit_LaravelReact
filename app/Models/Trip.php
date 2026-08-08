<?php

namespace App\Models;

use App\Enums\TripMemberRole;
use App\Enums\TripStatus;
use Database\Factories\TripFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trip extends Model
{
    /** @use HasFactory<TripFactory> */
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'name',
        'description',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => TripStatus::class,
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(TripMember::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'trip_members')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function settlements(): HasMany
    {
        return $this->hasMany(Settlement::class);
    }

    public function hasMember(User $user): bool
    {
        return $this->members()->where('user_id', $user->id)->exists();
    }

    public function memberRole(User $user): ?TripMemberRole
    {
        $member = $this->members()->where('user_id', $user->id)->first();

        return $member?->role;
    }

    public function isOwner(User $user): bool
    {
        return (int) $this->owner_id === (int) $user->id;
    }

    public function isAdmin(User $user): bool
    {
        $role = $this->memberRole($user);

        return $role === TripMemberRole::Owner
            || $role === TripMemberRole::Admin
            || $this->isOwner($user);
    }
}
