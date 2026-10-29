import { ownedFile } from '../../../../../lib/resources-store';
import { apiUser, body, json, failure } from '../../../../../lib/api';
import { reminderAction, addDays } from '../../../../../lib/reminders-domain';
import {
  listAlerts,
  listReminders,
  saveReminder,
  saveReminderBatch,
  deleteReminder,
} from '../../../../../lib/reminders-store';
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await apiUser(request, true);
    const { id } = await params;
    const command = reminderAction.parse(await body(request));
    const { action } = command;
    const { alerts, today } = await listAlerts(user.userId);
    const alert = alerts.find((a) => a.id === id);
    if (!alert) return json({ error: 'Reminder not found.' }, 404);
    const { automatic, property_name, days, state, ...record } = alert;
    if (action === 'pause' || action === 'resume') {
      if (!record.series_id) return json({ error: 'Only repeating reminders can be paused.' }, 400);
      const root = (await listReminders(user.userId)).find((r) => r.id === record.series_id)!;
      await saveReminder(user.userId, { ...root, paused: action === 'pause' });
      return json({ ok: true });
    }
    if (command.action === 'edit') {
      if (command.data.document_id) {
        const f = await ownedFile(user.userId, command.data.document_id);
        if (
          !f ||
          f.kind !== 'document' ||
          (command.data.property_id && f.propertyId !== command.data.property_id)
        )
          return json({ error: 'Document not found for this property.' }, 404);
      }
      if (automatic) return json({ error: 'Edit the tenancy to change lease alerts.' }, 400);
      if (command.data.property_id !== record.property_id)
        return json({ error: 'Keep the existing property when editing.' }, 400);
      if (record.series_id && command.scope === 'future') {
        const root = (await listReminders(user.userId)).find((r) => r.id === record.series_id)!;
        await saveReminderBatch(user.userId, [
          { ...root, end_date: addDays(record.occurrence_date!, -1) },
          { ...command.data, id: crypto.randomUUID(), completed: false, snoozed_until: null },
        ]);
      } else {
        await saveReminder(user.userId, {
          ...record,
          ...command.data,
          repeat: record.series_id ? 'once' : command.data.repeat,
          completed: record.completed,
          snoozed_until: null,
        });
      }
      return json({ ok: true });
    }
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
