import { sqliteTable, text, index, uniqueIndex, foreignKey } from 'drizzle-orm/sqlite-core';
export const properties = sqliteTable(
  'properties',
  {
    id: text('id').primaryKey(),
    ownerId: text('owner_id').notNull(),
    status: text('status', { enum: ['active', 'archived'] })
      .notNull()
      .default('active'),
    data: text('data').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [
    index('properties_owner_status').on(t.ownerId, t.status),
    uniqueIndex('property_owner_key').on(t.id, t.ownerId),
  ],
);
export const cashFlowItems = sqliteTable(
  'cash_flow_items',
  {
    id: text('id').primaryKey(),
    ownerId: text('owner_id').notNull(),
    propertyId: text('property_id').notNull(),
    data: text('data').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    index('cash_flow_owner_property').on(t.ownerId, t.propertyId),
    foreignKey({
      columns: [t.propertyId, t.ownerId],
      foreignColumns: [properties.id, properties.ownerId],
    }).onDelete('cascade'),
  ],
);
