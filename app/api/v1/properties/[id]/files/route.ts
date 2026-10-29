import { apiUser, ApiError, json, failure } from '../../../../../../lib/api';
import { ownedProperty } from '../../../../../../lib/store';
import { fileCount, createFile } from '../../../../../../lib/resources-store';
import { safeFileName, detectFileType, uploadLimits } from '../../../../../../lib/resources-domain';
async function boundedBytes(request: Request, max: number) {
  if (Number(request.headers.get('content-length')) > max)
    throw new ApiError(413, 'This file exceeds the upload size limit.');
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, 'Choose a file.');
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel();
      throw new ApiError(413, 'This file exceeds the upload size limit.');
    }
    chunks.push(value);
  }
  if (!total) throw new ApiError(400, 'Empty files cannot be uploaded.');
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await apiUser(request, true, 'application/octet-stream');
    const { id } = await params;
    if (!(await ownedProperty(user.userId, id))) return json({ error: 'Property not found.' }, 404);
    const kind = new URL(request.url).searchParams.get('kind');
    if (kind !== 'photo' && kind !== 'document')
      throw new ApiError(400, 'Choose photo or document.');
    const limit = kind === 'photo' ? uploadLimits.photos : uploadLimits.documents;
    if ((await fileCount(user.userId, id, kind)) >= limit)
      throw new ApiError(
        409,
        `A property can hold ${limit} ${kind === 'photo' ? 'photos' : 'documents'}. Remove a file first.`,
      );
    let name: string;
    try {
      name = safeFileName(decodeURIComponent(request.headers.get('x-file-name') || ''));
    } catch (e) {
      throw new ApiError(400, (e as Error).message);
    }
    const bytes = await boundedBytes(
      request,
      kind === 'photo' ? uploadLimits.photoBytes : uploadLimits.documentBytes,
    );
    let mime: string;
    try {
      mime = detectFileType(name, bytes, kind);
    } catch (e) {
      throw new ApiError(400, (e as Error).message);
    }
    const fileId = await createFile(user.userId, id, kind, name, mime, bytes);
    return json({ id: fileId }, 201);
  } catch (e) {
    return failure(e);
  }
}
