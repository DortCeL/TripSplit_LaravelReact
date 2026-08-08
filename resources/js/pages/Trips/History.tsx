import TripNav from '@/components/trip-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

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
            <div className="space-y-4 p-4">
                <h1 className="text-2xl font-semibold">{trip.name} · History</h1>
                <TripNav tripId={trip.id} active="history" />

                <Card>
                    <CardHeader>
                        <CardTitle>Expenses</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {expenses.map((expense) => (
                            <div key={expense.id} className="flex justify-between border-b py-2 text-sm">
                                <span>
                                    {expense.name}
                                    <span className="text-muted-foreground">
                                        {' '}
                                        · {expense.expense_date || 'n/a'} · {expense.creator?.name}
                                    </span>
                                </span>
                                <span className="font-medium">
                                    ৳{expense.items.reduce((sum, item) => sum + item.total_amount, 0)}
                                </span>
                            </div>
                        ))}
                        {expenses.length === 0 && <p className="text-sm text-muted-foreground">No expenses.</p>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Settlements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {settlements.map((settlement) => (
                            <div key={settlement.id} className="flex justify-between border-b py-2 text-sm">
                                <span>
                                    {settlement.from_user?.name} → {settlement.to_user?.name} ({settlement.status}/
                                    {settlement.type})
                                </span>
                                <span className="font-medium">
                                    ৳{settlement.amount}
                                    {settlement.gift_amount > 0 ? ` +৳${settlement.gift_amount}` : ''}
                                </span>
                            </div>
                        ))}
                        {settlements.length === 0 && <p className="text-sm text-muted-foreground">No settlements.</p>}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
