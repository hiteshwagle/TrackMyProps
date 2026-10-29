import { apiUser, json, failure } from '../../../../../lib/api';
import { ownedFile, fileBucket, deleteFile } from '../../../../../lib/resources-store';
import { ownedProperty } from '../../../../../lib/store';
export async function GET(request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    const user = await apiUser(request);
    const { fileId } = await params;
    const file = await ownedFile(user.userId, fileId);
    if (!file || !(await ownedProperty(user.userId, file.propertyId)))
      return json({ error: 'File not found.' }, 404);
    const object = await fileBucket().get(file.objectKey);
    if (!object) return json({ error: 'File not found.' }, 404);
    const mode =
      file.kind === 'photo' && !new URL(request.url).searchParams.has('download')
        ? 'inline'
        : 'attachment';
    const ascii = file.name.replace(/[^a-zA-Z0-9._ -]/g, '_');
    return new Response(object.body as unknown as BodyInit, {
      headers: {
        'Content-Type': file.mime,
        'Content-Length': String(file.size),
        'Content-Disposition': `${mode}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "sandbox; default-src 'none'",
      },
    });
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  try {
    const user = await apiUser(request, true);
    const { fileId } = await params;
    return (await deleteFile(user.userId, fileId))
      ? json({ removed: true })
      : json({ error: 'File not found.' }, 404);
  } catch (e) {
    return failure(e);
  }
}
