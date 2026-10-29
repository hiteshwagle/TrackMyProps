import { apiUser, body, json, failure } from '../../../../../lib/api';
import { reminderAction, addDays } from '../../../../../lib/reminders-domain';
import { listAlerts, saveReminder, deleteReminder } from '../../../../../lib/reminders-store';
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await apiUser(request, true);
    const { id } = await params;
    const { action } = reminderAction.parse(await body(request));
    const { alerts, today } = await listAlerts(user.userId);
    const alert = alerts.find((a) => a.id === id);
    if (!alert) return json({ error: 'Reminder not found.' }, 404);
    const { automatic, property_name, days, state, ...record } = alert;
    await saveReminder(user.userId, {
      ...record,
      completed: action === 'complete',
      snoozed_until: action === 'snooze' ? addDays(today, 7) : null,
    });
    return json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await apiUser(request, true);
    const { id } = await params;
    if (id.startsWith('lease:'))
      return json({ error: 'Update the tenancy or mark this alert complete.' }, 400);
    const result = await deleteReminder(user.userId, id);
    return result.length ? json({ ok: true }) : json({ error: 'Reminder not found.' }, 404);
  } catch (e) {
    return failure(e);
  }
}
