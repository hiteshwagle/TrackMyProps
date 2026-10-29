import { z } from 'zod';
import type { Property } from './domain.ts';
import type { Tenant } from './resources-domain.ts';
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const d = new Date(v + 'T00:00:00Z');
    return (
      v >= '2000-01-01' &&
      v <= '9900-12-31' &&
      !Number.isNaN(d.getTime()) &&
      d.toISOString().slice(0, 10) === v
    );
  }, 'Choose a valid date.');
export const reminderSchema = z
  .object({
    property_id: z.string().uuid().nullable(),
    kind: z.enum(['bill', 'maintenance', 'rent_review', 'inspection', 'insurance', 'other']),
    title: z.string().trim().min(1).max(150),
    due_date: date,
    notice_days: z.number().int().min(0).max(365),
    repeat: z
      .enum(['once', 'weekly', 'fortnightly', 'monthly', 'quarterly', 'six_monthly', 'yearly'])
      .optional(),
    amount: z
      .string()
      .regex(/^\d{1,13}(\.\d{1,2})?$/)
      .nullable()
      .optional(),
    notes: z.string().trim().max(2000).optional(),
    document_id: z.string().uuid().nullable().optional(),
    end_date: date.nullable().optional(),
    repeat_count: z.number().int().min(1).max(1000).nullable().optional(),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.end_date && v.end_date < v.due_date)
      ctx.addIssue({ code: 'custom', message: 'End date must be on or after the due date.' });
  });
export const reminderAction = z.discriminatedUnion('action', [
  z.object({ action: z.literal('complete') }).strict(),
  z.object({ action: z.literal('reopen') }).strict(),
  z.object({ action: z.literal('snooze') }).strict(),
  z.object({ action: z.literal('pause') }).strict(),
  z.object({ action: z.literal('resume') }).strict(),
  z
    .object({ action: z.literal('edit'), scope: z.enum(['one', 'future']), data: reminderSchema })
    .strict(),
]);
export type ReminderInput = z.infer<typeof reminderSchema>;
export type ReminderRecord = ReminderInput & {
  id: string;
  series_id?: string;
  occurrence_date?: string;
  paused?: boolean;
  completed: boolean;
  snoozed_until: string | null;
};
export type Alert = ReminderRecord & {
  automatic: boolean;
  property_name: string;
  days: number;
  state: 'overdue' | 'today' | 'upcoming' | 'later' | 'snoozed' | 'completed' | 'paused';
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
    .filter((r) => !r.id.startsWith('lease:') && !r.series_id)
    .flatMap((r) => {
      if (!r.repeat || r.repeat === 'once') return [{ ...r, automatic: false }];
      const occurrences = [];
      for (let n = 0; n < 5000; n++) {
        const due = occurrenceDate(r.due_date, r.repeat, n);
        if ((r.end_date && due > r.end_date) || (r.repeat_count && n >= r.repeat_count)) break;
        const id = `repeat:${r.id}:${due}`;
        const saved = states.get(id);
        occurrences.push({
          ...r,
          ...saved,
          id,
          series_id: r.id,
          repeat: r.repeat,
          occurrence_date: due,
          due_date: saved?.due_date ?? due,
          paused: r.paused,
          automatic: false,
        });
        if (due > today && !saved?.completed) break;
      }
      return occurrences;
    });
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
    .filter((r) => r.property_id === null || active.has(r.property_id))
    .map((r) => {
      const days = Math.round(
        (Date.parse(r.due_date + 'T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / 86400000,
      );
      const state: Alert['state'] = r.completed
        ? 'completed'
        : 'paused' in r && r.paused
          ? 'paused'
          : r.snoozed_until && r.snoozed_until > today
            ? 'snoozed'
            : days < 0
              ? 'overdue'
              : days === 0
                ? 'today'
                : days <= r.notice_days
                  ? 'upcoming'
                  : 'later';
      return {
        ...r,
        property_name:
          r.property_id === null ? 'Portfolio-wide' : active.get(r.property_id)!.display_name,
        days,
        state,
      };
    })
    .sort((a, b) => a.due_date.localeCompare(b.due_date) || a.id.localeCompare(b.id));
}

export function occurrenceDate(start: string, repeat: string, n: number) {
  if (repeat === 'weekly' || repeat === 'fortnightly')
    return addDays(start, n * (repeat === 'weekly' ? 7 : 14));
  const months =
    ({ monthly: 1, quarterly: 3, six_monthly: 6, yearly: 12 } as Record<string, number>)[repeat] ??
    0;
  const [year, month, day] = start.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1 + months * n, 1));
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d.toISOString().slice(0, 10);
}
