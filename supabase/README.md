# Supabase

This directory reserves the migration boundary for the future TrackMyProps Supabase PostgreSQL schema.

Phase 0 does not contain a database migration, RLS policy, Auth configuration, Storage configuration, Realtime configuration, Edge Function, project link, or credential.

When a schema change is separately approved:

1. confirm current Supabase CLI behaviour with `supabase --help`;
2. create migration files with `supabase migration new <name>` rather than inventing filenames;
3. include RLS and denial tests with every household-scoped table;
4. review grants, views, functions, and Storage policies for privilege bypass;
5. never commit `.temp`, local secrets, or project credentials.

