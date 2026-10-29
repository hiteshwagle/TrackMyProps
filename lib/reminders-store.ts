import { and, eq } from 'drizzle-orm';
import { getDb } from '../db';
import { reminders } from '../db/schema';
import { listPortfolio } from './store';
import { listResources } from './resources-store';
import { buildAlerts, sydneyToday, type ReminderRecord } from './reminders-domain';
export async function listReminders(ownerId: string): Promise<ReminderRecord[]> {
  const rows = await getDb().select().from(reminders).where(eq(reminders.ownerId, ownerId));
  return rows.map((r) => ({ ...JSON.parse(r.data), id: r.id, property_id: r.propertyId }));
}
export async function listAlerts(ownerId: string) {
  const [portfolio, resources, records] = await Promise.all([
    listPortfolio(ownerId),
    listResources(ownerId),
    listReminders(ownerId),
  ]);
  const today = sydneyToday();
  return { today, alerts: buildAlerts(portfolio.properties, resources.tenants, records, today) };
}
export async function saveReminder(ownerId: string, record: ReminderRecord) {
  await getDb()
    .insert(reminders)
    .values({
      id: record.id,
      ownerId,
      propertyId: record.property_id,
      data: JSON.stringify(record),
    })
    .onConflictDoUpdate({
      target: reminders.id,
      set: { data: JSON.stringify(record) },
      setWhere: and(eq(reminders.ownerId, ownerId), eq(reminders.propertyId, record.property_id)),
    });
}
export async function deleteReminder(ownerId: string, id: string) {
  return getDb()
    .delete(reminders)
    .where(and(eq(reminders.ownerId, ownerId), eq(reminders.id, id)))
    .returning({ id: reminders.id });
}
