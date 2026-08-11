create table public.property_cash_flow_items (
    id uuid primary key default gen_random_uuid(),
    property_id uuid not null references public.properties (id) on delete cascade,
    item_type text not null check (item_type in ('income', 'expense')),
    name text not null check (char_length(btrim(name)) between 1 and 100),
    amount numeric(16, 2) not null check (amount > 0),
    currency text not null default 'AUD' check (currency = 'AUD'),
    frequency text not null check (
        frequency in ('weekly', 'fortnightly', 'monthly', 'quarterly', 'annually', 'one_off')
    ),
    start_date date,
    end_date date,
    occurrence_date date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint property_cash_flow_items_dates_check check (
        (
            frequency = 'one_off'
            and occurrence_date is not null
            and start_date is null
            and end_date is null
        )
        or (
            frequency <> 'one_off'
            and occurrence_date is null
            and start_date is not null
            and (end_date is null or end_date >= start_date)
        )
    )
);

create index property_cash_flow_items_property_type_created_idx
    on public.property_cash_flow_items (property_id, item_type, created_at desc);

alter table public.property_cash_flow_items enable row level security;

revoke all on table public.property_cash_flow_items from anon;
revoke all on table public.property_cash_flow_items from authenticated;
grant select, insert, delete on table public.property_cash_flow_items to authenticated;

create policy "Owners can view their property cash flow items"
on public.property_cash_flow_items
for select
to authenticated
using (
    exists (
        select 1
        from public.properties
        where properties.id = property_cash_flow_items.property_id
          and properties.owner_user_id = (select auth.uid())
          and properties.deleted_at is null
    )
);

create policy "Owners can create their property cash flow items"
on public.property_cash_flow_items
for insert
to authenticated
with check (
    exists (
        select 1
        from public.properties
        where properties.id = property_cash_flow_items.property_id
          and properties.owner_user_id = (select auth.uid())
          and properties.deleted_at is null
    )
);

create policy "Owners can delete their property cash flow items"
on public.property_cash_flow_items
for delete
to authenticated
using (
    exists (
        select 1
        from public.properties
        where properties.id = property_cash_flow_items.property_id
          and properties.owner_user_id = (select auth.uid())
          and properties.deleted_at is null
    )
);
