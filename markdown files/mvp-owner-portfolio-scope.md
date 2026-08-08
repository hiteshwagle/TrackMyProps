# TrackMyProps Owner-Only Portfolio MVP Scope

**Status:** Accepted MVP scope

**Decision date:** 8 August 2026

**Applies to:** Identity, database, backend, contracts, frontend, tests, and MVP delivery

## 1. Interpretation

The MVP serves one private owner per authenticated account. Each account manages only its own portfolio.

This does not mean one hardcoded global application user. The application may have multiple registered accounts, but accounts cannot share portfolios or access one another's data.

## 2. MVP goals

The owner can:

- sign up, sign in, and sign out;
- maintain a profile containing name, authentication email, and an optional phone number;
- add, view, edit, archive, and delete their properties according to the approved deletion rules;
- record basic property attributes;
- record purchase details, current property value, and a simple loan summary;
- add named income items for a property;
- add named expense items for a property;
- view property-level totals;
- view portfolio analytics across all properties they own.

## 3. Deferred collaboration features

The MVP does not implement:

- households;
- household memberships;
- invitations;
- owner transfer;
- admin, member, viewer, or advisor roles;
- shared properties or portfolios;
- professional collaboration;
- role or permission management screens.

The broader household and permissions documentation describes potential post-MVP capability and does not control the owner-only MVP.

## 4. Identity and authorisation model

Supabase Auth provides identity. The only MVP application role is the implicit owner of records whose `owner_user_id` equals the authenticated user's ID.

Do not add a role table, role column, membership table, permission cache, or household abstraction for the MVP.

Every owner-scoped record must still be protected by:

- backend authentication and ownership checks;
- database row-level security;
- automated owner-isolation tests.

Minimum access tests are:

- authenticated owner can select, insert, update, and delete permitted records;
- a different authenticated user cannot select, insert for, update, or delete the owner's records;
- an unauthenticated user cannot access owner records;
- an owner cannot change a record's `owner_user_id` to another user;
- child income and expense rows cannot be attached to another user's property.

RLS remains necessary even though there is only one role. Authentication alone does not prove ownership of a row.

## 4.1 Registration and profile

The MVP uses Supabase email-and-password authentication. Registration is open to independent users, and each registered user receives a private portfolio.

Registration and onboarding rules:

- email and password are required for authentication;
- name is required for the application profile;
- phone number is optional and is profile data, not an authentication or authorisation input;
- registration requires one unchecked Terms and Conditions checkbox;
- the checkbox links to a versioned Terms and Conditions URL;
- the Terms and Conditions page contains the Privacy Policy link;
- the accepted document identifier or version and acceptance time must be recorded;
- password reset is supported;
- no role selection, household setup, or invitation step is shown.

Do not copy the authentication email into an independently editable authorisation field. Never use profile or user-editable metadata for access decisions.

## 5. Supabase development environment

The local Supabase runtime at `http://127.0.0.1:54321` is the accepted active development environment. This supersedes the earlier remote-only development decision recorded in ADR-022.

Rules:

- do not add production credentials or identifiers to the repository;
- keep generated local state and temporary files ignored;
- commit every accepted schema change as a versioned migration;
- verify current Supabase CLI commands and documentation before schema work;
- apply schema changes locally through committed migrations until a remote environment workflow is explicitly approved;
- never use the service-role or secret key in the frontend;
- use synthetic records for development and tests.

CI database isolation remains unresolved. Before migration or RLS tests run in CI, approve an isolated, repeatable Supabase test mechanism. CI must not depend on a developer's running local instance or destructively reset a shared remote project.

## 6. Frontend experience

The first release targets Expo React Native for web. iOS and Android remain later targets of the same codebase.

Frontend rules:

- English only;
- Australian English formatting, AUD, square metres, and Australia/Sydney as initial defaults;
- a clean light “liquid” visual theme using restrained translucent surfaces, system fonts, accessible neutral colours, and readable contrast;
- no dark mode in the MVP;
- no formal WCAG 2.2 AA certification in the MVP, while retaining basic labels, keyboard operation on web, scalable text, and readable contrast;
- bottom navigation containing Dashboard, Properties, Analytics, and Settings;
- Dashboard and Analytics remain separate screens;
- online operation is required; offline mode shows a clear unavailable or reconnect state and does not permit offline editing;
- saves show success only after backend confirmation;
- an unfinished form warns before being discarded and is not persisted as a device draft;
- push notifications, maps, property-data lookup, photographs, documents, product analytics, and commercial monitoring providers remain deferred.

