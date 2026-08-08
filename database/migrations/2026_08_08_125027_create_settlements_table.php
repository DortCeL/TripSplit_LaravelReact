<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settlements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('to_user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('amount');
            $table->unsignedInteger('gift_amount')->default(0);
            $table->string('status')->default('pending');
            $table->string('type')->default('manual');
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();

            $table->index(['trip_id', 'status']);
            $table->index(['from_user_id', 'to_user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settlements');
    }
};
