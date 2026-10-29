import { apiUser, body, json, failure } from '../../../../lib/api';
import { propertySchema } from '../../../../lib/domain';
import { saveProperty } from '../../../../lib/store';
export async function POST(request: Request) {
  try {
    const user = await apiUser(request, true);
    const input = propertySchema.parse(await body(request));
    return json({ result: await saveProperty(user.userId, input) }, 201);
  } catch (e) {
    return failure(e);
  }
}
