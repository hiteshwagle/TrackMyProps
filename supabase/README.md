# Supabase

This directory is the migration boundary for the TrackMyProps Supabase PostgreSQL schema.

Active development uses the local Supabase API at `http://127.0.0.1:54321`. The frontend uses Supabase Auth directly; the backend verifies user bearer tokens through Supabase Auth. The property migration is the first product schema and RLS policy. The repository contains no Storage configuration, Realtime configuration, Edge Function, project link, or credential.

The local runtime is for development only. Its publishable key belongs in ignored frontend and backend `.env` files. Do not put the secret or service-role key in the frontend or commit it anywhere.

When a schema change is separately approved:

1. confirm current Supabase CLI behaviour with `supabase --help`;
2. create migration files with `supabase migration new <name>` rather than inventing filenames;
3. include RLS and denial tests with every household-scoped table;
4. review grants, views, functions, and Storage policies for privilege bypass;
5. never commit `.temp`, local secrets, or project credentials.
