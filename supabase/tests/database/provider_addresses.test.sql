begin;

select plan(7);

select has_table('public', 'provider_addresses', 'provider address table exists');
select col_is_pk(
    'public',
    'provider_addresses',
    'address_id',
    'provider address ID is the primary key'
);
select col_is_fk(
    'public',
    'properties',
    'address_id',
    'properties link to a provider address'
);
select ok(
    (select relrowsecurity from pg_class where oid = 'public.provider_addresses'::regclass),
    'provider addresses have RLS enabled'
);
select ok(
    not has_table_privilege('anon', 'public.provider_addresses', 'select'),
    'anonymous clients cannot read provider addresses'
);
select ok(
    not has_table_privilege('authenticated', 'public.provider_addresses', 'select'),
    'authenticated clients cannot read provider addresses directly'
);
select ok(
    has_table_privilege('service_role', 'public.provider_addresses', 'insert'),
    'the Edge Function service role can store provider addresses'
);

select * from finish();

rollback;
