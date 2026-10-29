import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cents,
  decimal,
  monthly,
  propertySchema,
  itemSchema,
  summarise,
  type Property,
  type CashFlowItem,
} from '../lib/domain.ts';
const p: Property = {
  id: 'd0a67433-6702-437a-b1d1-b7606a04cf21',
  status: 'active',
  display_name: 'Synthetic test property',
  address_line_1: '1 Test Street',
  address_line_2: '',
  suburb: 'Test',
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
  created_at: '',
  updated_at: '',
};
const item: CashFlowItem = {
  id: 'test-entry',
  property_id: p.id,
  type: 'income',
  name: 'Rent',
  amount: '600.00',
  frequency: 'weekly',
  start_date: '2026-01-01',
  end_date: null,
  occurrence_date: null,
};
test('money preserves cents beyond binary precision', () => {
  assert.equal(decimal(cents('9999999999999.99') + cents('0.01')), '10000000000000.00');
  assert.equal(decimal(-1n), '-0.01');
});
test('monthly half-up rounding handles positive and negative values', () => {
  assert.equal(monthly(6n), 1n);
  assert.equal(monthly(-6n), -1n);
  assert.equal(monthly(5n), 0n);
});
test('known no-loan property has full equity', () => {
  const s = summarise([p], [], 2026);
  assert.equal(s.equity, '1000000.00');
  assert.equal(s.debt, '0.00');
  assert.equal(s.missing_loans, 0);
});
test('missing values remain missing and totals show incomplete coverage', () => {
  const q = { ...p, id: 'other', current_value: null, has_loan: null };
  const s = summarise([q, p], [], 2026);
  assert.equal(s.assets, '1000000.00');
  assert.equal(s.missing_values, 1);
  assert.equal(s.missing_equity, 1);
  assert.equal(summarise([q], [], 2026).assets, null);
});
test('weekly income annualises to 52 periods and expense subtracts', () => {
  const s = summarise(
    [p],
    [item, { ...item, id: 'expense', type: 'expense', amount: '100.00', frequency: 'monthly' }],
    2026,
  );
  assert.equal(s.income, '31200.00');
  assert.equal(s.expenses, '1200.00');
  assert.equal(s.net, '30000.00');
  assert.equal(s.monthly_net, '2500.00');
});
test('one-off entries obey year, future and expired recurring items excluded', () => {
  const entries: CashFlowItem[] = [
    { ...item, frequency: 'one_off', start_date: null, occurrence_date: '2025-12-31' },
    { ...item, start_date: '2027-01-01' },
    { ...item, start_date: '2024-01-01', end_date: '2025-12-31' },
  ];
  assert.equal(summarise([p], entries, 2026).income, '0.00');
});
test('partial year recurring entry is explicitly annualised, not prorated', () => {
  const s = summarise([p], [{ ...item, start_date: '2026-12-01' }], 2026);
  assert.equal(s.income, '31200.00');
  assert.ok(s.assumptions.some((a) => a.includes('not prorated')));
});
test('archived and unrelated property items do not affect totals', () => {
  assert.equal(summarise([{ ...p, status: 'archived' }], [item], 2026).property_count, 0);
  assert.equal(summarise([p], [{ ...item, property_id: 'not-owned' }], 2026).income, '0.00');
});
test('reject invalid calendar dates, injected owner IDs and invalid loan data', () => {
  const { id, status, created_at, updated_at, ...input } = p;
  assert.ok(propertySchema.safeParse(input).success);
  assert.equal(propertySchema.safeParse({ ...input, purchase_date: '2026-02-30' }).success, false);
  assert.equal(propertySchema.safeParse({ ...input, owner_id: 'someone-else' }).success, false);
  assert.equal(propertySchema.safeParse({ ...input, has_loan: true }).success, false);
  assert.equal(propertySchema.safeParse({ ...input, current_value_as_of: null }).success, false);
});
test('reject malformed line item dates, zero amounts and missing dates', () => {
  const { id, ...input } = item;
  assert.ok(itemSchema.safeParse(input).success);
  assert.equal(itemSchema.safeParse({ ...input, amount: '0.00' }).success, false);
  assert.equal(itemSchema.safeParse({ ...input, start_date: null }).success, false);
  assert.equal(itemSchema.safeParse({ ...input, end_date: '2025-01-01' }).success, false);
});
