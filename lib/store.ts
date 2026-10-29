import { and, eq, desc } from 'drizzle-orm';
import { getDb } from '../db';
import { properties, cashFlowItems } from '../db/schema';
import type { Property, PropertyInput, CashFlowItem } from './domain';
export function ownerFilter(ownerId: string, id: string) {
  return and(eq(properties.ownerId, ownerId), eq(properties.id, id));
}
export async function listPortfolio(ownerId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(properties)
    .where(eq(properties.ownerId, ownerId))
    .orderBy(desc(properties.createdAt));
  const items = await db.select().from(cashFlowItems).where(eq(cashFlowItems.ownerId, ownerId));
  return {
    properties: rows.map((r) => ({
      ...JSON.parse(r.data),
      id: r.id,
      status: r.status,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
    })) as Property[],
    items: items.map((r) => ({
      ...JSON.parse(r.data),
      id: r.id,
      property_id: r.propertyId,
    })) as CashFlowItem[],
  };
}
export async function ownedProperty(ownerId: string, id: string) {
  return (
    await getDb()
      .select({ id: properties.id })
      .from(properties)
      .where(ownerFilter(ownerId, id))
      .limit(1)
  )[0];
}
export async function saveProperty(ownerId: string, input: PropertyInput, id?: string) {
  const now = new Date().toISOString();
  const db = getDb();
  if (id) {
    return db
      .update(properties)
      .set({ data: JSON.stringify(input), updatedAt: now })
      .where(ownerFilter(ownerId, id))
      .returning({ id: properties.id });
  }
  return db
    .insert(properties)
    .values({
      id: crypto.randomUUID(),
      ownerId,
      data: JSON.stringify(input),
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: properties.id });
}
export async function setStatus(ownerId: string, id: string, status: 'active' | 'archived') {
  return getDb()
    .update(properties)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(ownerFilter(ownerId, id))
    .returning({ id: properties.id });
}
export async function addItem(ownerId: string, input: Omit<CashFlowItem, 'id'>) {
  return getDb()
    .insert(cashFlowItems)
    .values({
      id: crypto.randomUUID(),
      ownerId,
      propertyId: input.property_id,
      data: JSON.stringify(input),
      createdAt: new Date().toISOString(),
    })
    .returning({ id: cashFlowItems.id });
}
export async function removeItem(ownerId: string, id: string) {
  return getDb()
    .delete(cashFlowItems)
    .where(and(eq(cashFlowItems.ownerId, ownerId), eq(cashFlowItems.id, id)))
    .returning({ id: cashFlowItems.id });
}
