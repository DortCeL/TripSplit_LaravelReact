🧳 TripSplit – Comprehensive Project Specification (v2.0)
Version: 2.0 (Updated with BDT Integer logic, Forgiveness, Overpayment & Change)
Target Stack: Laravel 11.x, React 18, Inertia.js, Tailwind CSS, Shadcn/ui, PostgreSQL/MySQL.

1. Project Overview
   TripSplit is a collaborative expense management application tailored for friend groups traveling together.

Core Purpose: Track who paid for what, split costs fairly among trip members, and settle debts transparently.

Key Differentiator: Strict admin-confirmed settlements AND support for forgiving debts (treating it as a gift).

Primary Actor: Trip Members (with Admin/Sub-Admin privileges).

2. Core Business Rules & Logic
   2.1. Trips
   A User creates a Trip (becomes the Owner).

The Owner can add other Users as Members.

The Owner and specifically appointed Members are Admins.

Members can only see Trips they are part of.

2.2. Roles & Permissions (Crucial)
Action Admin Member
Add/Remove Members ✅ ❌
Appoint/Remove Admins ✅ ❌
Create/Edit/Delete Expense Items ✅ ❌
Create/Edit/Delete Expense Headers ✅ ❌
View all trip transactions/balances ✅ ✅
Request to settle a debt ("I paid") ✅ ✅
Confirm/Reject settlement requests ✅ (Only Admins) ❌
Forgive a debt (waive amount owed) ✅ (Only Admin or the Creditor) ✅ (If they are the Creditor)
Delete the entire Trip ✅ (Owner only) ❌
2.3. Expense Structure (Hierarchy)
Expense Header: "Breakfast Day 1" OR "Bus Ride to Hotel".

Note about Items: An expense can have 1 or Many expense items.

For a meal, use multiple items (Chicken, Beef, Rice).

For a bus ride/rent, use 1 item (e.g., "Bus Fare") and assign all riders as participants. This keeps the UI flexible without overcomplicating the data model.

Expense Items: Belongs to an Expense.

Each Item has a Total Cost.

Each Item has a list of Participants.

Each Participant has a Share Amount (must be an integer, see 2.4).

2.4. Splitting Logic, Integer Currency & Rounding (BDT Specific)
Currency Constraint: Bangladeshi Taka (BDT) does not have fractional units (paisa). All monetary values MUST be integers (e.g., integer or decimal(10,0) in the database).

Equal Split with Remainder: If 5 Taka is split among 2 people, the exact split is 2.5. Since fractions aren't allowed:

Give floor(amount / participants) to everyone.

Distribute the remainder (amount % participants) as +1 Taka to the first N participants in the list (or sequentially) until the sum matches the total.

Example: 5 Taka / 2 people = 2 Taka each + remainder 1. User A gets 3 Taka, User B gets 2 Taka. (Sum = 5).

Custom Splits: Users can override the automatic calculation and manually assign any integer share, as long as sum(share_amount) == total_amount.

2.5. Payments, Overpayment, and "Change" (Crucial Fix)
Users can pay more than the item's cost (e.g., paying 1500 for a 1200 item, receiving 300 change).
Implementation Rule: We do NOT store the raw "paid" amount separately from "change". We store the net contribution to the item.

Database Rule: The sum of payments.amount_paid for an expense_item must exactly equal expense_items.total_amount.

UI Interaction: When creating an expense:

User enters item cost = 1200.
User selects Payer A (pays 1000 cash) and Payer B (pays 500 cash) = total 1500.
User selects "Change Taker" = Payer A (takes 300).
System Calculation:
Payer A net contribution = 1000 - 300 = 700.
Payer B net contribution = 500 - 0 = 500.
Total = 1200. ✅
(Alternatively, allow an input field for "Net Paid" directly to simplify UX, but the above logic must be shown).
2.6. Balance Calculation Formula (The Golden Rule)
For a specific User (U) inside a specific Trip:

Total Paid: Sum of amount_paid where payer_id = U (Net contributions only).

Total Owed (Share): Sum of share_amount where user_id = U.

Settlements Sent: Sum of confirmed or forgiven settlements where from_user_id = U.

Settlements Received: Sum of confirmed or forgiven settlements where to_user_id = U.

Net Balance: (Total Paid + Settlements Received) - (Total Owed + Settlements Sent)

Positive number = The user is owed money (Creditor).

Negative number = The user owes money (Debtor).

Goal: Net Balance = 0 for everyone.

2.7. Debt Forgiveness (New Feature)
A Creditor (or an Admin) can "Forgive" a specific debt owed to them by a Debtor.

Action: The creditor clicks "Forgive" on a specific outstanding balance.

