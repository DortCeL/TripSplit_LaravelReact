import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Trip, type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { TriangleAlert } from 'lucide-react';



export default function Edit() {

    const {trip} = usePage<{ trip: Trip }>().props;

    const {data, setData, put, errors, processing} = useForm({
        name: trip.name,
        description: trip.description,
    })

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('trips.update', trip.id));
    };

    const handleDiscard = () => {
        // navigate back to the previous page
        history.back();
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Edit Trip', href: `/trips/${trip.id}/edit` }]}>
            <Head title="Trips" />
            <div className="w-8/12 p-4">
                <form className='flex flex-col gap-4' onSubmit={handleUpdate}>
                    {/* display errors */}
                    {Object.keys(errors).length > 0 &&(
                        <Alert>
                            <div className='flex items-center gap-2'>
                                <TriangleAlert  className='text-red-500'/>
                                <AlertTitle className='text-red-500'>Error!</AlertTitle>
                            </div>
                            <AlertDescription>
                                <ul className='list-disc list-inside flex flex-col gap-4 ml-16 text-red-500 font-semibold'>
                                    {Object.entries(errors).map(([key, value]) => (
                                        <li key={key}>{value}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="gap-4">
                        <Label htmlFor="name">Trip Name</Label>
                        <Input type="text" id="name" name="name" placeholder="Trip name" value={data.name} onChange={(e) => setData('name', e.target.value)}/>
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Enter a description for your trip" value={data.description} onChange={(e) => setData('description', e.target.value)}/>
                    </div>

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Processing...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleDiscard}>Discard</Button>
                    
                </form>
            </div>
        </AppLayout>
    );
}
