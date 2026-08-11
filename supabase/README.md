# Supabase

This directory is the migration boundary for the TrackMyProps Supabase PostgreSQL schema.

Active development uses the local Supabase API at `http://127.0.0.1:54321`. The frontend uses Supabase Auth directly; the backend verifies user bearer tokens through Supabase Auth. The property migration is the first product schema and RLS policy. The authenticated `address-lookup` Edge Function is a narrow PSMA/Geoscape address adapter; it stores validated normalized results in a server-only RLS table and returns a minimized suggestion contract. The repository contains no Storage configuration, Realtime configuration, project link, or credential.

The local runtime is for development only. Its publishable key belongs in ignored frontend and backend `.env` files. Do not put the secret or service-role key in the frontend or commit it anywhere.

The address function's non-secret URL, timeout, query, result, and response-size settings are centralized in `functions/address-lookup/app-settings.ts`. Its provider credential is read from the server-only environment by that settings module.

For local address lookup, copy `functions/.env.example` to the ignored `functions/.env.development`, add a rotated development provider credential, and run:

```bash
make dev-address-function
make test-database
```

The credential previously shared in plaintext must not be reused. Do not prefix it with `EXPO_PUBLIC_`; `PSMA_API_KEY` is server-only.

Provider licensing, permanent-storage, caching, display, attribution, rate-limit, and production-use rights remain unverified. Do not deploy or enable this integration for production until current contractual evidence is recorded. See `functions/address-lookup/README.md`.

When a schema change is separately approved:

1. confirm current Supabase CLI behaviour with `supabase --help`;
2. create migration files with `supabase migration new <name>` rather than inventing filenames;
3. include RLS and denial tests with every owner-scoped table;
4. review grants, views, functions, and Storage policies for privilege bypass;
5. never commit `.temp`, local secrets, or project credentials.
