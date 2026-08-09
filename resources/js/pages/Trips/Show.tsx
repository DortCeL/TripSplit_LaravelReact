import TripNav from '@/components/trip-nav';
import { Money } from '@/components/trip/money';
import { EmptyState, StatCard, TripHeader, TripPage } from '@/components/trip/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, Pencil, Plus, Trash2 } from 'lucide-react';
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
    const page = usePage<
        SharedData & {
            trip: TripShow;
            balances: Balance[];
            matrix: MatrixRow[];
            canManage: boolean;
            flash?: Flash;
        }
    >();

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
    const owedToYou = Math.max(you?.net_balance ?? 0, 0);
    const youOwe = Math.abs(Math.min(you?.net_balance ?? 0, 0));

    return (
        <AppLayout
            breadcrumbs={
                [
                    { title: 'Trips', href: '/trips' },
                    { title: trip.name, href: `/trips/${trip.id}` },
                ] satisfies BreadcrumbItem[]
            }
        >
            <Head title={trip.name} />
            <TripPage>
                <TripHeader
                    title={trip.name}
                    description={trip.description || 'Track shared costs and settle up with your group.'}
                    actions={
                        <>
                            {canManage && (
                                <Link href={route('trips.expenses.create', trip.id)}>
                                    <Button size="lg" className="gap-2">
                                        <Plus className="size-4" />
                                        Add expense
                                    </Button>
                                </Link>
                            )}
                            <Link href={route('trips.edit', trip.id)}>
                                <Button variant="outline" size="lg" className="gap-2">
                                    <Pencil className="size-4" />
                                    Edit
                                </Button>
                            </Link>
                        </>
                    }
                />

                <TripNav tripId={trip.id} active="overview" />

                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard label="You are owed" tone="positive">
                        <Money amount={owedToYou} size="lg" />
                    </StatCard>
                    <StatCard label="You owe" tone="negative">
                        <Money amount={youOwe} size="lg" />
                    </StatCard>
                    <StatCard label="Your net balance" tone="accent">
                        <Money amount={you?.net_balance ?? 0} size="lg" signed />
                    </StatCard>
                </div>

                <div className="grid gap-6 lg:grid-cols-5">
                    <Card className="border-border/80 shadow-sm lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-xl">Who owes whom</CardTitle>
                            <CardDescription>Quick look at outstanding debts in this trip</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {matrix.length === 0 ? (
                                <div className="rounded-xl bg-emerald-50 px-4 py-6 text-center text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                                    All settled up. Nice work!
                                </div>
                            ) : (
                                matrix.map((row, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between gap-3 rounded-xl border bg-secondary/30 px-4 py-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold">{row.from_name}</p>
                                            <p className="text-sm text-muted-foreground">owes {row.to_name}</p>
                                        </div>
                                        <Money amount={row.amount} size="md" />
                                    </div>
                                ))
                            )}
                            <Link href={route('trips.settlements.index', trip.id)}>
                                <Button variant="outline" className="mt-2 w-full gap-2" size="lg">
                                    Manage settlements
                                    <ArrowRight className="size-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-sm lg:col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                            <div>
                                <CardTitle className="text-xl">Expenses</CardTitle>
                                <CardDescription>Everything your group has spent</CardDescription>
                            </div>
                            <Badge variant="secondary">{trip.expenses.length} total</Badge>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {trip.expenses.length === 0 ? (
                                <EmptyState
                                    title="No expenses yet"
                                    description="Add your first shared expense to start calculating balances."
                                    action={
                                        canManage ? (
                                            <Link href={route('trips.expenses.create', trip.id)}>
                                                <Button size="lg">Add expense</Button>
                                            </Link>
                                        ) : undefined
                                    }
                                />
                            ) : (
                                trip.expenses.map((expense) => {
                                    const total = expense.items.reduce((sum, item) => sum + item.total_amount, 0);

                                    return (
                                        <div key={expense.id} className="overflow-hidden rounded-2xl border bg-card">
                                            <div className="flex items-start justify-between gap-3 border-b bg-secondary/40 px-4 py-3">
                                                <div>
                                                    <h3 className="text-lg font-semibold">{expense.name}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {expense.expense_date || 'No date'}
                                                        {expense.creator ? ` · ${expense.creator.name}` : ''}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Money amount={total} size="md" />
                                                    {canManage && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:bg-destructive/10"
                                                            disabled={processing}
                                                            onClick={() => {
                                                                if (confirm(`Delete expense "${expense.name}"?`)) {
                                                                    destroy(route('trips.expenses.destroy', [trip.id, expense.id]));
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-3 p-4">
                                                {expense.items.map((item) => (
                                                    <div key={item.id} className="rounded-xl bg-muted/50 p-4">
                                                        <div className="mb-3 flex items-center justify-between gap-2">
                                                            <span className="font-semibold">{item.name}</span>
                                                            <Money amount={item.total_amount} size="sm" />
                                                        </div>
                                                        <div className="grid gap-2 text-sm sm:grid-cols-2">
                                                            <div>
                                                                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                                    Split between
                                                                </p>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {item.participants.map((p) => (
                                                                        <Badge key={p.user_id} variant="outline" className="font-normal">
                                                                            {p.user?.name ?? p.user_id} · ৳{p.share_amount}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                                    Paid by
                                                                </p>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {item.payments.map((p, i) => (
                                                                        <Badge key={`${p.payer_id}-${i}`} variant="secondary" className="font-normal">
                                                                            {p.payer?.name ?? p.payer_id} · ৳{p.amount_paid}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>
                </div>
            </TripPage>
        </AppLayout>
    );
}
