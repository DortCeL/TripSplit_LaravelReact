import { cn } from '@/lib/utils';
import { Plane } from 'lucide-react';
import { type ReactNode } from 'react';

export function TripPage({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8', className)}>{children}</div>;
}

export function TripHeader({
    title,
    description,
    actions,
}: {
    title: string;
    description?: string;
    actions?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
                {description ? <p className="max-w-2xl text-base text-muted-foreground">{description}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
    );
}

export function StatCard({
    label,
    children,
    tone = 'neutral',
}: {
    label: string;
    children: ReactNode;
    tone?: 'positive' | 'negative' | 'neutral' | 'accent';
}) {
    const tones = {
        positive: 'border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-900 dark:from-emerald-950/40 dark:to-card',
        negative: 'border-rose-200/80 bg-gradient-to-br from-rose-50 to-white dark:border-rose-900 dark:from-rose-950/40 dark:to-card',
        neutral: 'border-border bg-card',
        accent: 'border-amber-200/80 bg-gradient-to-br from-amber-50 to-white dark:border-amber-900 dark:from-amber-950/30 dark:to-card',
    };

    return (
        <div className={cn('rounded-2xl border p-5 shadow-sm', tones[tone])}>
            <p className="mb-2 text-sm font-medium text-muted-foreground">{label}</p>
            {children}
        </div>
    );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/25 bg-secondary/40 px-6 py-16 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Plane className="size-7" />
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="mt-2 max-w-md text-muted-foreground">{description}</p>
            {action ? <div className="mt-6">{action}</div> : null}
        </div>
    );
}
