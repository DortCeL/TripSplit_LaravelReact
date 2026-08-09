import { TripHeader, TripPage } from '@/components/trip/page-shell';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Trip, type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, TriangleAlert } from 'lucide-react';

const selectClassName = 'h-11 w-full rounded-xl border border-input bg-background px-3 text-base';

export default function Edit() {
    const { trip } = usePage<{ trip: Trip }>().props;

    const { data, setData, put, errors, processing } = useForm({
        name: trip.name,
        description: trip.description ?? '',
        status: trip.status ?? 'active',
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('trips.update', trip.id));
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Edit Trip', href: `/trips/${trip.id}/edit` } satisfies BreadcrumbItem]}>
            <Head title="Edit Trip" />
            <TripPage className="max-w-2xl">
                <TripHeader
                    title="Edit trip"
                    description="Update trip details and status."
                    actions={
                        <Badge variant="secondary" className="capitalize px-3 py-1.5 text-sm">
                            {data.status}
                        </Badge>
                    }
                />

                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="border-b bg-secondary/40">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Pencil className="size-5 text-primary" />
                            Trip settings
                        </CardTitle>
                        <CardDescription>Changes apply to all members of this trip</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form className="flex flex-col gap-6" onSubmit={handleUpdate}>
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

                            <div className="space-y-2">
                                <Label htmlFor="name">Trip name</Label>
                                <Input
                                    type="text"
                                    id="name"
                                    className="h-11 text-base"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    className="min-h-28 text-base"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    className={selectClassName}
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                >
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button type="submit" size="lg" disabled={processing}>
                                    {processing ? 'Processing...' : 'Save changes'}
                                </Button>
                                <Button type="button" variant="outline" size="lg" onClick={() => router.visit(route('trips.show', trip.id))}>
                                    Discard
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </TripPage>
        </AppLayout>
    );
}
