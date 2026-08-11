# Migrations

Migration files are generated with `supabase migration new <name>` and applied in timestamp order.

The first product migration creates the owner-scoped property record for the accepted MVP. It enables RLS and permits authenticated owners to select, insert, and update only their own non-deleted rows. Physical property deletion is intentionally not granted; the approved lifecycle uses a later backend-owned soft-delete operation.
