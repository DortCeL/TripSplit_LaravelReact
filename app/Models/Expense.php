<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Expense extends Model
{
    protected $fillable = [
        'trip_id',
        'created_by',
        'name',
        'note',
        'expense_date',
    ];

    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'trip_id' => 'integer',
            'created_by' => 'integer',
            'expense_date' => 'date',
        ];
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ExpenseItem::class);
    }
}
