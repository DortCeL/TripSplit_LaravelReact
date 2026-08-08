import TripNav from '@/components/trip-nav';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

type Member = {
    id: number;
    role: string;
    user: { id: number; name: string; email: string };
};

type Flash = { color?: string; message?: string; tripName?: string };

export default function Members({
    trip,
    members,
    canManageMembers,
    isOwner,
}: {
    trip: { id: number; name: string };
    members: Member[];
    canManageMembers: boolean;
    isOwner: boolean;
}) {
    const { flash } = usePage<{ flash?: Flash }>();
    const addForm = useForm({ email: '', role: 'member' });
    const roleForm = useForm({ role: 'member' });
    const deleteForm = useForm({});

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
                { title: 'Members', href: `/trips/${trip.id}/members` },
            ]}
        >
            <Head title={`${trip.name} · Members`} />
            <div className="space-y-4 p-4">
                <h1 className="text-2xl font-semibold">{trip.name} · Members</h1>
                <TripNav tripId={trip.id} active="members" />

                {canManageMembers && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Member</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                className="flex flex-col gap-3 sm:flex-row sm:items-end"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    addForm.post(route('trips.members.store', trip.id), { onSuccess: () => addForm.reset('email') });
                                }}
                            >
                                <div className="flex-1">
                                    <Label htmlFor="email">User Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={addForm.data.email}
                                        onChange={(e) => addForm.setData('email', e.target.value)}
                                        placeholder="friend@example.com"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="role">Role</Label>
                                    <select
                                        id="role"
                                        className="h-9 rounded-md border px-2"
                                        value={addForm.data.role}
                                        onChange={(e) => addForm.setData('role', e.target.value)}
                                    >
                                        <option value="member">Member</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <Button type="submit" disabled={addForm.processing}>
                                    Add
                                </Button>
                            </form>
                            {Object.keys(addForm.errors).length > 0 && (
                                <Alert className="mt-3">
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{Object.values(addForm.errors).join(' ')}</AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-3">
                    {members.map((member) => (
                        <Card key={member.id}>
                            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                                <div>
                                    <p className="font-medium">{member.user.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {member.user.email} · {member.role}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {canManageMembers && member.role !== 'owner' && (
                                        <>
                                            {(isOwner || member.role === 'member') && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={roleForm.processing}
                                                    onClick={() => {
                                                        roleForm.setData('role', member.role === 'admin' ? 'member' : 'admin');
                                                        roleForm.put(route('trips.members.update', [trip.id, member.id]));
                                                    }}
                                                >
                                                    {member.role === 'admin' ? 'Demote' : 'Make Admin'}
                                                </Button>
                                            )}
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                disabled={deleteForm.processing}
                                                onClick={() => {
                                                    if (confirm(`Remove ${member.user.name}?`)) {
                                                        deleteForm.delete(route('trips.members.destroy', [trip.id, member.id]));
                                                    }
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
