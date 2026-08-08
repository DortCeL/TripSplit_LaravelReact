import AppLogoIcon from '@/components/app-logo-icon';

export default function Logo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#1b1b18] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06)] dark:bg-[#EDEDEC]">
                <AppLogoIcon className="size-5 fill-current text-[#FDFDFC] dark:text-[#0a0a0a]" />
            </div>
            <div className="grid text-left leading-none">
                <span className="truncate text-sm font-semibold tracking-tight text-[#1b1b18] dark:text-[#EDEDEC]">
                    Trip<span className="text-[#f53003] dark:text-[#FF4433]">Split</span>
                </span>
            </div>
        </div>
    );
}
