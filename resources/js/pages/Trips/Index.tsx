import { EmptyState, TripHeader, TripPage } from '@/components/trip/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Trip } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { MapPin, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Trips', href: '/trips' }];

type Flash = { color?: string; message?: string; tripName?: string };

export default function Index() {
    const { flash } = usePage<{ flash?: Flash }>();
    const { trips } = usePage<{ trips: (Trip & { members_count?: number; owner?: { id: number; name: string } })[] }>().props;

    useEffect(() => {
        if (!flash?.message) {
            return;
        }

        const text = flash.tripName ? `${flash.message}: ${flash.tripName}` : flash.message;

        if (flash.color === 'red') {
            toast.error(text);
        } else {
            toast.success(text);
        }
    }, [flash]);

    const { processing, delete: destroy } = useForm();

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete the trip - "${name}"?`)) {
            destroy(route('trips.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Trips" />
            <TripPage>
                <TripHeader
                    title="Your trips"
                    description="Open a trip to track expenses, balances, and settlements with your group."
                    actions={
                        <Link href="/trips/create">
                            <Button size="lg" className="gap-2">
                                <Plus className="size-4" />
                                New trip
                            </Button>
                        </Link>
                    }
                />

                {trips.length > 0 ? (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {trips.map((trip) => (
                            <Card
                                key={trip.id}
                                className="group overflow-hidden border-border/80 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                            >
                                <div className="h-1.5 bg-gradient-to-r from-primary via-teal-400 to-amber-300" />
                                <CardHeader className="pb-3">
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <CardTitle className="text-xl leading-snug">{trip.name}</CardTitle>
                                        <Badge variant="secondary" className="capitalize">
                                            {trip.status ?? 'active'}
                                        </Badge>
                                    </div>
                                    <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                                        {trip.description || 'No description yet'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-medium text-secondary-foreground">
                                            <Users className="size-3.5" />
                                            {trip.members_count ?? 0} members
                                        </span>
                                        {trip.owner ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                                                <MapPin className="size-3.5" />
                                                {trip.owner.name}
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Link href={route('trips.show', trip.id)} className="flex-1">
                                            <Button className="w-full" size="lg">
                                                Open trip
                                            </Button>
                                        </Link>
                                        <Link href={route('trips.edit', trip.id)}>
                                            <Button variant="outline" size="lg" className="px-3">
                                                <Pencil className="size-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            disabled={processing}
                                            onClick={() => handleDelete(trip.id, trip.name)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No trips yet"
                        description="Create your first trip and start splitting expenses fairly with friends."
                        action={
                            <Link href="/trips/create">
                                <Button size="lg">Create your first trip</Button>
                            </Link>
                        }
                    />
                )}
            </TripPage>
        </AppLayout>
    );
}
