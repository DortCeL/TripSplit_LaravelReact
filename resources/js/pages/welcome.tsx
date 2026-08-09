import Logo from '@/components/myComponents/Logo';
import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2, HandCoins, Scale, Users } from 'lucide-react';

const features = [
    {
        icon: Users,
        title: 'Share trips with friends',
        description: 'Create a trip, invite members, and keep everyone on the same page from day one.',
    },
    {
        icon: HandCoins,
        title: 'Track who paid what',
        description: 'Log meals, rides, and stays with item-level shares, including quantity, payers, and change.',
    },
    {
        icon: Scale,
        title: 'See fair balances',
        description: 'Instant “you owe / you are owed” totals in whole BDT taka, with smart remainder rounding.',
    },
    {
        icon: CheckCircle2,
        title: 'Settle without awkwardness',
        description: 'Request payment, confirm settlements, forgive a debt, or gift a little extra. All of it stays tracked.',
    },
];

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const ctaHref = auth.user ? route('dashboard') : route('register');
    const ctaLabel = auth.user ? 'Go to dashboard' : 'Start splitting free';

    return (
        <>
            <Head title="Welcome">
                <meta
                    head-key="description"
                    name="description"
                    content="TripSplit helps friend groups track shared travel expenses, split costs fairly in BDT, and settle up without the spreadsheet chaos."
                />
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=fraunces:600,700|instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-[hsl(160,30%,98%)] text-foreground dark:bg-background">
                <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
                    <Link href="/" className="transition-opacity hover:opacity-90">
                        <Logo />
                    </Link>
                    <nav className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                        {auth.user ? (
                            <>
                                <span className="hidden text-sm text-muted-foreground sm:inline">
                                    Logged in as <span className="font-semibold text-foreground">{auth.user.name}</span>
                                </span>
                                <Link href={route('dashboard')}>
                                    <Button size="lg">Dashboard</Button>
                                </Link>
                                <Link href={route('logout')} method="post" as="button">
                                    <Button variant="outline" size="lg">
                                        Log out
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href={route('login')}>
                                    <Button variant="ghost" size="lg">
                                        Log in
                                    </Button>
                                </Link>
                                <Link href={route('register')}>
                                    <Button size="lg">Register</Button>
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <section className="relative overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage:
                                "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&h=900&fit=crop')",
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[hsl(173,45%,12%)]/92 via-[hsl(173,40%,16%)]/78 to-[hsl(173,35%,20%)]/45" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(45_212_191_/_0.25),transparent_55%)]" />

                    <div className="relative mx-auto flex min-h-[78vh] w-full max-w-6xl flex-col justify-center px-6 py-16 lg:px-8 lg:py-24">
                        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-3 duration-700">
                            <p className="mb-4 font-[Fraunces,serif] text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                Trip<span className="text-teal-300">Split</span>
                            </p>
                            <h1 className="mb-5 max-w-xl text-2xl font-semibold leading-snug text-white/95 sm:text-3xl">
                                Split travel expenses fairly, without the spreadsheet chaos.
                            </h1>
                            <p className="mb-8 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
                                Built for friend groups on the road. Track shared costs in BDT, see who owes whom, and
                                settle up with confidence.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link href={ctaHref}>
                                    <Button
                                        size="lg"
                                        className="h-12 bg-teal-400 px-7 text-base font-semibold text-teal-950 hover:bg-teal-300"
                                    >
                                        {ctaLabel}
                                    </Button>
                                </Link>
                                {!auth.user && (
                                    <Link href={route('login')}>
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="h-12 border-white/40 bg-white/10 px-7 text-base text-white backdrop-blur hover:bg-white/20 hover:text-white"
                                        >
                                            I already have an account
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="font-[Fraunces,serif] text-3xl font-bold tracking-tight sm:text-4xl">
                            What TripSplit solves
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                            Group trips get messy fast: someone pays for the bus, someone else covers dinner, and by the
                            end nobody remembers who owes what. TripSplit turns that confusion into clear balances and
                            clean settlements.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                                style={{ animationDelay: `${index * 80}ms` }}
                            >
                                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <feature.icon className="size-6" />
                                </div>
                                <h3 className="text-xl font-semibold">{feature.title}</h3>
                                <p className="mt-2 text-muted-foreground leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="border-y border-border/70 bg-secondary/50">
                    <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-20">
                        <div>
                            <h2 className="font-[Fraunces,serif] text-3xl font-bold tracking-tight sm:text-4xl">
                                Made for real trips in Bangladesh
                            </h2>
                            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                                Money is always whole taka, with no paisa decimals. Equal splits handle remainders fairly,
                                overpayments can include a gift, and admins can forgive debts when you treat a friend.
                            </p>
                            <ul className="mt-6 space-y-3 text-base text-foreground/90">
                                <li className="flex gap-3">
                                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                                    Expense headers with multiple items, participants, and payers
                                </li>
                                <li className="flex gap-3">
                                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                                    Live settlement matrix so everyone sees the truth
                                </li>
                                <li className="flex gap-3">
                                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                                    History and totals to review the whole tour later
                                </li>
                            </ul>
                        </div>
                        <div className="relative overflow-hidden rounded-3xl shadow-lg">
                            <img
                                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&h=700&fit=crop"
                                alt="Friends traveling together"
                                className="h-full min-h-[280px] w-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-teal-950/80 to-transparent p-6">
                                <p className="text-lg font-semibold text-white">Less math. More memories.</p>
                                <p className="mt-1 text-sm text-white/80">From Cox’s Bazar weekends to long group tours.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-6xl px-6 py-16 text-center lg:px-8 lg:py-20">
                    <h2 className="font-[Fraunces,serif] text-3xl font-bold tracking-tight sm:text-4xl">
                        Ready for the next trip?
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-muted-foreground sm:text-lg">
                        Create a trip in minutes, add your friends, and let TripSplit keep the money fair.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <Link href={ctaHref}>
                            <Button size="lg" className="h-12 px-8 text-base">
                                {ctaLabel}
                            </Button>
                        </Link>
                    </div>
                </section>

                <footer className="border-t border-border bg-card">
                    <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
                        <div className="sm:col-span-2 lg:col-span-1">
                            <Logo />
                            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                                Collaborative expense tracking for friend groups traveling together. Fair splits,
                                clear balances, easy settlements.
                            </p>
                        </div>
                        <div>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">Product</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <Link href={auth.user ? route('trips.index') : route('register')} className="hover:text-primary">
                                        Trips
                                    </Link>
                                </li>
                                <li>
                                    <Link href={auth.user ? route('dashboard') : route('login')} className="hover:text-primary">
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <span className="text-muted-foreground/80">Settlements & history</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">Account</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                {auth.user ? (
                                    <li>
                                        <Link href={route('dashboard')} className="hover:text-primary">
                                            Open app
                                        </Link>
                                    </li>
                                ) : (
                                    <>
                                        <li>
                                            <Link href={route('login')} className="hover:text-primary">
                                                Log in
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href={route('register')} className="hover:text-primary">
                                                Create account
                                            </Link>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">About</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                TripSplit helps groups avoid money drama after the adventure, so friendships stay
                                intact when the receipts pile up.
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-border">
                        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
                            <p>© {new Date().getFullYear()} TripSplit. All rights reserved.</p>
                            <p>Built for fair travel with friends.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
