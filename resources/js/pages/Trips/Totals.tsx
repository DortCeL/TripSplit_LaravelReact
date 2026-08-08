import TripNav from '@/components/trip-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

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
            <div className="space-y-4 p-4">
                <h1 className="text-2xl font-semibold">{trip.name} · Totals</h1>
                <TripNav tripId={trip.id} active="totals" />

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Spent</CardTitle>
                        </CardHeader>
                        <CardContent className="text-3xl font-semibold">৳{totalSpent}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Expense Headers</CardTitle>
                        </CardHeader>
                        <CardContent className="text-3xl font-semibold">{expenseCount}</CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Per Member</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {balances.map((balance) => (
                            <div key={balance.user_id} className="flex justify-between border-b py-2 text-sm">
                                <span>{balance.name}</span>
                                <span>
                                    paid ৳{balance.total_paid} · owed ৳{balance.total_owed} · net{' '}
                                    <strong>৳{balance.net_balance}</strong>
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
