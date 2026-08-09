import { EmptyState, TripHeader, TripPage } from '@/components/trip/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Trip } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { MapPin, Plus, Users } from 'lucide-react';

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
            <TripPage>
                <TripHeader
                    title="Dashboard"
                    description="Your recent trips and tour overview."
                    actions={
                        <Link href={route('trips.create')}>
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
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                                        <Users className="size-3.5" />
                                        {trip.members_count ?? 0} members
                                    </span>
                                    <Link href={route('trips.show', trip.id)}>
                                        <Button className="w-full gap-2" size="lg">
                                            <MapPin className="size-4" />
                                            Open trip
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No trips yet"
                        description="Create your first trip and start splitting expenses fairly with friends."
                        action={
                            <Link href={route('trips.create')}>
                                <Button size="lg" className="gap-2">
                                    <Plus className="size-4" />
                                    Create trip
                                </Button>
                            </Link>
                        }
                    />
                )}
            </TripPage>
        </AppLayout>
    );
}