## 7. Property record scope

The initial property record should contain only fields required for the first usable workflow:

```text
property_id
owner_user_id
display_name
address_line_1
address_line_2
suburb
state
postcode
country
property_type
bedrooms
bathrooms
car_spaces
land_area
building_area
purchase_date
purchase_price
current_value
current_value_as_of
has_loan
original_loan_amount
remaining_loan_balance
loan_balance_as_of
annual_interest_rate
repayment_amount
repayment_frequency
next_repayment_date
notes
status
sold_date
sale_price
deleted_at
created_at
updated_at
```

Rules:

- address entry is manual until a maps or property-data provider is separately approved;
- address line 2 is optional; the other structured address fields are required;
- the initial property types are house, apartment/unit, townhouse, villa, land, commercial, and other;
- display name, structured address, property type, bedrooms, bathrooms, car spaces, land area, building area, purchase date, and purchase price are required;
- notes are optional;
- bedrooms and bathrooms permit half values; car spaces are whole numbers;
- area values require an explicit unit, initially square metres;
- area values may contain decimals;
- money uses decimal strings at API boundaries and `Decimal` in backend calculations;
- currency is explicit and initially AUD;
- missing values remain missing and are never converted to zero;
- current value is user-provided and must not be represented as a verified valuation;
- all user-entered dates use a date picker and cross API boundaries as ISO calendar dates;
- the form has two steps: required property details followed by optional financial details;
- if current value is supplied, its as-of date is required;
- a property may be active, sold, archived, or soft-deleted;
- only currently owned properties can be created directly;
- marking a property sold requires sale date and sale price, moves it to the Archived tab, and excludes it from current analytics by default;
- selling costs are deferred.

### 7.1 Loan summary

The optional financial step first asks whether the property has a loan.

If the property has no loan, the application records a known zero remaining balance. If it has a loan, these fields are required:

```text
original_loan_amount
remaining_loan_balance
loan_balance_as_of
annual_interest_rate
repayment_amount
repayment_frequency
next_repayment_date
```

Repayment frequency supports weekly, fortnightly, monthly, quarterly, and annually. “EMI rate” is represented by two explicit fields: annual interest rate as a percentage and regular repayment amount in AUD. “EMI date” is represented as the next repayment date.

The backend derives the displayed principal paid value:

```text
principal_paid = original_loan_amount - remaining_loan_balance
```

Do not store an independently editable `loan_paid` value. Label the result as principal paid because it excludes interest and fees. Negative results are invalid in the MVP. Redraw, refinancing, multiple loans, loan splits, offsets, repayment history, automatic payment advancement, and full amortisation modelling are deferred.

### 7.2 Property archive and deletion

Archive and deletion are distinct:

- archiving moves the property to the Archived tab without deleting it;
- the Settings preference controls whether archived properties are included in analytics and defaults to excluded;
- removing a property sets `deleted_at` and hides it from all ordinary owner queries;
- do not use a field named `shouldUserRead`; visibility is a lifecycle rule, not a permission;
- soft-deleted property data remains until confirmed account deletion or an approved retention policy requires earlier removal;
- the backend, not the frontend, must enforce exclusion of soft-deleted records;
- account deletion removes soft-deleted properties along with the rest of the owner's live data.

Indefinite retention of soft-deleted properties requires privacy and legal approval before production. The UI must call this action “Remove property,” not “permanently delete,” while the row remains stored.

## 8. Dynamic property income and expenses

“Add a field” means creating a child line item, not adding a database column or arbitrary JSON property.

Each income item contains at minimum:

```text
income_item_id
property_id
name
amount
frequency or one-off date
created_at
updated_at
```

Each expense item contains at minimum:

```text
expense_item_id
property_id
name
amount
frequency or one-off date
created_at
updated_at
```

Rent is an income item with a user-visible name such as `Rent`. Other owner-defined earnings use the same model. Owner-defined expense names use the expense-item model.

Names are labels only. They must not change calculation behaviour or create executable expressions.

Income and expense rules:

