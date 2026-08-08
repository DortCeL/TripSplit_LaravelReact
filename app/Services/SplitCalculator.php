<?php

namespace App\Services;

use InvalidArgumentException;

class SplitCalculator
{
    /**
     * Equal BDT split: floor to everyone, +1 remainder to first N participants.
     *
     * @param  list<int|string>  $participantIds
     * @return array<int|string, int>
     */
    public function equalSplit(int $totalAmount, array $participantIds): array
    {
        if ($totalAmount < 0) {
            throw new InvalidArgumentException('Total amount must be a non-negative integer.');
        }

        $count = count($participantIds);

        if ($count === 0) {
            throw new InvalidArgumentException('At least one participant is required.');
        }

        $base = intdiv($totalAmount, $count);
        $remainder = $totalAmount % $count;

        $shares = [];

        foreach (array_values($participantIds) as $index => $participantId) {
            $shares[$participantId] = $base + ($index < $remainder ? 1 : 0);
        }

        return $shares;
    }

    /**
     * @param  array<int, int>  $shares
     */
    public function assertSharesMatchTotal(array $shares, int $totalAmount): void
    {
        $sum = array_sum($shares);

        if ($sum !== $totalAmount) {
            throw new InvalidArgumentException("Share amounts ({$sum}) must equal total amount ({$totalAmount}).");
        }

        foreach ($shares as $share) {
            if (! is_int($share) || $share < 0) {
                throw new InvalidArgumentException('Share amounts must be non-negative integers.');
            }
        }
    }

    /**
     * Convert handed-over amounts + change into net contributions.
     *
     * @param  array<int, array{payer_id: int, handed_over: int}>  $payers
     * @return array<int, array{payer_id: int, amount_paid: int}>
     */
    public function netPayments(array $payers, int $changeTakerId, int $changeAmount, int $itemTotal): array
    {
        $netByPayer = [];

        foreach ($payers as $payer) {
            $payerId = (int) $payer['payer_id'];
            $handed = (int) $payer['handed_over'];
            $netByPayer[$payerId] = ($netByPayer[$payerId] ?? 0) + $handed;
        }

        if ($changeAmount > 0) {
            if (! array_key_exists($changeTakerId, $netByPayer)) {
                throw new InvalidArgumentException('Change taker must be one of the payers.');
            }

            $netByPayer[$changeTakerId] -= $changeAmount;
        }

        $payments = [];

        foreach ($netByPayer as $payerId => $amountPaid) {
            if ($amountPaid < 0) {
                throw new InvalidArgumentException('Net payment cannot be negative.');
            }

            if ($amountPaid === 0) {
                continue;
            }

            $payments[] = [
                'payer_id' => (int) $payerId,
                'amount_paid' => $amountPaid,
            ];
        }

        $sum = array_sum(array_column($payments, 'amount_paid'));

        if ($sum !== $itemTotal) {
            throw new InvalidArgumentException("Net payments ({$sum}) must equal item total ({$itemTotal}).");
        }

        return $payments;
    }
}
