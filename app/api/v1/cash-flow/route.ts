import { apiUser, body, json, failure } from '../../../../lib/api';
import { itemSchema } from '../../../../lib/domain';
import { addItem, ownedProperty } from '../../../../lib/store';
export async function POST(request: Request) {
  try {
    const user = await apiUser(request, true);
    const input = itemSchema.parse(await body(request));
    if (!(await ownedProperty(user.userId, input.property_id)))
      return json({ error: 'Property not found.' }, 404);
    return json({ result: await addItem(user.userId, input) }, 201);
  } catch (e) {
    return failure(e);
  }
}
