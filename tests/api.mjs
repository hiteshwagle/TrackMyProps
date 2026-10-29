// Runs the production Worker in an isolated, disposable Miniflare instance.
// Identity headers simulate the trusted Sites dispatch boundary ONLY in this test.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('../', import.meta.url)).replace(/\/$/, '');
const require = createRequire(root + '/package.json');
const wranglerRequire = createRequire(require.resolve('wrangler'));
const { Miniflare } = wranglerRequire('miniflare');
const modules = [
  { type: 'ESModule', path: root + '/dist/server/index.js' },
  ...fs
    .readdirSync(root + '/dist/server', { recursive: true })
    .filter((p) => (p.endsWith('.js') || p.endsWith('.mjs')) && p !== 'index.js')
    .map((p) => ({ type: 'ESModule', path: root + '/dist/server/' + p })),
];
const mf = new Miniflare({
  modules,
  modulesRoot: root + '/dist/server',
  compatibilityDate: '2026-05-15',
  compatibilityFlags: ['nodejs_compat'],
  d1Databases: { DB: 'disposable-test-db' },
  cf: false,
});
let count = 0;
async function call(
  path,
  { owner = 'owner-a', method = 'GET', data, origin = 'http://site.test' } = {},
) {
  const headers = { 'Content-Type': 'application/json', Origin: origin };
  if (owner) {
    headers['oai-authenticated-user-id'] = owner;
    headers['oai-authenticated-user-email'] = owner + '@example.invalid';
  }
  return mf.dispatchFetch('http://site.test' + path, {
    method,
    headers,
    body: data === undefined ? undefined : JSON.stringify(data),
    redirect: 'manual',
  });
}
function check(value, expected, label) {
  assert.deepEqual(value, expected, label);
  count++;
  console.log('PASS', label);
}
try {
  const db = await mf.getD1Database('DB');
  for (const file of fs
    .readdirSync(root + '/drizzle')
    .filter((f) => f.endsWith('.sql'))
    .sort()) {
    const statements = fs
      .readFileSync(root + '/drizzle/' + file, 'utf8')
      .replaceAll('--> statement-breakpoint', '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
    await db.batch(statements.map((s) => db.prepare(s)));
  }
  check(
    (await call('/api/v1/portfolio', { owner: null })).status,
    401,
    'anonymous portfolio denied',
  );
  check((await call('/api/v1/export', { owner: null })).status, 401, 'anonymous export denied');
  check(
    (await call('/dashboard', { owner: null })).status,
    307,
    'anonymous dashboard redirects to sign-in',
  );
  const home = await call('/', { owner: null });
  check(home.status, 200, 'anonymous homepage available');
  check(
    (await home.text()).includes('In perspective.'),
    true,
    'homepage renders feature narrative',
  );
  const signedHome = await call('/');
  check(signedHome.status, 307, 'signed-in home redirects');
  check(signedHome.headers.get('location'), '/dashboard', 'signed-in landing is dashboard');
  const p = {
    display_name: 'Synthetic Test Home',
    address_line_1: '1 Test Street',
    address_line_2: '',
    suburb: 'Synthetic',
    state: 'NSW',
    postcode: '2000',
    property_type: 'house',
    bedrooms: 3,
    bathrooms: 2,
    car_spaces: 1,
    land_area_sqm: 500,
    building_area_sqm: 150,
    purchase_date: '2020-01-01',
    purchase_price: '800000.00',
    current_value: '1000000.00',
    current_value_as_of: '2026-01-01',
    has_loan: false,
    original_loan_amount: null,
    remaining_loan_balance: null,
    loan_balance_as_of: null,
    annual_interest_rate: null,
    repayment_amount: null,
    repayment_frequency: null,
    next_repayment_date: null,
    notes: '',
  };
  check(
    (await call('/api/v1/properties', { method: 'POST', data: p, owner: null })).status,
    401,
    'anonymous write denied',
  );
  check(
    (await call('/api/v1/properties', { method: 'POST', data: p, origin: 'http://evil.invalid' }))
      .status,
    403,
    'cross-origin write denied',
  );
  check(
    (await call('/api/v1/properties', { method: 'POST', data: { ...p, owner_id: 'owner-b' } }))
      .status,
    400,
    'owner reassignment input rejected',
  );
  const created = await call('/api/v1/properties', { method: 'POST', data: p });
  check(created.status, 201, 'owner creates property');
  const id = (await created.json()).result[0].id;
  check(
    (await call('/api/v1/properties/' + id, { method: 'PUT', owner: 'owner-b', data: p })).status,
    404,
    'cross-owner update denied',
  );
  check(
    (
      await call('/api/v1/properties/' + id, {
        method: 'PATCH',
        owner: 'owner-b',
        data: { status: 'archived' },
      })
    ).status,
    404,
    'cross-owner archive denied',
  );
  check(
    (await (await call('/api/v1/portfolio', { owner: 'owner-b' })).json()).properties.length,
    0,
    'second owner sees no first-owner property',
  );
  const item = {
    property_id: id,
    type: 'income',
    name: 'Rent',
    amount: '600.00',
    frequency: 'weekly',
    start_date: '2026-01-01',
    end_date: null,
    occurrence_date: null,
  };
  check(
    (await call('/api/v1/cash-flow', { method: 'POST', owner: 'owner-b', data: item })).status,
    404,
    'cross-owner income attachment denied',
  );
  const income = await call('/api/v1/cash-flow', { method: 'POST', data: item });
  check(income.status, 201, 'owner creates income entry');
  const itemId = (await income.json()).result[0].id;
  check(
    (await call('/api/v1/cash-flow/' + itemId, { method: 'DELETE', owner: 'owner-b' })).status,
    404,
    'cross-owner income deletion denied',
  );
  const portfolio = await (await call('/api/v1/portfolio?year=2026')).json();
  check(portfolio.summary.income, '31200.00', 'annual income reconciles');
  check(portfolio.summary.equity, '1000000.00', 'known no-loan equity reconciles');
  check(
    (
      await call('/api/v1/properties/' + id, {
        method: 'PUT',
        data: { ...p, display_name: 'Updated Test Home' },
      })
    ).status,
    200,
    'owner edits property',
  );
  check(
    (await call('/api/v1/properties/' + id, { method: 'PATCH', data: { status: 'archived' } }))
      .status,
    200,
    'owner archives property',
  );
  check(
    (await (await call('/api/v1/portfolio')).json()).summary.property_count,
    0,
    'archived property excluded from active summary',
  );
  check(
    (await call('/api/v1/properties/' + id, { method: 'PATCH', data: { status: 'active' } }))
      .status,
    200,
    'owner restores property',
  );
  check(
    (await (await call('/api/v1/export', { owner: 'owner-b' })).json()).properties.length,
    0,
    'export is owner-scoped',
  );
  check(
    (await (await call('/api/v1/export')).json()).properties.length,
    1,
    'owner export contains saved property',
  );
  check(
    (await call('/api/v1/cash-flow/' + itemId, { method: 'DELETE' })).status,
    200,
    'owner deletes income entry',
  );
  check((await call('/dashboard')).status, 200, 'signed-in dashboard renders');
  console.log(`${count} integration checks passed. Disposable database is not persisted.`);
} finally {
  await mf.dispose();
}
