<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemParticipant extends Model
{
    protected $fillable = [
        'expense_item_id',
        'user_id',
        'share_amount',
    ];

    protected function casts(): array
    {
        return [
            'share_amount' => 'integer',
        ];
    }

    public function expenseItem(): BelongsTo
    {
        return $this->belongsTo(ExpenseItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
