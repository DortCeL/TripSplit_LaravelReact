import TripNav from '@/components/trip-nav';
import { Money, formatTaka } from '@/components/trip/money';
import { EmptyState, TripHeader, TripPage } from '@/components/trip/page-shell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Gift, Receipt, Wallet } from 'lucide-react';

const statusStyles: Record<string, string> = {
    pending: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
    confirmed: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
    rejected: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200',
    forgiven: 'border-border bg-secondary text-secondary-foreground',
};

function SettlementStatusBadge({ status }: { status: string }) {
    return (
        <Badge variant="outline" className={cn('capitalize', statusStyles[status] ?? '')}>
            {status}
        </Badge>
    );
}

export default function History({
    trip,
    expenses,
    settlements,
}: {
    trip: { id: number; name: string };
    expenses: Array<{ id: number; name: string; expense_date?: string; creator?: { name: string }; items: Array<{ total_amount: number }> }>;
    settlements: Array<{
        id: number;
        amount: number;
        gift_amount: number;
        status: string;
        type: string;
        from_user?: { name: string };
        to_user?: { name: string };
        created_at?: string;
    }>;
}) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Trips', href: '/trips' },
                { title: trip.name, href: `/trips/${trip.id}` },
                { title: 'History', href: `/trips/${trip.id}/history` },
            ]}
        >
            <Head title={`${trip.name} · History`} />
            <TripPage>
                <TripHeader
                    title="History"
                    description="A chronological record of expenses and settlements for this trip."
                />

                <TripNav tripId={trip.id} active="history" />

                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="border-b bg-secondary/40">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Receipt className="size-5 text-primary" />
                            Expenses
                        </CardTitle>
                        <CardDescription>All expense headers recorded in this trip</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 p-6">
                        {expenses.length === 0 ? (
                            <EmptyState title="No expenses yet" description="Expenses will appear here once they are added." />
                        ) : (
                            expenses.map((expense) => {
                                const total = expense.items.reduce((sum, item) => sum + item.total_amount, 0);

                                return (
                                    <div
                                        key={expense.id}
                                        className="flex flex-col gap-2 rounded-2xl border bg-secondary/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-semibold">{expense.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {expense.expense_date || 'No date'}
                                                {expense.creator ? ` · ${expense.creator.name}` : ''}
                                            </p>
                                        </div>
                                        <Money amount={total} size="sm" />
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="border-b bg-secondary/40">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Wallet className="size-5 text-primary" />
                            Settlements
                        </CardTitle>
                        <CardDescription>Payment requests, confirmations, and forgiven debts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 p-6">
                        {settlements.length === 0 ? (
                            <EmptyState title="No settlements yet" description="Settlement activity will appear here." />
                        ) : (
                            settlements.map((settlement) => (
                                <div
                                    key={settlement.id}
                                    className="flex flex-col gap-3 rounded-2xl border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0 space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold">
                                                {settlement.from_user?.name} → {settlement.to_user?.name}
                                            </p>
                                            <SettlementStatusBadge status={settlement.status} />
                                            <Badge variant="secondary" className="capitalize">
                                                {settlement.type}
                                            </Badge>
                                        </div>
                                        {settlement.created_at && (
                                            <p className="text-sm text-muted-foreground">{settlement.created_at}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Money amount={settlement.amount} size="sm" />
                                        {settlement.gift_amount > 0 && (
                                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                                <Gift className="size-3.5" />+{formatTaka(settlement.gift_amount)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </TripPage>
        </AppLayout>
    );
}
