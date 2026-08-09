# TripSplit

TripSplit is a collaborative expense splitter for friend groups on trips. You create a trip, invite people, log what was spent, and the app keeps track of who paid, who owes what, and how to settle up.

It was built with group tours in Bangladesh in mind, so all money amounts are whole BDT (no paisa decimals).

## Features

- **Trips**: create, edit, and delete trips; only members of a trip can see it
- **Roles**: owner, admin, and member permissions (owner can demote other admins; only owner can delete a trip)
- **Members**: invite users by email, promote/demote, remove members (only when their balance is settled)
- **Expenses**: expense headers with one or more items, participants, payers, quantity, and change handling
- **Fair splits**: equal BDT splits with remainder rounding (`floor` + leftover +1 to the first participants)
- **Balances**: live “you owe / you are owed / net” and a who-owes-whom matrix
- **Settlements**: request payment, confirm/reject (admins), forgive debts, optional gift when someone pays extra
- **History & totals**: trip activity and per-member spending overview
- **Auth**: register, login, profile/password settings (Laravel starter kit)
- **UI**: React + Inertia pages, Tailwind, toast notifications

## Tech stack

| Layer                  | Tools                                                 |
| ---------------------- | ----------------------------------------------------- |
| Backend                | Laravel 12, PHP 8.2+                                  |
| Frontend               | React 19, Inertia.js v2, TypeScript                   |
| Styling                | Tailwind CSS v4, shadcn/ui                            |
| Auth / routing helpers | Laravel session auth, Ziggy                           |
| Testing                | Pest                                                  |
| Default DB             | SQLite (easy local setup; MySQL/PostgreSQL also fine) |

## Screens / main routes

Public:

| Method   | Path                     | Name        | Description                     |
| -------- | ------------------------ | ----------- | ------------------------------- |
| GET      | `/`                      | `home`      | Welcome / landing page          |
| GET/POST | `/login`, `/register`, … | auth routes | Login, register, password reset |

Authenticated:

| Method   | Path                            | Name                          | Description                   |
| -------- | ------------------------------- | ----------------------------- | ----------------------------- |
| GET      | `/dashboard`                    | `dashboard`                   | Recent trips overview         |
| GET      | `/trips`                        | `trips.index`                 | All your trips                |
| GET/POST | `/trips/create`, `/trips`       | `trips.create`, `trips.store` | Create a trip                 |
| GET      | `/trips/{trip}`                 | `trips.show`                  | Trip hub (balances, expenses) |
| GET/PUT  | `/trips/{trip}/edit`            | `trips.edit`, `trips.update`  | Edit trip                     |
| DELETE   | `/trips/{trip}`                 | `trips.destroy`               | Delete trip (owner only)      |
| GET      | `/trips/{trip}/members`         | `trips.members.*`             | Manage members                |
| GET/POST | `/trips/{trip}/expenses/...`    | `trips.expenses.*`            | Add / delete expenses         |
| GET/POST | `/trips/{trip}/settlements/...` | `trips.settlements.*`         | Settlements & forgiveness     |
| GET      | `/trips/{trip}/history`         | `trips.history`               | Expense + settlement history  |
| GET      | `/trips/{trip}/totals`          | `trips.totals`                | Totals per member             |

Profile/settings routes live under `/settings` (from the starter kit).

## Project structure (high level)

```text
app/
  Enums/                 # Trip roles, statuses, settlement types
  Http/Controllers/      # Trip, Expense, Settlement, Member controllers
  Models/                # Trip, Expense, Payment, Settlement, …
  Policies/              # Trip authorization
  Services/              # SplitCalculator, BalanceCalculator
resources/js/
  pages/                 # Inertia React pages (welcome, dashboard, Trips/…)
  components/            # UI + trip-specific components
routes/web.php           # App routes
database/migrations/     # Schema
tests/                   # Pest feature + unit tests
```

## Local development setup

### Requirements

- PHP 8.2+
- Composer
- Node.js 18+ and npm
- SQLite (default) or another database Laravel supports

### Install

```bash
git clone <your-repo-url> tripsplit
cd tripsplit

composer install
cp .env.example .env
php artisan key:generate

# SQLite (default in many starter setups)
# Make sure DB_CONNECTION=sqlite and database/database.sqlite exists
touch database/database.sqlite

php artisan migrate

npm install
```

### Run the app

One command (Laravel server + Vite + queue):

```bash
composer run dev
```

Or separately:

```bash
php artisan serve
npm run dev
```

Then open the URL shown in the terminal (usually `http://127.0.0.1:8000`).

### Create a user

1. Open `/register` and create an account, or
2. Use Laravel tinker / a seeder if you prefer.

Invite trip members by the **email of an already registered user**.

### Useful commands

```bash
php artisan test          # run Pest tests
npm run build             # production frontend build
vendor/bin/pint           # PHP style fixes
```

## How the money logic works (short version)

1. Each expense item has a total amount (integer taka).
2. Participants get shares that always sum to the item total.
3. Payers record cash handed over; change is subtracted so **net payments = item total**.
4. Net balance for a user:

    `(total paid + settlements sent) - (total owed + settlements received)`

5. Confirmed and forgiven settlements update balances. Extra money on a settlement can be stored as a gift amount for history.

## Roles (quick reference)

| Action                             | Owner                | Admin                | Member                        |
| ---------------------------------- | -------------------- | -------------------- | ----------------------------- |
| Delete trip                        | yes                  | no                   | no                            |
| Add/remove members                 | yes                  | yes\*                | no                            |
| Demote other admins                | yes                  | no                   | no                            |
| Create expenses                    | yes                  | yes                  | no                            |
| View balances / request settlement | yes                  | yes                  | yes                           |
| Confirm/reject settlements         | yes                  | yes                  | no                            |
| Forgive a debt                     | yes (or as creditor) | yes (or as creditor) | only if they are the creditor |

\* Admins cannot remove or demote other admins. Outstanding balances block member removal.

## Screenshots

![TripSplit Landing page](screenshots/landing_page.png)
![TripSplit Login/Signup page](screenshots/auth.png)
![TripSplit Landing page](screenshots/dashboard.png)
![TripSplit Trip Overview](screenshots/trip_overview.png)
![TripSplit Trip Members](screenshots/trip_members.png)
![TripSplit Settlements](screenshots/trip_settlements.png)
![TripSplit Expense History](screenshots/trip_history.png)
![TripSplit Total Expense](screenshots/trip_totals.png)

```md
![Welcome](docs/screenshots/welcome.png)
![Trip overview](docs/screenshots/trip-show.png)
![Add expense](docs/screenshots/expense-create.png)
```

## Testing

```bash
php artisan test
```

Coverage includes trip membership rules, expense/net payment creation, settlement gifts/confirmation, and the split/balance helpers.
