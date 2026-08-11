begin;

select plan(9);

insert into auth.users (id, email)
values
    ('33333333-3333-4333-8333-333333333333', 'cash-flow-owner-a@test.invalid'),
    ('44444444-4444-4444-8444-444444444444', 'cash-flow-owner-b@test.invalid');

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
        'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        '33333333-3333-4333-8333-333333333333',
        'Cash flow owner A property',
        '3 Example Street',
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
        'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        '44444444-4444-4444-8444-444444444444',
        'Cash flow owner B property',
        '4 Example Street',
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

insert into public.property_cash_flow_items (
    id,
    property_id,
    item_type,
    name,
    amount,
    frequency,
    start_date
)
values (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    'income',
    'Rent',
    500,
    'weekly',
    '2026-01-01'
);

set local role authenticated;
select set_config(
    'request.jwt.claims',
    '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}',
    true
);

select lives_ok(
    $$
        insert into public.property_cash_flow_items (
            id,
            property_id,
            item_type,
            name,
            amount,
            frequency,
            start_date
        )
        values (
            'ffffffff-ffff-4fff-8fff-ffffffffffff',
            'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
            'income',
            'Rent',
            650,
            'weekly',
            '2026-01-01'
        )
    $$,
    'an owner can add recurring income to their property'
);

select lives_ok(
    $$
        insert into public.property_cash_flow_items (
            id,
            property_id,
            item_type,
            name,
            amount,
            frequency,
            occurrence_date
        )
        values (
            'abababab-abab-4bab-8bab-abababababab',
            'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
            'expense',
            'Maintenance',
            250,
            'one_off',
            '2026-08-11'
        )
    $$,
    'an owner can add a one-off expense to their property'
);

select is(
    (select count(*)::integer from public.property_cash_flow_items),
    2,
    'an owner reads only items attached to their property'
);

select throws_ok(
    $$
        insert into public.property_cash_flow_items (
            property_id,
            item_type,
            name,
            amount,
            frequency,
            start_date
        )
        values (
            'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
            'expense',
            'Insurance',
            120,
            'monthly',
            '2026-01-01'
        )
    $$,
    '42501',
    'new row violates row-level security policy for table "property_cash_flow_items"',
    'an owner cannot attach an item to another account property'
);

delete from public.property_cash_flow_items
where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';

reset role;

select is(
    (
        select count(*)::integer
        from public.property_cash_flow_items
        where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
    ),
    1,
    'an owner cannot delete another account item'
);

set local role authenticated;
select set_config(
    'request.jwt.claims',
    '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}',
    true
);

delete from public.property_cash_flow_items
where id = 'abababab-abab-4bab-8bab-abababababab';

select is(
    (
        select count(*)::integer
        from public.property_cash_flow_items
        where id = 'abababab-abab-4bab-8bab-abababababab'
    ),
    0,
    'an owner can delete their property expense'
);

reset role;

select throws_ok(
    $$
        insert into public.property_cash_flow_items (
            property_id,
            item_type,
            name,
            amount,
            frequency,
            occurrence_date
        )
        values (
            'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
            'expense',
            'Invalid recurring dates',
            100,
            'monthly',
            '2026-01-01'
        )
    $$,
    '23514',
    null,
    'database constraints reject recurring items with a one-off date'
);

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select throws_ok(
    'select * from public.property_cash_flow_items',
    '42501',
    'permission denied for table property_cash_flow_items',
    'an unauthenticated request cannot read cash flow items'
);

select throws_ok(
    $$
        insert into public.property_cash_flow_items (
            property_id,
            item_type,
            name,
            amount,
            frequency,
            start_date
        )
        values (
            'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
            'income',
            'Rent',
            500,
            'weekly',
            '2026-01-01'
        )
    $$,
    '42501',
    'permission denied for table property_cash_flow_items',
    'an unauthenticated request cannot create cash flow items'
);

select * from finish();

rollback;
