import TripNav from '@/components/trip-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
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
            <div className="space-y-4 p-4">
                <h1 className="text-2xl font-semibold">{trip.name} · Settlements</h1>
                <TripNav tripId={trip.id} active="settlements" />

                <Card>
                    <CardHeader>
                        <CardTitle>Outstanding Debts</CardTitle>
                        <CardDescription>Request payment or forgive</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {matrix.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No outstanding debts.</p>
                        ) : (
                            matrix.map((row, index) => (
                                <div key={index} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                                    <span className="text-sm">
                                        <strong>{row.from_name}</strong> owes <strong>{row.to_name}</strong> ৳{row.amount}
                                    </span>
                                    <div className="flex gap-2">
                                        {currentUserId === row.from_user_id && (
                                            <Button
                                                size="sm"
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
                                                Request Payment
                                            </Button>
                                        )}
                                        {(currentUserId === row.to_user_id || canConfirm) && (
                                            <Button
                                                size="sm"
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
                            ))
                        )}
                    </CardContent>
                </Card>

                {selectedDebt && currentUserId === selectedDebt.from_user_id && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Settlement Request</CardTitle>
                            <CardDescription>
                                Paying more than the debt treats the extra as a gift (e.g. 80 for a 77 debt).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                className="grid gap-3 sm:grid-cols-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    requestForm.post(route('trips.settlements.store', trip.id), {
                                        onSuccess: () => setSelectedDebt(null),
                                    });
                                }}
                            >
                                <div>
                                    <Label>Debt Amount</Label>
                                    <Input
                                        type="number"
                                        value={requestForm.data.amount}
                                        onChange={(e) => requestForm.setData('amount', Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <Label>Paid Amount</Label>
                                    <Input
                                        type="number"
                                        value={requestForm.data.paid_amount}
                                        onChange={(e) => requestForm.setData('paid_amount', Number(e.target.value))}
                                    />
                                </div>
                                <div className="flex gap-2 sm:col-span-2">
                                    <Button type="submit" disabled={requestForm.processing}>
                                        Submit Request
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setSelectedDebt(null)}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Settlement History</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {settlements.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No settlements yet.</p>
                        ) : (
                            settlements.map((settlement) => (
                                <div key={settlement.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm">
                                    <div>
                                        <p>
                                            {settlement.from_user?.name} → {settlement.to_user?.name}: ৳{settlement.amount}
                                            {settlement.gift_amount > 0 ? ` (+৳${settlement.gift_amount} gift)` : ''}
                                        </p>
                                        <p className="text-muted-foreground">
                                            {settlement.status} · {settlement.type}
                                        </p>
                                    </div>
                                    {canConfirm && settlement.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                disabled={actionForm.processing || settlement.from_user?.id === currentUserId}
                                                onClick={() =>
                                                    actionForm.post(route('trips.settlements.confirm', [trip.id, settlement.id]))
                                                }
                                            >
                                                Confirm
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                disabled={actionForm.processing}
                                                onClick={() =>
                                                    actionForm.post(route('trips.settlements.reject', [trip.id, settlement.id]))
                                                }
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
