<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expense_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payer_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('amount_paid');
            $table->timestamps();

            $table->index(['payer_id', 'expense_item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
