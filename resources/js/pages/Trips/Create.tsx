import { TripHeader, TripPage } from '@/components/trip/page-shell';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { MapPin, TriangleAlert } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create a new trip',
        href: '/trips/create',
    },
];

export default function Index() {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(data);
        post(route('trips.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Trips" />
            <TripPage className="max-w-2xl">
                <TripHeader
                    title="Create a trip"
                    description="Start a new group trip to track shared expenses and settle up fairly."
                />

                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="border-b bg-secondary/40">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <MapPin className="size-5 text-primary" />
                            Trip details
                        </CardTitle>
                        <CardDescription>Give your trip a name and optional description</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
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
                                    name="name"
                                    className="h-11 text-base"
                                    placeholder="Summer beach trip"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    className="min-h-28 text-base"
                                    placeholder="Enter a description for your trip"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                            </div>

                            <Button type="submit" size="lg" disabled={processing} className="w-full sm:w-auto">
                                {processing ? 'Processing...' : 'Create trip'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </TripPage>
        </AppLayout>
    );
}
