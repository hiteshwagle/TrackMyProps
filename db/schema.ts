import {
  sqliteTable,
  text,
  index,
  uniqueIndex,
  foreignKey,
  integer,
} from 'drizzle-orm/sqlite-core';
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
export const propertyFiles = sqliteTable(
  'property_files',
  {
    id: text('id').primaryKey(),
    ownerId: text('owner_id').notNull(),
    propertyId: text('property_id').notNull(),
    kind: text('kind', { enum: ['photo', 'document'] }).notNull(),
    objectKey: text('object_key').notNull(),
    name: text('name').notNull(),
    mime: text('mime').notNull(),
    size: integer('size').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    index('files_owner_property').on(t.ownerId, t.propertyId),
    foreignKey({
      columns: [t.propertyId, t.ownerId],
      foreignColumns: [properties.id, properties.ownerId],
    }).onDelete('cascade'),
  ],
);
export const tenants = sqliteTable(
  'tenants',
  {
    id: text('id').primaryKey(),
    ownerId: text('owner_id').notNull(),
    propertyId: text('property_id').notNull(),
    data: text('data').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [
    index('tenants_owner_property').on(t.ownerId, t.propertyId),
    foreignKey({
      columns: [t.propertyId, t.ownerId],
      foreignColumns: [properties.id, properties.ownerId],
    }).onDelete('cascade'),
  ],
);
export const reminders = sqliteTable(
  'reminders',
  {
    id: text('id').primaryKey(),
    ownerId: text('owner_id').notNull(),
    propertyId: text('property_id'),
    data: text('data').notNull(),
  },
  (t) => [
    index('reminders_owner_property').on(t.ownerId, t.propertyId),
    foreignKey({
      columns: [t.propertyId, t.ownerId],
      foreignColumns: [properties.id, properties.ownerId],
    }).onDelete('cascade'),
  ],
);
