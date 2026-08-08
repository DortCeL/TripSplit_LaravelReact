import Logo from '@/components/myComponents/Logo';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-between">
                        <div className='cursor-pointer'>
                            <Logo />
                        </div>

                        <div className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                        </div>
                    </nav>
                </header>
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[335px] flex-col items-center gap-6 lg:max-w-4xl lg:flex-row lg:items-start lg:gap-12">
                        {/* Text Content */}
                        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
                        <h1 className="mb-2 text-3xl font-bold text-gray-900 lg:text-4xl">
                            Welcome to TripSplit
                        </h1>
                        <p className="text-base text-gray-600 lg:text-lg">
                            The ultimate app for splitting travel expenses with friends and family. 
                            Easily track who paid for what, settle debts, and enjoy your trip without 
                            the financial hassle.
                        </p>
                        </div>

                        {/* Image */}
                        <div className="flex w-full max-w-[300px] items-center justify-center lg:max-w-md">
                        <img
                            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop"
                            alt="Travel and splitting expenses"
                            className="h-auto w-full rounded-lg shadow-lg"
                        />
                        </div>
                    </main>
                    </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
