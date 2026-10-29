import { apiUser, body, json, failure } from '../../../../../lib/api';
import { propertySchema } from '../../../../../lib/domain';
import { saveProperty, setStatus } from '../../../../../lib/store';
import { z } from 'zod';
type Context = { params: Promise<{ id: string }> };
export async function PUT(request: Request, { params }: Context) {
  try {
    const user = await apiUser(request, true);
    const { id } = await params;
    const input = propertySchema.parse(await body(request));
    const result = await saveProperty(user.userId, input, id);
    return result.length ? json({ result }) : json({ error: 'Property not found.' }, 404);
  } catch (e) {
    return failure(e);
  }
}
export async function PATCH(request: Request, { params }: Context) {
  try {
    const user = await apiUser(request, true);
    const { id } = await params;
    const { status } = z
      .object({ status: z.enum(['active', 'archived']) })
      .strict()
      .parse(await body(request));
    const result = await setStatus(user.userId, id, status);
    return result.length ? json({ result }) : json({ error: 'Property not found.' }, 404);
  } catch (e) {
    return failure(e);
  }
}
