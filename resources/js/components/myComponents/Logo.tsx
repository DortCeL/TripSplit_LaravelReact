import AppLogoIcon from '@/components/app-logo-icon';

export default function Logo({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <AppLogoIcon className="size-5" />
            </div>
            <div className="grid text-left leading-none">
                <span className="truncate text-base font-bold tracking-tight text-foreground">
                    Trip<span className="text-primary">Split</span>
                </span>
            </div>
        </div>
    );
}
