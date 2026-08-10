<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExpenseItem extends Model
{
    protected $fillable = [
        'expense_id',
        'name',
        'total_amount',
    ];

    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'expense_id' => 'integer',
            'total_amount' => 'integer',
        ];
    }

    public function expense(): BelongsTo
    {
        return $this->belongsTo(Expense::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(ItemParticipant::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
