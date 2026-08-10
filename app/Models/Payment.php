<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'expense_item_id',
        'payer_id',
        'amount_paid',
    ];

    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'expense_item_id' => 'integer',
            'payer_id' => 'integer',
            'amount_paid' => 'integer',
        ];
    }

    public function expenseItem(): BelongsTo
    {
        return $this->belongsTo(ExpenseItem::class);
    }

    public function payer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'payer_id');
    }
}
