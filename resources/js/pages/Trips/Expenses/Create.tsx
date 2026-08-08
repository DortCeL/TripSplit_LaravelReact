import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { TriangleAlert } from 'lucide-react';

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
        // Manual edit clears quantity mode
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
            <div className="w-full max-w-3xl p-4">
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    {Object.keys(errors).length > 0 && (
                        <Alert>
                            <div className="flex items-center gap-2">
                                <TriangleAlert className="text-red-500" />
                                <AlertTitle className="text-red-500">Error!</AlertTitle>
                            </div>
                            <AlertDescription>
                                <ul className="ml-4 list-inside list-disc text-red-500">
                                    {Object.entries(errors).map(([key, value]) => (
                                        <li key={key}>{value}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div>
                        <Label htmlFor="name">Expense Header</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Breakfast Day 1" />
                    </div>
                    <div>
                        <Label htmlFor="note">Note</Label>
                        <Textarea id="note" value={data.note} onChange={(e) => setData('note', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="expense_date">Date</Label>
                        <Input id="expense_date" type="date" value={data.expense_date} onChange={(e) => setData('expense_date', e.target.value)} />
                    </div>

                    {data.items.map((item, index) => (
                        <div key={index} className="space-y-3 rounded-lg border p-4">
                            <h3 className="font-medium">Item {index + 1}</h3>
                            <div>
                                <Label>Item Name</Label>
                                <Input
                                    value={item.name}
                                    onChange={(e) => updateItem(index, { name: e.target.value })}
                                    placeholder="Chicken"
                                />
                            </div>

                            <div className={`grid gap-3 ${item.quantity !== null ? 'sm:grid-cols-2' : ''}`}>
                                <div>
                                    <Label>Total Amount (BDT)</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={item.total_amount}
                                        onChange={(e) =>
                                            handleTotalChange(index, e.target.value === '' ? '' : Number(e.target.value))
                                        }
                                    />
                                    {item.quantity !== null && item.quantity !== '' && item.unit_cost !== null && item.unit_cost !== '' && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            ৳{item.unit_cost} × {item.quantity} = ৳{item.total_amount}
                                        </p>
                                    )}
                                </div>
                                {item.quantity !== null && (
                                    <div>
                                        <Label>Quantity</Label>
                                        <Input
                                            type="number"
                                            min={1}
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
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Set quantity to multiply the current cost. Editing total removes quantity.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label>Participants</Label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {members.map((member) => (
                                        <Button
                                            key={member.id}
                                            type="button"
                                            size="sm"
                                            variant={item.participant_ids.includes(member.id) ? 'default' : 'outline'}
                                            onClick={() => toggleParticipant(index, member.id)}
                                        >
                                            {member.name}
                                        </Button>
                                    ))}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">Equal split with BDT remainder rounding is applied automatically.</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <Label>Payers (cash handed over)</Label>
                                    <Button type="button" variant="secondary" size="sm" onClick={() => applyEveryonePaid(index)}>
                                        Everyone paid their part
                                    </Button>
                                </div>
                                {item.payers.map((payer, pIndex) => (
                                    <div key={pIndex} className="flex gap-2">
                                        <select
                                            className="h-9 w-full rounded-md border px-2"
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
                                                size="sm"
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
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        updateItem(index, {
                                            payers: [...item.payers, { payer_id: members[0]?.id ?? '', handed_over: '' }],
                                        })
                                    }
                                >
                                    Add Payer
                                </Button>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2">
                                <div>
                                    <Label>Change Taker</Label>
                                    <select
                                        className="mt-1 h-9 w-full rounded-md border px-2"
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
                                <div>
                                    <Label>Change Amount</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={item.change_amount}
                                        onChange={(e) =>
                                            updateItem(index, {
                                                change_amount: e.target.value === '' ? '' : Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button type="button" variant="outline" onClick={() => setData('items', [...data.items, blankItem(members)])}>
                        Add Another Item
                    </Button>

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Create Expense'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
