<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expense_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('share_amount');
            $table->timestamps();

            $table->unique(['expense_item_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_participants');
    }
};
