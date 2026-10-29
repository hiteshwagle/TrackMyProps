import { apiUser, json, failure } from '../../../../../lib/api';
import { removeItem } from '../../../../../lib/store';
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await apiUser(request, true);
    const { id } = await params;
    const result = await removeItem(user.userId, id);
    return result.length ? json({ result }) : json({ error: 'Entry not found.' }, 404);
  } catch (e) {
    return failure(e);
  }
}