- amounts are positive; the item type determines whether the amount adds to income or expenses;
- permitted frequencies are weekly, fortnightly, monthly, quarterly, annually, and one-off;
- recurring items require a start date and may have an end date;
- one-off items require an occurrence date;
- suggested names include Rent, Council rates, Insurance, Maintenance, and Property management;
- custom names remain permitted;
- categories beyond the name are deferred;
- the MVP stores only the current item definition and does not expose edit history;
- deleting an item requires confirmation.

## 9. Analytics scope

The first analytics page should show only deterministic metrics supported by entered data:

```text
total_properties
total_asset_value
total_remaining_loan
total_equity
total_income for the selected period
total_expenses for the selected period
net_cash_flow for the selected period
```

Definitions:

- `total_asset_value` is the sum of available user-provided current property values;
- `total_remaining_loan` is the sum of available remaining loan balances;
- `total_equity` is total asset value minus total remaining loan when required inputs exist;
- net cash flow is normalized income minus normalized expenses for the same period.

The default period is annual, with a monthly/annual selector. Normalisation uses weekly × 52, fortnightly × 26, monthly × 12, quarterly × 4, and annual × 1. A one-off item is included only when its date falls within the selected period.

The initial page contains metric cards and a per-property breakdown without charts. Archived and sold properties are excluded by default. A Settings preference may include archived records, but sold properties must remain distinguishable from currently owned assets.

The backend owns all authoritative totals. The frontend only presents results.

When only some inputs are missing, the frontend shows the known total marked `Incomplete` and states how many properties are missing the input. Missing values are never silently converted to zero. Every calculated response must identify its calculation version and inputs.

## 10. Account deletion

Account and data deletion is a manual MVP process:

- Settings provides instructions and the approved deletion-request email address;
- the owner sends an ordinary email from the email address registered to the account;
- the operator verifies the request by replying to the registered address and receiving explicit confirmation;
- after confirmation, the operator revokes active sessions, deletes all live owner data, and deletes the Supabase Auth account without an application recovery or retention window;
- deletion includes active and soft-deleted properties, income, expenses, derived analytics, exports, and any other owner-derived live data;
- the operator records a minimal non-sensitive deletion completion event and sends confirmation without including deleted personal or financial data;
- the deletion runbook must prevent deletion of the wrong account and verify that owner data is no longer accessible.

The product cannot promise immediate physical erasure from provider-managed backups until the current Supabase plan, backup retention, restoration, and legal obligations have been verified. This provider-managed residual copy is not an application recovery period and must not be restored into active use after a confirmed deletion.

The manual recipient address, verification runbook, response target, backup handling, and legal/privacy approval must be completed before production registration opens.

## 11. Resolved financial semantics

The earlier financial questions are resolved as follows:

1. frequencies are weekly, fortnightly, monthly, quarterly, annually, and one-off;
2. analytics defaults to annual and supports monthly selection;
3. current values and remaining loan balances require as-of dates when entered;
4. bedrooms and bathrooms permit half values;
5. property archive, sold, soft-delete, and account-deletion behaviour is defined above;
6. income and expense items represent current definitions only in the MVP;
7. money is displayed to two decimal places; authoritative calculations retain the precision required by the shared contracts and round only at defined output boundaries.

Do not guess these semantics in frontend components.

## 12. Smallest implementation sequence

1. Commit and approve this scope decision and the shared-contract foundation.
2. Define owner identity, property, income-item, expense-item, and analytics contracts.
3. Define the versioned Supabase migration and simple ownership RLS policies.
4. Verify migration and RLS behaviour against the approved development or test environment.
5. Add backend authentication and owner-scoped property APIs.
6. Implement the frontend authentication, profile, Terms acceptance, bottom navigation, and property-list shell.
7. Complete the add/view/edit property vertical slice.
8. Add income and expense line-item slices.
9. Add deterministic analytics calculations and the analytics page.
10. Add export, the manual deletion-request instructions, and the verified deletion runbook before declaring the MVP complete.

## 13. MVP completion gate

The owner-only portfolio MVP is not complete until:

- another authenticated account cannot access the owner's records;
- all financial values use explicit decimal and currency contracts;
- dynamic items are validated and owner scoped;
- analytics reconcile to stored inputs;
- missing inputs remain visible;
- sold, archived, and removed properties obey their documented lifecycle and analytics rules;
- the verified email deletion process removes all live owner data without an application recovery window;
- migrations are repeatable;
- secrets remain external to the repository;
- formatting, linting, typing, contract, API, RLS, and frontend tests pass;
- export and deletion cover all owner-derived data.
