import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Trip, type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { TriangleAlert } from 'lucide-react';

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
            <div className="w-8/12 p-4">
                <form className="flex flex-col gap-4" onSubmit={handleUpdate}>
                    {Object.keys(errors).length > 0 && (
                        <Alert>
                            <div className="flex items-center gap-2">
                                <TriangleAlert className="text-red-500" />
                                <AlertTitle className="text-red-500">Error!</AlertTitle>
                            </div>
                            <AlertDescription>
                                <ul className="ml-16 flex list-inside list-disc flex-col gap-4 font-semibold text-red-500">
                                    {Object.entries(errors).map(([key, value]) => (
                                        <li key={key}>{value}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="gap-4">
                        <Label htmlFor="name">Trip Name</Label>
                        <Input
                            type="text"
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            className="h-9 w-full rounded-md border px-2"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                        >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Processing...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.visit(route('trips.show', trip.id))}>
                        Discard
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
