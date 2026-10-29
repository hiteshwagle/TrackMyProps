import { z } from 'zod';
import type { Property } from './domain.ts';
import type { Tenant } from './resources-domain.ts';
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const d = new Date(v + 'T00:00:00Z');
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }, 'Choose a valid date.');
export const reminderSchema = z
  .object({
    property_id: z.string().uuid(),
    kind: z.enum(['rent_review', 'inspection', 'insurance', 'other']),
    title: z.string().trim().min(1).max(150),
    due_date: date,
    notice_days: z.union([z.literal(7), z.literal(30), z.literal(60), z.literal(90)]),
  })
  .strict();
export const reminderAction = z.discriminatedUnion('action', [
  z.object({ action: z.literal('complete') }).strict(),
  z.object({ action: z.literal('reopen') }).strict(),
  z.object({ action: z.literal('snooze') }).strict(),
]);
export type ReminderInput = z.infer<typeof reminderSchema>;
export type ReminderRecord = ReminderInput & {
  id: string;
  completed: boolean;
  snoozed_until: string | null;
};
export type Alert = ReminderRecord & {
  automatic: boolean;
  property_name: string;
  days: number;
  state: 'overdue' | 'today' | 'upcoming' | 'later' | 'snoozed' | 'completed';
};
export function sydneyToday(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
export function addDays(day: string, days: number) {
  const d = new Date(day + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export function buildAlerts(
  properties: Property[],
  tenants: Tenant[],
  records: ReminderRecord[],
  today: string,
): Alert[] {
  const active = new Map(properties.filter((p) => p.status === 'active').map((p) => [p.id, p]));
  const states = new Map(records.map((r) => [r.id, r]));
  const manual = records
    .filter((r) => !r.id.startsWith('lease:'))
    .map((r) => ({ ...r, automatic: false }));
  const leases = tenants
    .filter((t) => t.status !== 'ended' && t.lease_end && active.has(t.property_id))
    .map((t) => {
      const id = `lease:${t.id}:${t.lease_end}`;
      const saved = states.get(id);
      return {
        id,
        property_id: t.property_id,
        kind: 'other' as const,
        title: `Lease expiry · ${t.full_name}`,
        due_date: t.lease_end!,
        notice_days: 60 as const,
        completed: saved?.completed ?? false,
        snoozed_until: saved?.snoozed_until ?? null,
        automatic: true,
      };
    });
  return [...manual, ...leases]
    .filter((r) => active.has(r.property_id))
    .map((r) => {
      const days = Math.round(
        (Date.parse(r.due_date + 'T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / 86400000,
      );
      const state: Alert['state'] = r.completed
        ? 'completed'
        : r.snoozed_until && r.snoozed_until > today
          ? 'snoozed'
          : days < 0
            ? 'overdue'
            : days === 0
              ? 'today'
              : days <= r.notice_days
                ? 'upcoming'
                : 'later';
      return { ...r, property_name: active.get(r.property_id)!.display_name, days, state };
    })
    .sort((a, b) => a.due_date.localeCompare(b.due_date) || a.id.localeCompare(b.id));
}
