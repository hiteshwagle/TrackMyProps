create table public.provider_addresses (
    address_id text primary key check (char_length(address_id) between 1 and 100),
    jurisdiction_id text,
    address_record_type text,
    alias_principal text,
    geo_feature text,
    cadastral_identifier text,
    formatted_address text not null check (char_length(formatted_address) <= 300),
    locality_name text not null check (char_length(locality_name) <= 100),
    state_territory text not null check (char_length(state_territory) <= 10),
    postcode text not null check (postcode ~ '^[0-9]{4}$'),
    street_name text not null check (char_length(street_name) <= 200),
    street_number_1 text not null check (char_length(street_number_1) <= 30),
    street_type text,
    street_type_description text,
    lot_identifier text,
    locality_neighbour text[] not null default '{}',
    locality_alias text[] not null default '{}',
    locality_id text,
    street_locality_id text,
    street_alias jsonb not null default '[]'::jsonb,
    dataset text,
    contributor_property_id text,
    longitude numeric(11, 8),
    latitude numeric(10, 8),
    messages jsonb not null default '[]'::jsonb,
    match_type text,
    match_quality text,
    match_score integer,
    match_code jsonb not null default '{}'::jsonb,
    retrieved_at timestamptz not null default now(),
    constraint provider_addresses_longitude_check check (
        longitude is null or longitude between -180 and 180
    ),
    constraint provider_addresses_latitude_check check (
        latitude is null or latitude between -90 and 90
    )
);

comment on table public.provider_addresses is
    'Server-only normalized PSMA/Geoscape address lookup records. Provider storage rights must be confirmed before production use.';

alter table public.provider_addresses enable row level security;

revoke all on table public.provider_addresses from public, anon, authenticated;
grant select, insert, update on table public.provider_addresses to service_role;

alter table public.properties
    add column address_id text references public.provider_addresses (address_id) on delete restrict;

create index properties_address_id_idx on public.properties (address_id)
where address_id is not null;
