import { TripHeader, TripPage } from '@/components/trip/page-shell';
import { formatTaka } from '@/components/trip/money';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, TriangleAlert, Users } from 'lucide-react';

type Member = { id: number; name: string };

type ItemForm = {
    name: string;
    total_amount: number | '';
    /** UI-only: null hides the quantity field after a manual total edit */
    quantity: number | '' | null;
    /** UI-only: remembered unit price while quantity mode is active */
    unit_cost: number | '' | null;
    participant_ids: number[];
    payers: Array<{ payer_id: number | ''; handed_over: number | '' }>;
    change_taker_id: number | '';
    change_amount: number | '';
};

const selectClassName = 'h-11 w-full rounded-xl border border-input bg-background px-3 text-base';

function equalSplit(totalAmount: number, participantIds: number[]): Record<number, number> {
    const count = participantIds.length;
    const base = Math.floor(totalAmount / count);
    const remainder = totalAmount % count;
    const shares: Record<number, number> = {};

    participantIds.forEach((id, index) => {
        shares[id] = base + (index < remainder ? 1 : 0);
    });

    return shares;
}

function blankItem(members: Member[]): ItemForm {
    return {
        name: '',
        total_amount: '',
        quantity: '',
        unit_cost: '',
        participant_ids: members.map((m) => m.id),
        payers: [{ payer_id: members[0]?.id ?? '', handed_over: '' }],
        change_taker_id: members[0]?.id ?? '',
        change_amount: 0,
    };
}

