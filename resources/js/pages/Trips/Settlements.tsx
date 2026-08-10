import TripNav from '@/components/trip-nav';
import { Money, formatTaka } from '@/components/trip/money';
import { EmptyState, TripHeader, TripPage } from '@/components/trip/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, Check, Gift, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type MatrixRow = {
    from_user_id: number;
    from_name: string;
    to_user_id: number;
    to_name: string;
    amount: number;
};

type Settlement = {
    id: number;
    amount: number;
    gift_amount: number;
    status: string;
    type: string;
    from_user?: { id: number; name: string };
    to_user?: { id: number; name: string };
};

type Flash = { color?: string; message?: string; tripName?: string };

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

export default function Settlements({
    trip,
    settlements,
    matrix,
    canConfirm,
    currentUserId,
}: {
    trip: { id: number; name: string };
    settlements: Settlement[];
    matrix: MatrixRow[];
    canConfirm: boolean;
    currentUserId: number;
}) {
    const { flash } = usePage<{ flash?: Flash }>();
    const requestForm = useForm({
        from_user_id: currentUserId,
        to_user_id: matrix[0]?.to_user_id ?? '',
        amount: matrix[0]?.amount ?? '',
        paid_amount: matrix[0]?.amount ?? '',
    });
    const actionForm = useForm({});
    const forgiveForm = useForm({ from_user_id: '', to_user_id: '', amount: '' });
    const [selectedDebt, setSelectedDebt] = useState<MatrixRow | null>(null);

    useEffect(() => {
        if (!flash?.message) return;
        const text = flash.tripName ? `${flash.message}: ${flash.tripName}` : flash.message;
        flash.color === 'red' ? toast.error(text) : toast.success(text);
    }, [flash]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Trips', href: '/trips' },
                { title: trip.name, href: `/trips/${trip.id}` },
                { title: 'Settlements', href: `/trips/${trip.id}/settlements` },
            ]}
        >
            <Head title={`${trip.name} · Settlements`} />
            <TripPage>
                <TripHeader
                    title="Settlements"
                    description="Request payments, forgive debts, and track settlement history for this trip."
                />

                <TripNav tripId={trip.id} active="settlements" />

                <Card className="border-border/80 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Outstanding debts</CardTitle>
                        <CardDescription>Request payment or forgive outstanding balances</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {matrix.length === 0 ? (
                            <div className="rounded-2xl bg-emerald-50 px-6 py-10 text-center dark:bg-emerald-950/40">
                                <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">All settled up</p>
                                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">No outstanding debts in this trip.</p>
                            </div>
                        ) : (
                            matrix.map((row, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col gap-4 rounded-2xl border bg-secondary/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0 space-y-1">
                                        <p className="text-lg font-semibold">{row.from_name}</p>
                                        <p className="flex items-center gap-2 text-muted-foreground">
                                            owes {row.to_name}
                                            <ArrowRight className="size-4 shrink-0" />
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Money amount={row.amount} size="md" />
                                        <div className="flex flex-wrap gap-2">
                                            {Number(currentUserId) === Number(row.from_user_id) && (
                                                <Button
                                                    size="lg"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedDebt(row);
                                                        requestForm.setData({
                                                            from_user_id: row.from_user_id,
                                                            to_user_id: row.to_user_id,
                                                            amount: row.amount,
                                                            paid_amount: row.amount,
                                                        });
                                                    }}
                                                >
                                                    Request payment
                                                </Button>
                                            )}
                                            {(Number(currentUserId) === Number(row.to_user_id) || canConfirm) && (
                                                <Button
                                                    size="lg"
                                                    variant="secondary"
                                                    disabled={forgiveForm.processing}
                                                    onClick={() => {
                                                        forgiveForm.setData({
                                                            from_user_id: row.from_user_id,
                                                            to_user_id: row.to_user_id,
                                                            amount: row.amount,
                                                        });
                                                        forgiveForm.post(route('trips.settlements.forgive', trip.id));
                                                    }}
                                                >
                                                    Forgive
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {selectedDebt && Number(currentUserId) === Number(selectedDebt.from_user_id) && (
                    <Card className="overflow-hidden border-primary/20 shadow-sm">
                        <CardHeader className="border-b bg-primary/5">
                            <CardTitle className="text-xl">Create settlement request</CardTitle>
                            <CardDescription>
                                Paying more than the debt treats the extra as a gift (e.g. {formatTaka(80)} for a{' '}
                                {formatTaka(77)} debt).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form
                                className="grid gap-5 sm:grid-cols-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    requestForm.post(route('trips.settlements.store', trip.id), {
                                        onSuccess: () => setSelectedDebt(null),
                                    });
                                }}
                            >
                                <div className="space-y-2">
                                    <Label>Debt amount</Label>
                                    <Input
                                        type="number"
                                        className="h-11 text-base"
                                        value={requestForm.data.amount}
                                        onChange={(e) => requestForm.setData('amount', Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Paid amount</Label>
                                    <Input
                                        type="number"
                                        className="h-11 text-base"
                                        value={requestForm.data.paid_amount}
                                        onChange={(e) => requestForm.setData('paid_amount', Number(e.target.value))}
                                    />
                                </div>
                                {Number(requestForm.data.paid_amount) > Number(requestForm.data.amount) && (
                                    <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:col-span-2 dark:bg-amber-950/40 dark:text-amber-200">
                                        <Gift className="size-4 shrink-0" />
                                        Gift amount:{' '}
                                        {formatTaka(Number(requestForm.data.paid_amount) - Number(requestForm.data.amount))}
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-3 sm:col-span-2">
                                    <Button type="submit" size="lg" disabled={requestForm.processing}>
                                        Submit request
                                    </Button>
                                    <Button type="button" variant="outline" size="lg" onClick={() => setSelectedDebt(null)}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-border/80 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Settlement history</CardTitle>
                        <CardDescription>Past requests, confirmations, and forgiven debts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {settlements.length === 0 ? (
                            <EmptyState
                                title="No settlements yet"
                                description="Settlement requests and confirmations will appear here."
                            />
                        ) : (
                            settlements.map((settlement) => (
                                <div
                                    key={settlement.id}
                                    className="flex flex-col gap-4 rounded-2xl border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
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
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Money amount={settlement.amount} size="sm" />
                                            {settlement.gift_amount > 0 && (
                                                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Gift className="size-3.5" />+{formatTaka(settlement.gift_amount)} gift
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {canConfirm && settlement.status === 'pending' && (
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                size="lg"
                                                className="gap-2"
                                                disabled={actionForm.processing || Number(settlement.from_user?.id) === Number(currentUserId)}
                                                onClick={() =>
                                                    actionForm.post(route('trips.settlements.confirm', [trip.id, settlement.id]))
                                                }
                                            >
                                                <Check className="size-4" />
                                                Confirm
                                            </Button>
                                            <Button
                                                size="lg"
                                                variant="destructive"
                                                className="gap-2"
                                                disabled={actionForm.processing}
                                                onClick={() =>
                                                    actionForm.post(route('trips.settlements.reject', [trip.id, settlement.id]))
                                                }
                                            >
                                                <X className="size-4" />
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </TripPage>
        </AppLayout>
    );
}
