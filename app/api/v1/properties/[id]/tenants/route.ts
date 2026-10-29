import { apiUser, body, json, failure } from '../../../../../../lib/api';
import { ownedProperty } from '../../../../../../lib/store';
import { saveTenant } from '../../../../../../lib/resources-store';
import { tenantSchema } from '../../../../../../lib/resources-domain';
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await apiUser(request, true);
    const { id } = await params;
    if (!(await ownedProperty(user.userId, id))) return json({ error: 'Property not found.' }, 404);
    return json(
      { result: await saveTenant(user.userId, id, tenantSchema.parse(await body(request))) },
      201,
    );
  } catch (e) {
    return failure(e);
  }
}
