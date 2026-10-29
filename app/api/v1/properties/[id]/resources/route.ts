import { apiUser, json, failure } from '../../../../../../lib/api';
import { ownedProperty } from '../../../../../../lib/store';
import { listResources } from '../../../../../../lib/resources-store';
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await apiUser(request);
    const { id } = await params;
    if (!(await ownedProperty(user.userId, id))) return json({ error: 'Property not found.' }, 404);
    return json(await listResources(user.userId, id));
  } catch (e) {
    return failure(e);
  }
}
