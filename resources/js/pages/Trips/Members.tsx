import TripNav from '@/components/trip-nav';
import { TripHeader, TripPage } from '@/components/trip/page-shell';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Shield, UserPlus, Users } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

type Member = {
    id: number;
    role: string;
    user: { id: number; name: string; email: string };
};

type Flash = { color?: string; message?: string; tripName?: string };

const selectClassName = 'h-11 w-full rounded-xl border border-input bg-background px-3 text-base';

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function RoleBadge({ role }: { role: string }) {
    const styles: Record<string, string> = {
        owner: 'border-primary/30 bg-primary/10 text-primary',
        admin: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
        member: 'border-border bg-secondary text-secondary-foreground',
    };

    return (
        <Badge variant="outline" className={cn('capitalize', styles[role] ?? styles.member)}>
            {role === 'admin' && <Shield className="mr-1 size-3" />}
            {role}
        </Badge>
    );
}

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
            <TripPage>
                <TripHeader
                    title="Members"
                    description="Manage who has access to this trip and their roles."
                    actions={
                        <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
                            <Users className="size-3.5" />
                            {members.length} member{members.length !== 1 ? 's' : ''}
                        </Badge>
                    }
                />

                <TripNav tripId={trip.id} active="members" />

                {canManageMembers && (
                    <Card className="border-border/80 shadow-sm">
                        <CardHeader className="border-b bg-secondary/40">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <UserPlus className="size-5 text-primary" />
                                Add member
                            </CardTitle>
                            <CardDescription>Invite someone by their registered email address</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form
                                className="flex flex-col gap-5 sm:flex-row sm:items-end"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    addForm.post(route('trips.members.store', trip.id), { onSuccess: () => addForm.reset('email') });
                                }}
                            >
                                <div className="min-w-0 flex-1 space-y-2">
                                    <Label htmlFor="email">User email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="h-11 text-base"
                                        value={addForm.data.email}
                                        onChange={(e) => addForm.setData('email', e.target.value)}
                                        placeholder="friend@example.com"
                                    />
                                </div>
                                <div className="w-full space-y-2 sm:w-40">
                                    <Label htmlFor="role">Role</Label>
                                    <select
                                        id="role"
                                        className={selectClassName}
                                        value={addForm.data.role}
                                        onChange={(e) => addForm.setData('role', e.target.value)}
                                    >
                                        <option value="member">Member</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <Button type="submit" size="lg" disabled={addForm.processing} className="shrink-0">
                                    Add
                                </Button>
                            </form>
                            {Object.keys(addForm.errors).length > 0 && (
                                <Alert variant="destructive" className="mt-4">
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{Object.values(addForm.errors).join(' ')}</AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-3">
                    {members.map((member) => (
                        <Card key={member.id} className="border-border/80 shadow-sm">
                            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-4">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
                                        {getInitials(member.user.name)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-lg font-semibold">{member.user.name}</p>
                                            <RoleBadge role={member.role} />
                                        </div>
                                        <p className="truncate text-sm text-muted-foreground">{member.user.email}</p>
                                    </div>
                                </div>
                                {canManageMembers && member.role !== 'owner' && (
                                    <div className="flex flex-wrap gap-2">
                                        {(isOwner || member.role === 'member') && (
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                disabled={roleForm.processing}
                                                onClick={() => {
                                                    roleForm.setData('role', member.role === 'admin' ? 'member' : 'admin');
                                                    roleForm.put(route('trips.members.update', [trip.id, member.id]));
                                                }}
                                            >
                                                {member.role === 'admin' ? 'Demote' : 'Make admin'}
                                            </Button>
                                        )}
                                        <Button
                                            variant="destructive"
                                            size="lg"
                                            disabled={deleteForm.processing}
                                            onClick={() => {
                                                if (confirm(`Remove ${member.user.name}?`)) {
                                                    deleteForm.delete(route('trips.members.destroy', [trip.id, member.id]));
                                                }
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TripPage>
        </AppLayout>
    );
}
