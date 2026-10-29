import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAlerts, sydneyToday, addDays, reminderSchema } from '../lib/reminders-domain.ts';
import type { Property } from '../lib/domain.ts';
import type { Tenant } from '../lib/resources-domain.ts';
const p = { id: 'p', status: 'active', display_name: 'Home' } as Property;
const t = {
  id: 't',
  property_id: 'p',
  status: 'active',
  full_name: 'Tenant',
  lease_end: '2026-12-28',
} as Tenant;
test('lease alerts enter notice period at 60 days and become overdue after expiry', () => {
  assert.equal(buildAlerts([p], [t], [], '2026-10-28')[0].state, 'later');
  assert.equal(buildAlerts([p], [t], [], '2026-10-29')[0].state, 'upcoming');
  assert.equal(buildAlerts([p], [t], [], '2026-12-28')[0].state, 'today');
  assert.equal(buildAlerts([p], [t], [], '2026-12-29')[0].days, -1);
  assert.equal(buildAlerts([p], [t], [], '2026-12-29')[0].state, 'overdue');
});
test('ended tenancies, missing dates and archived properties have no automatic alerts', () => {
  assert.equal(buildAlerts([{ ...p, status: 'archived' }], [t], [], '2026-10-29').length, 0);
  assert.equal(buildAlerts([p], [{ ...t, status: 'ended' }], [], '2026-10-29').length, 0);
  assert.equal(buildAlerts([p], [{ ...t, lease_end: null }], [], '2026-10-29').length, 0);
});
test('snoozed alerts return on their exact date and completion is tied to lease date', () => {
  const a = buildAlerts([p], [t], [], '2026-10-29')[0];
  const saved = { ...a, snoozed_until: '2026-11-05' };
  assert.equal(buildAlerts([p], [t], [saved], '2026-11-04')[0].state, 'snoozed');
  assert.equal(buildAlerts([p], [t], [saved], '2026-11-05')[0].state, 'upcoming');
  assert.equal(
    buildAlerts([p], [t], [{ ...a, completed: true }], '2026-10-29')[0].state,
    'completed',
  );
  assert.equal(
    buildAlerts(
      [p],
      [{ ...t, lease_end: '2027-01-01' }],
      [{ ...a, completed: true }],
      '2026-10-29',
    )[0].completed,
    false,
  );
});
test('calendar-day arithmetic and Sydney dates handle month/year and timezone boundaries', () => {
  assert.equal(addDays('2026-12-28', 7), '2027-01-04');
  assert.equal(addDays('2028-02-27', 7), '2028-03-05');
  assert.equal(sydneyToday(new Date('2026-10-28T14:00:00Z')), '2026-10-29');
});
test('reminder inputs reject invalid dates, extra ownership and unsupported notice periods', () => {
  const r = {
    property_id: '332711c4-166d-429c-afd1-dcf33549a776',
    kind: 'inspection',
    title: 'Inspect',
    due_date: '2026-12-01',
    notice_days: 30,
  };
  assert.equal(reminderSchema.safeParse(r).success, true);
  for (const patch of [
    { due_date: '2026-02-30' },
    { title: '' },
    { owner_id: 'x' },
    { notice_days: 5 },
  ])
    assert.equal(reminderSchema.safeParse({ ...r, ...patch }).success, false);
});
