begin;

select plan(7);

insert into auth.users (id, email)
values
    ('11111111-1111-4111-8111-111111111111', 'owner-a@test.invalid'),
    ('22222222-2222-4222-8222-222222222222', 'owner-b@test.invalid');

insert into public.properties (
    id,
    owner_user_id,
    display_name,
    address_line_1,
    suburb,
    state,
    postcode,
    property_type,
    bedrooms,
    bathrooms,
    car_spaces,
    land_area_sqm,
    building_area_sqm,
    purchase_date,
    purchase_price
)
values
    (
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        '11111111-1111-4111-8111-111111111111',
        'Owner A property',
        '1 Example Street',
        'Sydney',
        'NSW',
        '2000',
        'house',
        3,
        2,
        1,
        300,
        150,
        '2024-01-01',
        700000
    ),
    (
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        '22222222-2222-4222-8222-222222222222',
        'Owner B property',
        '2 Example Street',
        'Melbourne',
        'VIC',
        '3000',
        'apartment_unit',
        2,
        1,
        1,
        100,
        80,
        '2024-02-01',
        600000
    );

set local role authenticated;
select set_config(
    'request.jwt.claims',
    '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
    true
);

select is(
    (select count(*)::integer from public.properties),
    1,
    'an authenticated owner reads only their property'
);

update public.properties
set display_name = 'Owner A updated property'
where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

select is(
    (
        select display_name
        from public.properties
        where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    ),
    'Owner A updated property',
    'an authenticated owner can edit their property'
);

update public.properties
set display_name = 'Forbidden update'
where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

reset role;

select is(
    (
        select display_name
        from public.properties
        where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
    ),
    'Owner B property',
    'an owner cannot edit another account property'
);

set local role authenticated;
select set_config(
    'request.jwt.claims',
    '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
    true
);

update public.properties
set status = 'archived'
where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

select is(
    (
        select status
        from public.properties
        where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    ),
    'archived',
    'an owner can archive their property'
);

update public.properties
set status = 'active'
where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

select is(
    (
        select status
        from public.properties
        where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    ),
    'active',
    'an owner can restore their archived property'
);

select throws_ok(
    $$
        update public.properties
        set owner_user_id = '22222222-2222-4222-8222-222222222222'
        where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    $$,
    '42501',
    'new row violates row-level security policy for table "properties"',
    'an owner cannot transfer a property by changing its owner ID'
);

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select throws_ok(
    'select * from public.properties',
    '42501',
    'permission denied for table properties',
    'an unauthenticated request cannot read properties'
);

select * from finish();

rollback;
