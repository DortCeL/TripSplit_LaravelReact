import TripNav from '@/components/trip-nav';
import { Money } from '@/components/trip/money';
import { StatCard, TripHeader, TripPage } from '@/components/trip/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Receipt, TrendingUp } from 'lucide-react';

type Balance = {
    user_id: number;
    name: string;
    total_paid: number;
    total_owed: number;
    net_balance: number;
};

export default function Totals({
    trip,
    totalSpent,
    expenseCount,
    balances,
}: {
    trip: { id: number; name: string };
    totalSpent: number;
    expenseCount: number;
    balances: Balance[];
}) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Trips', href: '/trips' },
                { title: trip.name, href: `/trips/${trip.id}` },
                { title: 'Totals', href: `/trips/${trip.id}/totals` },
            ]}
        >
            <Head title={`${trip.name} · Totals`} />
            <TripPage>
                <TripHeader
                    title="Totals"
                    description="Trip-wide spending summary and per-member balance breakdown."
                />

                <TripNav tripId={trip.id} active="totals" />

                <div className="grid gap-4 md:grid-cols-2">
                    <StatCard label="Total spent" tone="accent">
                        <Money amount={totalSpent} size="lg" />
                    </StatCard>
                    <StatCard label="Expense headers" tone="neutral">
                        <div className="flex items-center gap-3">
                            <Receipt className="size-8 text-muted-foreground" />
                            <span className="text-3xl font-bold tracking-tight">{expenseCount}</span>
                        </div>
                    </StatCard>
                </div>

                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="border-b bg-secondary/40">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <TrendingUp className="size-5 text-primary" />
                            Per member
                        </CardTitle>
                        <CardDescription>How much each member paid, owed, and their net balance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 p-6">
                        {balances.map((balance) => (
                            <div
                                key={balance.user_id}
                                className="rounded-2xl border bg-secondary/30 px-5 py-4"
                            >
                                <p className="mb-4 text-lg font-semibold">{balance.name}</p>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-xl bg-card px-4 py-3">
                                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Paid</p>
                                        <Money amount={balance.total_paid} size="sm" />
                                    </div>
                                    <div className="rounded-xl bg-card px-4 py-3">
                                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Owed</p>
                                        <Money amount={balance.total_owed} size="sm" />
                                    </div>
                                    <div className="rounded-xl bg-card px-4 py-3">
                                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Net</p>
                                        <Money amount={balance.net_balance} size="sm" signed />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </TripPage>
        </AppLayout>
    );
}
