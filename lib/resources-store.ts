import { and, eq, desc, count } from 'drizzle-orm';
import { env } from 'cloudflare:workers';
import { getDb } from '../db';
import { propertyFiles, tenants } from '../db/schema';
import type { PropertyResources, TenantInput } from './resources-domain';
import { ApiError } from './api';
export function fileBucket() {
  if (!env.BUCKET)
    throw new ApiError(503, 'File storage is temporarily unavailable. Please try again.');
  return env.BUCKET;
}
export async function listResources(
  ownerId: string,
  propertyId?: string,
): Promise<PropertyResources> {
  const fileFilter = propertyId
    ? and(eq(propertyFiles.ownerId, ownerId), eq(propertyFiles.propertyId, propertyId))
    : eq(propertyFiles.ownerId, ownerId);
  const tenantFilter = propertyId
    ? and(eq(tenants.ownerId, ownerId), eq(tenants.propertyId, propertyId))
    : eq(tenants.ownerId, ownerId);
  const db = getDb();
  const files = await db
    .select({
      id: propertyFiles.id,
      property_id: propertyFiles.propertyId,
      kind: propertyFiles.kind,
      name: propertyFiles.name,
      mime: propertyFiles.mime,
      size: propertyFiles.size,
      created_at: propertyFiles.createdAt,
    })
    .from(propertyFiles)
    .where(fileFilter)
    .orderBy(desc(propertyFiles.createdAt), desc(propertyFiles.id));
  const people = await db
    .select()
    .from(tenants)
    .where(tenantFilter)
    .orderBy(desc(tenants.createdAt));
  return {
    files,
    tenants: people.map((p) => ({
      ...JSON.parse(p.data),
      id: p.id,
      property_id: p.propertyId,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
    })),
  };
}
export async function ownedFile(ownerId: string, id: string) {
  return (
    await getDb()
      .select()
      .from(propertyFiles)
      .where(and(eq(propertyFiles.ownerId, ownerId), eq(propertyFiles.id, id)))
      .limit(1)
  )[0];
}
export async function fileCount(ownerId: string, propertyId: string, kind: 'photo' | 'document') {
  return (
    await getDb()
      .select({ total: count() })
      .from(propertyFiles)
      .where(
        and(
          eq(propertyFiles.ownerId, ownerId),
          eq(propertyFiles.propertyId, propertyId),
          eq(propertyFiles.kind, kind),
        ),
      )
  )[0].total;
}
export async function createFile(
  ownerId: string,
  propertyId: string,
  kind: 'photo' | 'document',
  name: string,
  mime: string,
  bytes: Uint8Array,
) {
  const id = crypto.randomUUID();
  const key = `properties/${propertyId}/${id}`;
  const bucket = fileBucket();
  await bucket.put(key, bytes, { httpMetadata: { contentType: mime } });
  try {
    await getDb().insert(propertyFiles).values({
      id,
      ownerId,
      propertyId,
      kind,
      name,
      mime,
      size: bytes.byteLength,
      objectKey: key,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    await bucket.delete(key);
    throw error;
  }
  return id;
}
export async function deleteFile(ownerId: string, id: string) {
  const file = await ownedFile(ownerId, id);
  if (!file) return false;
  await fileBucket().delete(file.objectKey);
  await getDb()
    .delete(propertyFiles)
    .where(and(eq(propertyFiles.ownerId, ownerId), eq(propertyFiles.id, id)));
  return true;
}
export async function saveTenant(
  ownerId: string,
  propertyId: string,
  input: TenantInput,
  id?: string,
) {
  const now = new Date().toISOString();
  const db = getDb();
  if (id)
    return db
      .update(tenants)
      .set({ data: JSON.stringify(input), updatedAt: now })
      .where(
        and(eq(tenants.ownerId, ownerId), eq(tenants.propertyId, propertyId), eq(tenants.id, id)),
      )
      .returning({ id: tenants.id });
  return db
    .insert(tenants)
    .values({
      id: crypto.randomUUID(),
      ownerId,
      propertyId,
      data: JSON.stringify(input),
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: tenants.id });
}
export async function deleteTenant(ownerId: string, propertyId: string, id: string) {
  return getDb()
    .delete(tenants)
    .where(
      and(eq(tenants.ownerId, ownerId), eq(tenants.propertyId, propertyId), eq(tenants.id, id)),
    )
    .returning({ id: tenants.id });
}