Immediate Effect: The debt is cleared. Crucially, the forgiven amount is added to the Creditor's Total Paid/Expenditure (because the creditor effectively gifted that money and will never see it again).

Database Effect: Insert a settlement record with status = 'forgiven' and confirmed_by = creditor_id (or admin).

Balance Impact:

Debtor's liability decreases (they owe less).

Creditor's "Net Paid" effectively increases by this amount (it counts as money they spent).

3. Database Schema (Tables & Relationships)
   Update models with these specific field changes.

users (Default Laravel)
trips (owner_id, name, description, status)
trip_members (trip_id, user_id, role: admin/member)

expenses (Header)

id, trip_id, created_by (trip_members.id), name, note, expense_date.

expense_items

id, expense_id, name, total_amount (integer, NOT decimal).

item_participants (Who consumes the item)

id, expense_item_id, user_id, share_amount (integer).

Constraint: SUM(share_amount) == expense_items.total_amount.

payments (Net contribution after change)

id, expense_item_id, payer_id (user.id), amount_paid (integer).

Constraint: SUM(amount_paid) == expense_items.total_amount.

settlements (Tracking debt clearance & forgiveness)

id, trip_id, from_user_id (debtor), to_user_id (creditor), amount (integer),

status (enum: pending, confirmed, rejected, forgiven),

confirmed_by (nullable, user.id),

type (enum: manual, forgiveness) - New field to distinguish forgiveness actions.

confirmed_at, timestamps.

4. UI/UX Flow & Pages (Inertia React Routes)
   Dashboard: Overview of trips.

Trips Index: List of trips.

Trip Dashboard:

Balances Cards: Show "You are owed", "You owe", "Net Balance".

Settlement Matrix: A table showing specific debts between users (e.g., A owes B $20).

Action Buttons: If logged-in user is the creditor, show "Request Payment" (creates pending settlement) and "Forgive Debt" (creates forgiven settlement).

Expenses List: Accordion list.

Expense Creation Wizard (The Complex Part):

Step 1: Header Details.

Step 2: Add Items.

For each item: Name, Cost.

Select Participants (auto-calculates equal split, adjust rounding manually).

Select Payers & Change:

"Add Payer" -> Dropdown + Amount they handed over.

"Who took change?" -> Dropdown + Change Amount. (System calculates net contribution behind the scenes).

5. Edge Cases & Specific Instructions for Cursor AI
   Handle these explicitly in code.

Integer Division (BDT):

When auto-calculating shares, use Math.floor(total / count). Distribute the remainder by adding +1 to the first total % count participants.

Validate on the backend that all submitted shares are integers and sum correctly.

Forbidden Actions:

A user cannot confirm their own settlement request.

A user cannot forgive a debt that doesn't belong to them (i.e., they aren't the to_user_id and aren't an admin).

Removing Members:

If an Admin tries to remove a member, check their net balance. If not zero, throw a validation error: "User still has outstanding balances. Settle or forgive debts first."

Overpayment/Change Logic:

Backend must validate SUM(payments.amount_paid) == item.total_amount.

If the frontend sends "handed over" and "change taken", calculate the net before submitting.

6. Example Scenario Walkthrough (Updated)
   Setup: User A creates "Cox Bazar". Adds B, C, D.

Expense: Admin A creates "Bus Rent" (1 Item, cost 105 Taka).

Participants: A, B, C (3 people). Auto-split: 35 each.

Payer: A pays 500 Taka.

Change: A takes 395 Taka change.

Net Contribution stored: A paid 500 - 395 = 105 Taka.

Result: A's balance is 105 paid - 35 share = +70 (owed 35 each by B & C).

Forgiveness: A decides to treat B. Clicks "Forgive" on B's 35 Taka debt.

Settlement created: status = forgiven, from=B, to=A, amount=35.

New Balance: B = 0, A = 35 (only C owes A now, and A's expenditure effectively increased by 35).

7. Tech Stack Specifics
   Backend: use what exists in this project.

Validation: how the existing code handles.

Frontend: React + Inertia + Shadcn (Card, Form, Dialog).

Toasts: react-hot-toast for flash messages.

8. Critical "Do Not Do" List
   ❌ Do not use floats or decimals. Only integers.

❌ Do not allow SUM(payments) != item.total_amount. Strict equality required.

❌ Do not allow a creditor to request settlement from themselves.

❌ Do not allow deletion of a forgiven settlement (it must remain for audit history).

ONE MORE THING: let's say a debt is of 77 taka. since exactly 77 taka cannot be given exactly, they can pay 80 taka and the other person can approve this. this is resolve that debt but adjust their expenditure accordingly.

ANOTHER THING: You can do something beyond whats specified in this text file if that helps the project. but in that case, take my approval first.
