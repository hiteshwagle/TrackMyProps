# TrackMyProps Frontend

Expo React Native TypeScript application targeting web first while retaining iOS and Android compatibility.

The current slice contains:

- Supabase email/password signup, sign-in, sign-out, and password reset;
- required name and optional phone signup fields;
- a required linked Terms and Conditions checkbox;
- protected Expo Router navigation;
- bottom tabs for Dashboard, Properties, Analytics, and Settings;
- empty portfolio and analytics states;
- an authenticated current-user request to the local backend;
- a manual account-deletion email action;
- placeholder-only public configuration.

It does not contain property persistence, financial calculations, property API calls, commercial integrations, or production credentials. The disabled property action is intentional until the property contracts, migration/RLS, and backend endpoint exist.

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

Each environment command validates its selected file first. Production build and preview commands fail until all production placeholders have been replaced with approved non-loopback HTTPS configuration and a production publishable key.

## Configuration

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

The current-user client validates the response described by `../contracts/openapi/backend-v1.yaml` and `../contracts/json-schema/identity/current-user.schema.json`. Property contracts remain deferred.
