<?php

namespace App\Models;

use App\Enums\SettlementStatus;
use App\Enums\SettlementType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Settlement extends Model
{
    protected $fillable = [
        'trip_id',
        'from_user_id',
        'to_user_id',
        'amount',
        'gift_amount',
        'status',
        'type',
        'confirmed_by',
        'confirmed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'gift_amount' => 'integer',
            'status' => SettlementStatus::class,
            'type' => SettlementType::class,
            'confirmed_at' => 'datetime',
        ];
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function fromUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function toUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }

    public function confirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    public function isSettled(): bool
    {
        return in_array($this->status, [SettlementStatus::Confirmed, SettlementStatus::Forgiven], true);
    }
}
