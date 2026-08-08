<?php

use App\Services\SplitCalculator;

test('equal split distributes remainder to first participants', function () {
    $shares = (new SplitCalculator)->equalSplit(5, [1, 2]);

    expect($shares)->toBe([1 => 3, 2 => 2])
        ->and(array_sum($shares))->toBe(5);
});

test('equal split keeps exact integers when divisible', function () {
    $shares = (new SplitCalculator)->equalSplit(105, [1, 2, 3]);

    expect($shares)->toBe([1 => 35, 2 => 35, 3 => 35]);
});

test('net payments subtract change from change taker', function () {
    $payments = (new SplitCalculator)->netPayments(
        [
            ['payer_id' => 1, 'handed_over' => 500],
        ],
        changeTakerId: 1,
        changeAmount: 395,
        itemTotal: 105,
    );

    expect($payments)->toBe([
        ['payer_id' => 1, 'amount_paid' => 105],
    ]);
});

test('net payments reject mismatched totals', function () {
    (new SplitCalculator)->netPayments(
        [['payer_id' => 1, 'handed_over' => 100]],
        changeTakerId: 1,
        changeAmount: 0,
        itemTotal: 120,
    );
})->throws(InvalidArgumentException::class);
