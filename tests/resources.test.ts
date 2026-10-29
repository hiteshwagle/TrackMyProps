import test from 'node:test';
import assert from 'node:assert/strict';
import { tenantSchema, detectFileType, safeFileName } from '../lib/resources-domain.ts';
const tenant = {
  full_name: 'Test Tenant',
  email: 'test@example.invalid',
  phone: '',
  status: 'active',
  lease_start: '2026-01-01',
  lease_end: '2026-12-31',
  rent_amount: '650.00',
  rent_frequency: 'weekly',
  bond_amount: '2600.00',
  notes: '',
};
test('valid tenant details and an optional-details-free record are accepted', () => {
  assert.ok(tenantSchema.safeParse(tenant).success);
  assert.ok(
    tenantSchema.safeParse({
      ...tenant,
      email: '',
      lease_start: null,
      lease_end: null,
      rent_amount: null,
      rent_frequency: null,
      bond_amount: null,
    }).success,
  );
});
test('tenant dates and money remain validated', () => {
  for (const patch of [
    { lease_end: '2025-12-31' },
    { lease_start: '2026-02-30' },
    { rent_amount: '-10.00' },
    { bond_amount: '1.234' },
    { rent_frequency: null },
    { full_name: '' },
    { email: 'not-email' },
  ])
    assert.equal(tenantSchema.safeParse({ ...tenant, ...patch }).success, false);
});
test('tenant owner and property identifiers cannot be injected', () => {
  assert.equal(tenantSchema.safeParse({ ...tenant, owner_id: 'someone-else' }).success, false);
  assert.equal(tenantSchema.safeParse({ ...tenant, property_id: 'someone-else' }).success, false);
});
test('file names are bounded and cannot retain path traversal or header injection', () => {
  assert.equal(safeFileName('../../lease.pdf'), 'lease.pdf');
  assert.equal(safeFileName('lease\r\n.pdf'), 'lease.pdf');
  assert.throws(() => safeFileName('x'.repeat(181)));
});
test('photo names and signatures must agree; SVG and HTML are rejected', () => {
  assert.equal(
    detectFileType('photo.PNG', Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]), 'photo'),
    'image/png',
  );
  assert.equal(
    detectFileType('photo.jpeg', Uint8Array.from([255, 216, 255]), 'photo'),
    'image/jpeg',
  );
  assert.throws(() => detectFileType('photo.png', new TextEncoder().encode('<svg/>'), 'photo'));
  assert.throws(() => detectFileType('photo.svg', new TextEncoder().encode('<svg/>'), 'photo'));
});
test('documents require an allowed type and basic signature', () => {
  assert.equal(
    detectFileType('lease.pdf', new TextEncoder().encode('%PDF-1.7'), 'document'),
    'application/pdf',
  );
  assert.equal(
    detectFileType('notes.txt', new TextEncoder().encode('Inspection notes'), 'document'),
    'text/plain',
  );
  assert.throws(() =>
    detectFileType('lease.pdf', new TextEncoder().encode('<html>wrong type</html>'), 'document'),
  );
  assert.throws(() => detectFileType('file.exe', new Uint8Array([80, 75, 3, 4]), 'document'));
  assert.throws(() => detectFileType('notes.txt', new Uint8Array([0, 1, 2]), 'document'));
});
