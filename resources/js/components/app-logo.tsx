import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <AppLogoIcon className="size-6" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-base">
                <span className="mb-0.5 truncate text-base leading-none font-bold">
                    Trip<span className="text-primary">Split</span>
                </span>
            </div>
        </>
    );
}
