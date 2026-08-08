import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Trip } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Trips', href: '/trips' },
];

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
            <div className="m-4">
                <Link href="/trips/create">
                    <Button variant="default">Create Trip</Button>
                </Link>
            </div>

            {trips.length > 0 ? (
                <div className="m-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {trips.map((trip) => (
                        <Card key={trip.id} className="transition-shadow hover:shadow-lg">
                            <CardHeader>
                                <CardTitle>{trip.name}</CardTitle>
                                <CardDescription>{trip.description || 'No description'}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                <p className="text-sm text-muted-foreground">
                                    {trip.members_count ?? 0} members
                                    {trip.owner ? ` · Owner: ${trip.owner.name}` : ''}
                                </p>
                                <div className="flex justify-end gap-2">
                                    <Link href={route('trips.show', trip.id)}>
                                        <Button variant="default">Open</Button>
                                    </Link>
                                    <Link href={route('trips.edit', trip.id)}>
                                        <Button variant="outline">Edit</Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        disabled={processing}
                                        onClick={() => handleDelete(trip.id, trip.name)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="py-12 text-center text-gray-500">
                    <p>No trips yet. Start your first adventure!</p>
                </div>
            )}
        </AppLayout>
    );
}
