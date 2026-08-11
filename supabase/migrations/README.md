# Migrations

Migration files are generated with `supabase migration new <name>` and applied in timestamp order.

The first product migration creates the owner-scoped property record for the accepted MVP. It enables RLS and permits authenticated owners to select, insert, and update only their own non-deleted rows. Physical property deletion is intentionally not granted; the approved lifecycle uses a later backend-owned soft-delete operation.

The address-provider migration adds a server-only normalized address table keyed by the provider `addressId`, plus an optional foreign key from a property to its selected lookup address. The table has RLS enabled, no client policy, and no grants for anonymous or authenticated clients. Only the Edge Function's service role may persist validated provider responses. This does not establish provider storage, caching, display, or redistribution rights; those rights must be verified before production use.
