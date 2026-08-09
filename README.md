<img width="2560" height="1440" alt="landing_page" src="https://github.com/user-attachments/assets/7ac34f07-26ce-40d5-969e-d47586b5d20d" />

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

Landing page<img width="2560" height="1440" alt="landing_page" src="https://github.com/user-attachments/assets/7735783d-66ef-4d57-9f65-99d7f2414822" />

Signup page<img width="2560" height="1440" alt="auth_page" src="https://github.com/user-attachments/assets/c4981c20-841e-4697-8653-691283ef36e7" />

Dashboard<img width="2560" height="1440" alt="dashboard" src="https://github.com/user-attachments/assets/96051d95-0a31-4283-a44e-ac507a30d1bb" />

Trip Overview<img width="2560" height="1440" alt="trip_overview" src="https://github.com/user-attachments/assets/d647d718-d3c1-4b42-b2fe-0495ea30d802" />

rip Members<img width="2560" height="1440" alt="trip_members" src="https://github.com/user-attachments/assets/0d64e2c7-f1f2-4515-91a4-4221b917831f" />

Settlements<img width="2560" height="1440" alt="trip_settlements" src="https://github.com/user-attachments/assets/d32efc23-4d8c-4f7a-a3ba-3dc9dea1c89b" />

Expense History<img width="2560" height="1440" alt="trip_history" src="https://github.com/user-attachments/assets/94713cf3-f9fa-483a-abfe-7fb9b48174a2" />

Total Expense<img width="2560" height="1440" alt="trip_totals" src="https://github.com/user-attachments/assets/93a0f7d5-07a7-4115-9ce4-829fcc6e8a33" />


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
