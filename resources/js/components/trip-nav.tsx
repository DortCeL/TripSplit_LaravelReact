import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

type TripNavProps = {
    tripId: number;
    active?: 'overview' | 'members' | 'settlements' | 'history' | 'totals';
};

const links = [
    { key: 'overview', label: 'Overview', routeName: 'trips.show' },
    { key: 'members', label: 'Members', routeName: 'trips.members.index' },
    { key: 'settlements', label: 'Settlements', routeName: 'trips.settlements.index' },
    { key: 'history', label: 'History', routeName: 'trips.history' },
    { key: 'totals', label: 'Totals', routeName: 'trips.totals' },
] as const;

export default function TripNav({ tripId, active = 'overview' }: TripNavProps) {
    return (
        <div className="mb-4 flex flex-wrap gap-2">
            {links.map((link) => (
                <Link key={link.key} href={route(link.routeName, tripId)}>
                    <Button variant={active === link.key ? 'default' : 'outline'} size="sm">
                        {link.label}
                    </Button>
                </Link>
            ))}
        </div>
    );
}
