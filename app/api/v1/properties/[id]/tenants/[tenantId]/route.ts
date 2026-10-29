import { apiUser, body, json, failure } from '../../../../../../../lib/api';
import { saveTenant, deleteTenant } from '../../../../../../../lib/resources-store';
import { tenantSchema } from '../../../../../../../lib/resources-domain';
type Context = { params: Promise<{ id: string; tenantId: string }> };
export async function PUT(request: Request, { params }: Context) {
  try {
    const user = await apiUser(request, true);
    const { id, tenantId } = await params;
    const result = await saveTenant(
      user.userId,
      id,
      tenantSchema.parse(await body(request)),
      tenantId,
    );
    return result.length ? json({ result }) : json({ error: 'Tenant not found.' }, 404);
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(request: Request, { params }: Context) {
  try {
    const user = await apiUser(request, true);
    const { id, tenantId } = await params;
    const result = await deleteTenant(user.userId, id, tenantId);
    return result.length ? json({ removed: true }) : json({ error: 'Tenant not found.' }, 404);
  } catch (e) {
    return failure(e);
  }
}
