import { cn } from '@/lib/utils';

export function formatTaka(amount: number): string {
    return `৳${Math.abs(amount).toLocaleString('en-BD')}`;
}

export function Money({
    amount,
    className,
    signed = false,
    size = 'md',
}: {
    amount: number;
    className?: string;
    signed?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
    const color =
        amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : amount < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground';

    const sizes = {
        sm: 'text-base font-semibold',
        md: 'text-xl font-bold',
        lg: 'text-3xl font-bold tracking-tight',
        xl: 'text-4xl font-bold tracking-tight',
    };

    const prefix = signed && amount > 0 ? '+' : amount < 0 ? '-' : '';

    return (
        <span className={cn(sizes[size], color, 'tabular-nums', className)}>
            {prefix}
            {formatTaka(amount)}
        </span>
    );
}
