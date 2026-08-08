<?php

namespace App\Services;

use App\Enums\SettlementStatus;
use App\Models\ItemParticipant;
use App\Models\Payment;
use App\Models\Settlement;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Support\Collection;

class BalanceCalculator
{
    /**
     * Net = (Total Paid + Settlements Sent) - (Total Owed + Settlements Received)
     * Only confirmed + forgiven settlement `amount` counts (gift_amount is expenditure/history only).
     *
     * @return array{
     *     user_id: int,
     *     name: string,
     *     total_paid: int,
     *     total_owed: int,
     *     settlements_sent: int,
     *     settlements_received: int,
     *     net_balance: int
     * }
     */
    public function forUser(Trip $trip, User $user): array
    {
        $expenseItemIds = $trip->expenses()->with('items')->get()
            ->flatMap(fn ($expense) => $expense->items->pluck('id'));

        $totalPaid = (int) Payment::query()
            ->whereIn('expense_item_id', $expenseItemIds)
            ->where('payer_id', $user->id)
            ->sum('amount_paid');

        $totalOwed = (int) ItemParticipant::query()
            ->whereIn('expense_item_id', $expenseItemIds)
            ->where('user_id', $user->id)
            ->sum('share_amount');

        $settledStatuses = [SettlementStatus::Confirmed, SettlementStatus::Forgiven];

        $settlementsSent = (int) Settlement::query()
            ->where('trip_id', $trip->id)
            ->where('from_user_id', $user->id)
            ->whereIn('status', $settledStatuses)
            ->sum('amount');

        $settlementsReceived = (int) Settlement::query()
            ->where('trip_id', $trip->id)
            ->where('to_user_id', $user->id)
            ->whereIn('status', $settledStatuses)
            ->sum('amount');

        // Net = (Paid + Settlements Sent) - (Owed + Settlements Received)
        // Debtor "sent" improves their net; creditor "received" reduces their claim.
        // gift_amount is tracked for expenditure/history only and does not affect net.
        $net = ($totalPaid + $settlementsSent) - ($totalOwed + $settlementsReceived);

        return [
            'user_id' => $user->id,
            'name' => $user->name,
            'total_paid' => $totalPaid,
            'total_owed' => $totalOwed,
            'settlements_sent' => $settlementsSent,
            'settlements_received' => $settlementsReceived,
            'net_balance' => $net,
        ];
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function forTrip(Trip $trip): Collection
    {
        $trip->loadMissing('members.user');

        return $trip->members
            ->map(fn ($member) => $this->forUser($trip, $member->user))
            ->values();
    }

    /**
     * Simplified pairwise debts from net balances (greedy).
     *
     * @return list<array{from_user_id: int, from_name: string, to_user_id: int, to_name: string, amount: int}>
     */
    public function settlementMatrix(Trip $trip): array
    {
        $balances = $this->forTrip($trip);

        $debtors = [];
        $creditors = [];

        foreach ($balances as $balance) {
            if ($balance['net_balance'] < 0) {
                $debtors[] = $balance;
            } elseif ($balance['net_balance'] > 0) {
                $creditors[] = $balance;
            }
        }

        usort($debtors, fn ($a, $b) => $a['net_balance'] <=> $b['net_balance']);
        usort($creditors, fn ($a, $b) => $b['net_balance'] <=> $a['net_balance']);

        $matrix = [];
        $i = 0;
        $j = 0;

        while ($i < count($debtors) && $j < count($creditors)) {
            $owe = abs($debtors[$i]['net_balance']);
            $due = $creditors[$j]['net_balance'];
            $amount = min($owe, $due);

            if ($amount > 0) {
                $matrix[] = [
                    'from_user_id' => $debtors[$i]['user_id'],
                    'from_name' => $debtors[$i]['name'],
                    'to_user_id' => $creditors[$j]['user_id'],
                    'to_name' => $creditors[$j]['name'],
                    'amount' => $amount,
                ];
            }

            $debtors[$i]['net_balance'] += $amount;
            $creditors[$j]['net_balance'] -= $amount;

            if ($debtors[$i]['net_balance'] === 0) {
                $i++;
            }

            if ($creditors[$j]['net_balance'] === 0) {
                $j++;
            }
        }

        return $matrix;
    }
}