export default function CreateExpense({ trip, members }: { trip: { id: number; name: string }; members: Member[] }) {
    const { data, setData, post, errors, processing } = useForm<{
        name: string;
        note: string;
        expense_date: string;
        items: ItemForm[];
    }>({
        name: '',
        note: '',
        expense_date: new Date().toISOString().slice(0, 10),
        items: [blankItem(members)],
    });

    const updateItem = (index: number, patch: Partial<ItemForm>) => {
        const items = [...data.items];
        items[index] = { ...items[index], ...patch };
        setData('items', items);
    };

    const toggleParticipant = (index: number, userId: number) => {
        const item = data.items[index];
        const exists = item.participant_ids.includes(userId);
        updateItem(index, {
            participant_ids: exists
                ? item.participant_ids.filter((id) => id !== userId)
                : [...item.participant_ids, userId],
        });
    };

    const applyQuantityTotal = (index: number, unitCost: number | '', quantity: number | '') => {
        if (unitCost === '' || quantity === '' || Number(quantity) < 1) {
            updateItem(index, { unit_cost: unitCost, quantity });
            return;
        }

        updateItem(index, {
            unit_cost: Number(unitCost),
            quantity: Number(quantity),
            total_amount: Number(unitCost) * Number(quantity),
        });
    };

    const handleTotalChange = (index: number, value: number | '') => {
        updateItem(index, {
            total_amount: value,
            quantity: null,
            unit_cost: null,
        });
    };

    const applyEveryonePaid = (index: number) => {
        const item = data.items[index];
        const total = Number(item.total_amount);

        if (!total || item.participant_ids.length === 0) {
            return;
        }

        const shares = equalSplit(total, item.participant_ids);

        updateItem(index, {
            payers: item.participant_ids.map((id) => ({
                payer_id: id,
                handed_over: shares[id],
            })),
            change_amount: 0,
            change_taker_id: item.participant_ids[0],
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('trips.expenses.store', trip.id));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Trips', href: '/trips' },
                { title: trip.name, href: `/trips/${trip.id}` },
                { title: 'Add Expense', href: `/trips/${trip.id}/expenses/create` },
            ]}
        >
            <Head title="Add Expense" />
            <TripPage className="max-w-3xl">
                <TripHeader
                    title="Add expense"
                    description={`Record a shared cost for ${trip.name}. Split items fairly and track who paid.`}
                />

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive">
                            <TriangleAlert className="size-4" />
                            <AlertTitle>Something went wrong</AlertTitle>
                            <AlertDescription>
                                <ul className="mt-2 list-inside list-disc">
                                    {Object.entries(errors).map(([key, value]) => (
                                        <li key={key}>{value}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    <Card className="overflow-hidden border-border/80 shadow-sm">
                        <CardHeader className="border-b bg-secondary/40">
                            <CardTitle className="text-xl">Trip details</CardTitle>
                            <CardDescription>General information about this expense</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 p-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Expense header</Label>
                                <Input
                                    id="name"
                                    className="h-11 text-base"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Breakfast Day 1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="note">Note</Label>
                                <Textarea
                                    id="note"
                                    className="min-h-24 text-base"
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                    placeholder="Optional notes about this expense"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expense_date">Date</Label>
                                <Input
                                    id="expense_date"
                                    type="date"
                                    className="h-11 text-base"
                                    value={data.expense_date}
                                    onChange={(e) => setData('expense_date', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {data.items.map((item, index) => (
                        <Card key={index} className="overflow-hidden border-border/80 shadow-sm">
                            <div className="flex items-center gap-3 border-b bg-primary/5 px-5 py-4">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                                    {index + 1}
                                </span>
                                <div>
                                    <h3 className="text-lg font-semibold">Item {index + 1}</h3>
                                    <p className="text-sm text-muted-foreground">Amount, split, and payment details</p>
                                </div>
                            </div>
                            <CardContent className="space-y-6 p-6">
                                <div className="space-y-2">
                                    <Label>Item name</Label>
                                    <Input
                                        className="h-11 text-base"
                                        value={item.name}
                                        onChange={(e) => updateItem(index, { name: e.target.value })}
                                        placeholder="Chicken biryani"
                                    />
                                </div>

                                <div className={`grid gap-4 ${item.quantity !== null ? 'sm:grid-cols-2' : ''}`}>
                                    <div className="space-y-2">
                                        <Label>Total amount (BDT)</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            className="h-11 text-base"
                                            value={item.total_amount}
                                            onChange={(e) =>
                                                handleTotalChange(index, e.target.value === '' ? '' : Number(e.target.value))
                                            }
                                        />
                                        {item.quantity !== null &&
                                            item.quantity !== '' &&
                                            item.unit_cost !== null &&
                                            item.unit_cost !== '' && (
                                                <p className="text-sm text-muted-foreground">
                                                    {formatTaka(Number(item.unit_cost))} × {item.quantity} ={' '}
                                                    {formatTaka(Number(item.total_amount))}
                                                </p>
                                            )}
                                    </div>
                                    {item.quantity !== null && (
                                        <div className="space-y-2">
                                            <Label>Quantity</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                className="h-11 text-base"
                                                value={item.quantity}
                                                placeholder="e.g. 3"
                                                onChange={(e) => {
                                                    const quantity = e.target.value === '' ? '' : Number(e.target.value);
                                                    const unitCost =
                                                        item.unit_cost !== null && item.unit_cost !== ''
                                                            ? item.unit_cost
                                                            : item.total_amount === ''
                                                              ? ''
                                                              : item.total_amount;
                                                    applyQuantityTotal(index, unitCost, quantity);
                                                }}
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                Set quantity to multiply the current cost. Editing total removes quantity.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 rounded-2xl bg-secondary/40 p-5">
                                    <div className="flex items-center gap-2">
                                        <Users className="size-4 text-primary" />
                                        <Label className="text-base">Participants</Label>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {members.map((member) => {
                                            const selected = item.participant_ids.includes(member.id);
                                            return (
                                                <button
                                                    key={member.id}
                                                    type="button"
                                                    className={cn(
                                                        'rounded-full px-5 py-2.5 text-sm font-semibold transition-colors',
                                                        selected
                                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                                            : 'border border-input bg-background text-muted-foreground hover:bg-secondary hover:text-foreground',
                                                    )}
                                                    onClick={() => toggleParticipant(index, member.id)}
                                                >
                                                    {member.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Equal split with BDT remainder rounding is applied automatically.
                                    </p>
                                </div>

                                <div className="space-y-4 rounded-2xl border bg-card p-5">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <Label className="text-base">Payers (cash handed over)</Label>
                                        <Button type="button" variant="secondary" size="lg" onClick={() => applyEveryonePaid(index)}>
                                            Everyone paid their part
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {item.payers.map((payer, pIndex) => (
                                            <div key={pIndex} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                                <select
                                                    className={selectClassName}
                                                    value={payer.payer_id}
                                                    onChange={(e) => {
                                                        const payers = [...item.payers];
                                                        payers[pIndex] = { ...payers[pIndex], payer_id: Number(e.target.value) };
                                                        updateItem(index, { payers });
                                                    }}
                                                >
                                                    {members.map((m) => (
                                                        <option key={m.id} value={m.id}>
                                                            {m.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    className="h-11 text-base sm:max-w-48"
                                                    placeholder="Handed over"
                                                    value={payer.handed_over}
                                                    onChange={(e) => {
                                                        const payers = [...item.payers];
                                                        payers[pIndex] = {
                                                            ...payers[pIndex],
                                                            handed_over: e.target.value === '' ? '' : Number(e.target.value),
                                                        };
                                                        updateItem(index, { payers });
                                                    }}
                                                />
                                                {item.payers.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="lg"
                                                        className="shrink-0"
                                                        onClick={() =>
                                                            updateItem(index, {
                                                                payers: item.payers.filter((_, i) => i !== pIndex),
                                                            })
                                                        }
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        className="gap-2"
                                        onClick={() =>
                                            updateItem(index, {
                                                payers: [...item.payers, { payer_id: members[0]?.id ?? '', handed_over: '' }],
                                            })
                                        }
                                    >
                                        <Plus className="size-4" />
                                        Add payer
                                    </Button>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Change taker</Label>
                                        <select
                                            className={selectClassName}
                                            value={item.change_taker_id}
                                            onChange={(e) => updateItem(index, { change_taker_id: Number(e.target.value) })}
                                        >
                                            {members.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Change amount</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            className="h-11 text-base"
                                            value={item.change_amount}
                                            onChange={(e) =>
                                                updateItem(index, {
                                                    change_amount: e.target.value === '' ? '' : Number(e.target.value),
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="w-full gap-2"
                        onClick={() => setData('items', [...data.items, blankItem(members)])}
                    >
                        <Plus className="size-4" />
                        Add another item
                    </Button>

                    <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border bg-card/95 p-5 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            {data.items.length} item{data.items.length !== 1 ? 's' : ''} ready to save
                        </p>
                        <Button type="submit" size="lg" disabled={processing} className="sm:min-w-48">
                            {processing ? 'Saving...' : 'Create expense'}
                        </Button>
                    </div>
                </form>
            </TripPage>
        </AppLayout>
    );
}
