create table public.properties (
    id uuid primary key default gen_random_uuid(),
    owner_user_id uuid not null references auth.users (id) on delete cascade,
    display_name text not null check (char_length(display_name) between 1 and 120),
    address_line_1 text not null check (char_length(address_line_1) between 1 and 200),
    address_line_2 text check (address_line_2 is null or char_length(address_line_2) <= 200),
    suburb text not null check (char_length(suburb) between 1 and 100),
    state text not null check (char_length(state) between 1 and 50),
    postcode text not null check (postcode ~ '^[0-9]{4}$'),
    country text not null default 'Australia' check (country = 'Australia'),
    property_type text not null check (
        property_type in ('house', 'apartment_unit', 'townhouse', 'villa', 'land', 'commercial', 'other')
    ),
    bedrooms numeric(4, 1) not null check (bedrooms >= 0 and mod(bedrooms * 2, 1) = 0),
    bathrooms numeric(4, 1) not null check (bathrooms >= 0 and mod(bathrooms * 2, 1) = 0),
    car_spaces integer not null check (car_spaces >= 0),
    land_area_sqm numeric(14, 2) not null check (land_area_sqm > 0),
    building_area_sqm numeric(14, 2) not null check (building_area_sqm > 0),
    purchase_date date not null,
    purchase_price numeric(16, 2) not null check (purchase_price > 0),
    currency text not null default 'AUD' check (currency = 'AUD'),
    current_value numeric(16, 2) check (current_value is null or current_value > 0),
    current_value_as_of date,
    has_loan boolean,
    original_loan_amount numeric(16, 2) check (
        original_loan_amount is null or original_loan_amount > 0
    ),
    remaining_loan_balance numeric(16, 2) check (
        remaining_loan_balance is null or remaining_loan_balance >= 0
    ),
    loan_balance_as_of date,
    annual_interest_rate numeric(12, 8) check (
        annual_interest_rate is null or annual_interest_rate between 0 and 1
    ),
    repayment_amount numeric(16, 2) check (repayment_amount is null or repayment_amount > 0),
    repayment_frequency text check (
        repayment_frequency is null
        or repayment_frequency in ('weekly', 'fortnightly', 'monthly', 'quarterly', 'annually')
    ),
    next_repayment_date date,
    notes text check (notes is null or char_length(notes) <= 2000),
    status text not null default 'active' check (status in ('active', 'sold', 'archived')),
    sold_date date,
    sale_price numeric(16, 2) check (sale_price is null or sale_price > 0),
    deleted_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint properties_current_value_date_check check (
        (current_value is null and current_value_as_of is null)
        or (current_value is not null and current_value_as_of is not null)
    ),
    constraint properties_loan_details_check check (
        (
            has_loan is null
            and original_loan_amount is null
            and remaining_loan_balance is null
            and loan_balance_as_of is null
            and annual_interest_rate is null
            and repayment_amount is null
            and repayment_frequency is null
            and next_repayment_date is null
        )
        or (
            has_loan is false
            and original_loan_amount is null
            and remaining_loan_balance = 0
            and loan_balance_as_of is null
            and annual_interest_rate is null
            and repayment_amount is null
            and repayment_frequency is null
            and next_repayment_date is null
        )
        or (
            has_loan is true
            and original_loan_amount is not null
            and remaining_loan_balance is not null
            and remaining_loan_balance <= original_loan_amount
            and loan_balance_as_of is not null
            and annual_interest_rate is not null
            and repayment_amount is not null
            and repayment_frequency is not null
            and next_repayment_date is not null
        )
    ),
    constraint properties_sale_details_check check (
        (status = 'sold' and sold_date is not null and sale_price is not null)
        or (status <> 'sold' and sold_date is null and sale_price is null)
    )
);

create index properties_owner_status_created_idx
    on public.properties (owner_user_id, status, created_at desc)
    where deleted_at is null;

alter table public.properties enable row level security;

revoke all on table public.properties from anon;
revoke all on table public.properties from authenticated;
grant select, insert, update on table public.properties to authenticated;

create policy "Owners can view their properties"
on public.properties
for select
to authenticated
using ((select auth.uid()) = owner_user_id and deleted_at is null);

create policy "Owners can create their properties"
on public.properties
for insert
to authenticated
with check ((select auth.uid()) = owner_user_id and deleted_at is null);

create policy "Owners can update their properties"
on public.properties
for update
to authenticated
using ((select auth.uid()) = owner_user_id and deleted_at is null)
with check ((select auth.uid()) = owner_user_id and deleted_at is null);
