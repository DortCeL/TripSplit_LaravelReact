import TripNav from '@/components/trip-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

type Balance = {
    user_id: number;
    name: string;
    total_paid: number;
    total_owed: number;
    settlements_sent: number;
    settlements_received: number;
    net_balance: number;
};

type MatrixRow = {
    from_user_id: number;
    from_name: string;
    to_user_id: number;
    to_name: string;
    amount: number;
};

type Expense = {
    id: number;
    name: string;
    note?: string;
    expense_date?: string;
    creator?: { id: number; name: string };
    items: Array<{
        id: number;
        name: string;
        total_amount: number;
        participants: Array<{ user_id: number; share_amount: number; user?: { name: string } }>;
        payments: Array<{ payer_id: number; amount_paid: number; payer?: { name: string } }>;
    }>;
};

type TripShow = {
    id: number;
    name: string;
    description?: string;
    status?: string;
    expenses: Expense[];
};

type Flash = { color?: string; message?: string; tripName?: string };

export default function Show() {
    const page = usePage<SharedData & {
        trip: TripShow;
        balances: Balance[];
        matrix: MatrixRow[];
        canManage: boolean;
        flash?: Flash;
    }>();

    const { trip, balances, matrix, canManage, auth } = page.props;
    const { flash } = page;

    useEffect(() => {
        if (!flash?.message) {
            return;
        }
        const text = flash.tripName ? `${flash.message}: ${flash.tripName}` : flash.message;
        flash.color === 'red' ? toast.error(text) : toast.success(text);
    }, [flash]);

    const { delete: destroy, processing } = useForm();

    const you = balances.find((b) => b.user_id === auth.user.id) ?? balances[0];

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Trips', href: '/trips' },
                { title: trip.name, href: `/trips/${trip.id}` },
            ] satisfies BreadcrumbItem[]}
        >
            <Head title={trip.name} />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">{trip.name}</h1>
                        <p className="text-sm text-muted-foreground">{trip.description || 'No description'}</p>
                    </div>
                    <div className="flex gap-2">
                        {canManage && (
                            <Link href={route('trips.expenses.create', trip.id)}>
                                <Button>Add Expense</Button>
                            </Link>
                        )}
                        <Link href={route('trips.edit', trip.id)}>
                            <Button variant="outline">Edit Trip</Button>
                        </Link>
                    </div>
                </div>

                <TripNav tripId={trip.id} active="overview" />

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">You are owed</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold text-green-600">
                            ৳{Math.max(you?.net_balance ?? 0, 0)}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">You owe</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold text-red-600">
                            ৳{Math.abs(Math.min(you?.net_balance ?? 0, 0))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Net Balance</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">৳{you?.net_balance ?? 0}</CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Settlement Matrix</CardTitle>
                        <CardDescription>Who owes whom right now</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {matrix.length === 0 ? (
                            <p className="text-sm text-muted-foreground">All settled up.</p>
                        ) : (
                            matrix.map((row, index) => (
                                <div key={index} className="flex items-center justify-between rounded-md border p-3 text-sm">
                                    <span>
                                        <strong>{row.from_name}</strong> owes <strong>{row.to_name}</strong>
                                    </span>
                                    <span className="font-semibold">৳{row.amount}</span>
                                </div>
                            ))
                        )}
                        <Link href={route('trips.settlements.index', trip.id)}>
                            <Button variant="outline" size="sm" className="mt-2">
                                Manage Settlements
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Expenses</CardTitle>
                        <CardDescription>Headers and items for this trip</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {trip.expenses.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No expenses yet.</p>
                        ) : (
                            trip.expenses.map((expense) => (
                                <div key={expense.id} className="rounded-lg border p-4">
                                    <div className="mb-3 flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-medium">{expense.name}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {expense.expense_date || 'No date'}
                                                {expense.creator ? ` · by ${expense.creator.name}` : ''}
                                            </p>
                                        </div>
                                        {canManage && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                disabled={processing}
                                                onClick={() => {
                                                    if (confirm(`Delete expense "${expense.name}"?`)) {
                                                        destroy(route('trips.expenses.destroy', [trip.id, expense.id]));
                                                    }
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        {expense.items.map((item) => (
                                            <div key={item.id} className="rounded-md bg-muted/40 p-3 text-sm">
                                                <div className="mb-2 flex justify-between font-medium">
                                                    <span>{item.name}</span>
                                                    <span>৳{item.total_amount}</span>
                                                </div>
                                                <p>
                                                    Participants:{' '}
                                                    {item.participants
                                                        .map((p) => `${p.user?.name ?? p.user_id} (৳${p.share_amount})`)
                                                        .join(', ')}
                                                </p>
                                                <p>
                                                    Paid by:{' '}
                                                    {item.payments
                                                        .map((p) => `${p.payer?.name ?? p.payer_id} (৳${p.amount_paid})`)
                                                        .join(', ')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
