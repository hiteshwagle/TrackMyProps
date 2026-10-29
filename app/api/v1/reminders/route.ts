import { ownedFile } from '../../../../lib/resources-store';
import { apiUser, body, json, failure } from '../../../../lib/api';
import { listPortfolio } from '../../../../lib/store';
import { reminderSchema } from '../../../../lib/reminders-domain';
import { listAlerts, saveReminder } from '../../../../lib/reminders-store';
export async function GET(request: Request) {
  try {
    const user = await apiUser(request);
    return json(await listAlerts(user.userId));
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    const user = await apiUser(request, true);
    const input = reminderSchema.parse(await body(request));
    const p = (await listPortfolio(user.userId)).properties.find((p) => p.id === input.property_id);
    if (input.property_id !== null && (!p || p.status !== 'active'))
      return json({ error: 'Active property not found.' }, 404);
    if (input.document_id) {
      const f = await ownedFile(user.userId, input.document_id);
      if (!f || f.kind !== 'document' || (input.property_id && f.propertyId !== input.property_id))
        return json({ error: 'Document not found for this property.' }, 404);
    }
    const record = { ...input, id: crypto.randomUUID(), completed: false, snoozed_until: null };
    await saveReminder(user.userId, record);
    return json({ id: record.id }, 201);
  } catch (e) {
    return failure(e);
  }
}
