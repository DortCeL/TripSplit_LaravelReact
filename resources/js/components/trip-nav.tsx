import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { History, LayoutDashboard, Receipt, Users, Wallet } from 'lucide-react';

type TripNavProps = {
    tripId: number;
    active?: 'overview' | 'members' | 'settlements' | 'history' | 'totals';
};

const links = [
    { key: 'overview', label: 'Overview', routeName: 'trips.show', icon: LayoutDashboard },
    { key: 'members', label: 'Members', routeName: 'trips.members.index', icon: Users },
    { key: 'settlements', label: 'Settlements', routeName: 'trips.settlements.index', icon: Wallet },
    { key: 'history', label: 'History', routeName: 'trips.history', icon: History },
    { key: 'totals', label: 'Totals', routeName: 'trips.totals', icon: Receipt },
] as const;

export default function TripNav({ tripId, active = 'overview' }: TripNavProps) {
    return (
        <nav className="overflow-x-auto rounded-2xl border bg-card/80 p-1.5 shadow-sm backdrop-blur">
            <div className="flex min-w-max gap-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = active === link.key;

                    return (
                        <Link
                            key={link.key}
                            href={route(link.routeName, tripId)}
                            className={cn(
                                'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                            )}
                        >
                            <Icon className="size-4" />
                            {link.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
