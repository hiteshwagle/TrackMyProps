# TrackMyProps Frontend

Expo React Native TypeScript application targeting web first while retaining iOS and Android compatibility.

The current slice contains:

- Supabase email/password signup, sign-in, sign-out, and password reset;
- required name and optional phone signup fields;
- a required linked Terms and Conditions checkbox;
- protected Expo Router navigation;
- bottom tabs for Dashboard, Properties, Analytics, and Settings;
- a two-step add/edit property form with Active and Archived property lists;
- archive and restore actions that refresh property lists, Dashboard, and Analytics;
- a protected property-details page for editing and managing income and expenses;
- compact property cards with backend-calculated annual income and expense totals;
- recurring and one-off date fields plus confirmed item removal;
- active-portfolio property, asset, loan, and equity totals from the backend;
- authenticated, debounced address suggestions through the Supabase Edge Function;
- an authenticated current-user request to the local backend;
- a manual account-deletion email action;
- placeholder-only public configuration.

Property and cash-flow writes call the authenticated backend; the frontend never writes those tables directly or calculates authoritative totals. Monthly cash-flow views, sold/remove workflows, archived-analytics preferences, commercial integrations, and production credentials remain deferred.

## Requirements

- Node.js 22.13 or later in the Node.js 22 release line
- npm 11

## Commands

```bash
npm ci
npm run dev
npm run prod
npm run build:dev
npm run build:prod
npm run format:check
npm run lint
npm run typecheck
npm run test:ci
npm run build
```

`npm run dev` starts the web application with `.env.development`. `npm run prod` builds with `.env.production` and serves the result on port `4173`. The explicit build commands export development output to `dist-development/` and production output to `dist/`.

Address lookup requires the generic local Edge Functions runtime in a separate root terminal:

```bash
make dev-functions
```

The runtime serves every folder under `supabase/functions/`. Frontend function names are centralized in `src/config/app-settings.ts`; the address client invokes the configured `address-lookup` function.

Each environment command validates its selected file first. Production build and preview commands fail until all production placeholders have been replaced with approved non-loopback HTTPS configuration and a production publishable key.

## Configuration

Non-secret behavioural settings shared by frontend features are defined in `src/config/app-settings.ts`. Environment-specific public values are read and validated by `src/config/public-config.ts` from the selected environment file.

The ignored runtime files are:

```text
.env.development
.env.production
```

Their committed templates are `.env.development.example` and `.env.production.example`. Each contains:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
EXPO_PUBLIC_BACKEND_URL
EXPO_PUBLIC_APP_ENV
EXPO_PUBLIC_TERMS_URL
EXPO_PUBLIC_ACCOUNT_DELETION_EMAIL
```

Never place a Supabase secret or service-role key in an `EXPO_PUBLIC_*` variable. The committed Terms URL and deletion email use the reserved `.invalid` domain and must be replaced before live use.

The development file points to the local Supabase API at `http://127.0.0.1:54321` and local backend at `http://127.0.0.1:8000`. The production file intentionally contains placeholders. Plain HTTP is accepted only for loopback development URLs; production and other non-local service URLs must use HTTPS.

Name, optional phone, Terms URL, and acceptance time are currently passed as non-authoritative Supabase user metadata during signup. They are never used for authorisation. Before production, versioned legal acceptance and profile data require the approved database/backend contract and auditable storage.

The current-user and property clients validate responses described by `../contracts/openapi/backend-v1.yaml`. Money and rates remain decimal strings at the API boundary.
