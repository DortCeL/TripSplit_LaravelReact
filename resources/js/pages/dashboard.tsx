import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Trip } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ trips = [] }: { trips?: (Trip & { members_count?: number })[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Dashboard</h1>
                        <p className="text-sm text-muted-foreground">Your recent trips and tour overview.</p>
                    </div>
                    <Link href={route('trips.create')}>
                        <Button>New Trip</Button>
                    </Link>
                </div>

                {trips.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {trips.map((trip) => (
                            <Card key={trip.id}>
                                <CardHeader>
                                    <CardTitle>{trip.name}</CardTitle>
                                    <CardDescription>{trip.description || 'No description'}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">{trip.members_count ?? 0} members</span>
                                    <Link href={route('trips.show', trip.id)}>
                                        <Button size="sm">Open</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="relative min-h-[40vh] overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        <div className="relative flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                            <p className="text-muted-foreground">No trips yet. Create one to start splitting expenses.</p>
                            <Link href={route('trips.create')}>
                                <Button>Create Trip</Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
