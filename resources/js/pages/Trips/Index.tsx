import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from '@/components/ui/card';
import {  } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Trips',
        href: '/trips',
    },
];

export default function Index() {

    const { flash } = usePage<{ flash?: { message: string; tripName: string } }>()
    const {trips} = usePage().props;

    useEffect(() => {
        if (flash?.color === 'green') {
            toast.success(`Trip "${flash.tripName}" created!`);
        } else if (flash?.color === 'red') {
            toast.error(`Trip "${flash.tripName}" deleted!`);
        }
    }, [flash]);

    const {processing, delete: destroy} = useForm()

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete the trip - "${name}"?`)) {
            destroy(route('trips.destroy', id))
        }
    }
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Trips" />
            <div className='m-4'>
                <Link href="/trips/create">
                    <Button variant="default">Create Trip</Button>
                </Link>
            </div>

            {trips.length > 0 ? (
                <div className="m-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {trips.map((trip) => (
                    <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                        <CardTitle>{trip.name}</CardTitle>
                        <CardDescription>{trip.description || 'No description'}</CardDescription>
                        </CardHeader>
                        <CardContent className='flex justify-end gap-4'>
                        {/* may add extra info here, like date created */}
                            <Link href={route('trips.edit', trip.id)}><Button variant="outline">Edit trip</Button></Link>
                            <Button variant="destructive" disabled={processing} onClick={() => handleDelete(trip.id, trip.name)}>Delete trip</Button>
                        </CardContent>
                    </Card>
                    ))}
                </div>
                ) : (
                <div className="text-center py-12 text-gray-500">
                    <p>No trips yet. Start your first adventure!</p>
                </div>
                )}
        </AppLayout>
    );
}
