import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';
import { z } from 'zod';

import { publicConfig } from '../../config/public-config';
import { BackendApiError } from '../profile/current-user';
import { backendRequest } from './property-api';

const decimalString = z.string().regex(/^(?=.*[1-9])[0-9]+(?:\.[0-9]{1,2})?$/);
const itemTypeSchema = z.enum(['income', 'expense']);
const frequencySchema = z.enum([
  'weekly',
  'fortnightly',
  'monthly',
  'quarterly',
  'annually',
  'one_off',
]);
const cashFlowItemSchema = z
  .object({
    amount: z.object({ amount: decimalString, currency: z.literal('AUD') }).strict(),
    created_at: z.string(),
    end_date: z.string().nullable(),
    frequency: frequencySchema,
    item_id: z.uuid(),
    item_type: itemTypeSchema,
    name: z.string(),
    occurrence_date: z.string().nullable(),
    property_id: z.uuid(),
    start_date: z.string().nullable(),
    updated_at: z.string(),
  })
  .strict();
const cashFlowItemListSchema = z
  .object({
    items: z.array(cashFlowItemSchema),
    pagination: z
      .object({
        has_next: z.boolean(),
        has_previous: z.boolean(),
        page: z.number().int().positive(),
        page_size: z.number().int().min(1).max(100),
        total: z.number().int().nonnegative(),
        total_pages: z.number().int().nonnegative(),
      })
      .strict(),
  })
  .strict();
const propertyCashFlowSummarySchema = z
  .object({
    calculation_version: z.literal('property-cash-flow-summary:1.0.0'),
    expense_item_count: z.number().int().nonnegative(),
    income_item_count: z.number().int().nonnegative(),
    period: z.literal('annual'),
    period_year: z.number().int().min(2000).max(9999),
    property_id: z.uuid(),
    total_expenses: z
      .object({
        amount: z.string().regex(/^(0|[1-9][0-9]*)(\.[0-9]{1,2})?$/),
        currency: z.literal('AUD'),
      })
      .strict(),
    total_income: z
      .object({
        amount: z.string().regex(/^(0|[1-9][0-9]*)(\.[0-9]{1,2})?$/),
        currency: z.literal('AUD'),
      })
      .strict(),
  })
  .strict();

export type CashFlowItemType = z.infer<typeof itemTypeSchema>;
export type CashFlowFrequency = z.infer<typeof frequencySchema>;
export type PropertyCashFlowItem = z.infer<typeof cashFlowItemSchema>;
export type PropertyCashFlowSummary = z.infer<typeof propertyCashFlowSummarySchema>;
export type PropertyCashFlowItemCreate = {
  amount: { amount: string; currency: 'AUD' };
  end_date: string | null;
  frequency: CashFlowFrequency;
  name: string;
  occurrence_date: string | null;
  start_date: string | null;
};

function collectionPath(itemType: CashFlowItemType): 'income' | 'expenses' {
  return itemType === 'income' ? 'income' : 'expenses';
}

export const cashFlowKeys = {
  all: ['property-cash-flow'] as const,
  property: (userId: string | undefined, propertyId: string, itemType: CashFlowItemType) =>
    [...cashFlowKeys.all, userId, propertyId, itemType] as const,
  summary: (userId: string | undefined, propertyId: string) =>
    [...cashFlowKeys.all, userId, propertyId, 'summary'] as const,
};

export async function fetchPropertyCashFlowSummary(
  accessToken: string,
  propertyId: string,
  backendUrl = publicConfig.backendUrl,
  fetchImplementation: typeof fetch = fetch,
): Promise<PropertyCashFlowSummary> {
  const payload = await backendRequest(
    `/api/v1/properties/${propertyId}/cash-flow-summary`,
    accessToken,
    { method: 'GET' },
    backendUrl,
    fetchImplementation,
  );
  const parsed = propertyCashFlowSummarySchema.safeParse(payload);
  if (!parsed.success) {
    throw new BackendApiError(
      'The backend returned an invalid property cash-flow summary.',
      200,
      'INVALID_BACKEND_RESPONSE',
    );
  }
  return parsed.data;
}

export async function fetchPropertyCashFlowItems(
  accessToken: string,
  propertyId: string,
  itemType: CashFlowItemType,
  backendUrl = publicConfig.backendUrl,
  fetchImplementation: typeof fetch = fetch,
): Promise<PropertyCashFlowItem[]> {
  const payload = await backendRequest(
    `/api/v1/properties/${propertyId}/${collectionPath(itemType)}?page_size=100`,
    accessToken,
    { method: 'GET' },
    backendUrl,
    fetchImplementation,
  );
  const parsed = cashFlowItemListSchema.safeParse(payload);
  if (!parsed.success) {
    throw new BackendApiError(
      'The backend returned invalid income or expense data.',
      200,
      'INVALID_BACKEND_RESPONSE',
    );
  }
  return parsed.data.items;
}

export async function createPropertyCashFlowItem(
  accessToken: string,
  propertyId: string,
  itemType: CashFlowItemType,
  itemInput: PropertyCashFlowItemCreate,
  backendUrl = publicConfig.backendUrl,
  fetchImplementation: typeof fetch = fetch,
): Promise<PropertyCashFlowItem> {
  const payload = await backendRequest(
    `/api/v1/properties/${propertyId}/${collectionPath(itemType)}`,
    accessToken,
    { body: JSON.stringify(itemInput), method: 'POST' },
    backendUrl,
    fetchImplementation,
  );
  const parsed = cashFlowItemSchema.safeParse(payload);
  if (!parsed.success) {
    throw new BackendApiError(
      'The backend returned an invalid income or expense item.',
      200,
      'INVALID_BACKEND_RESPONSE',
    );
  }
  return parsed.data;
}

export async function deletePropertyCashFlowItem(
  accessToken: string,
  _propertyId: string,
  itemType: CashFlowItemType,
  itemId: string,
  backendUrl = publicConfig.backendUrl,
  fetchImplementation: typeof fetch = fetch,
): Promise<void> {
  await backendRequest(
    `/api/v1/${collectionPath(itemType)}/${itemId}`,
    accessToken,
    { method: 'DELETE' },
    backendUrl,
    fetchImplementation,
  );
}

export function usePropertyCashFlowItems(
  session: Session | null,
  propertyId: string,
  itemType: CashFlowItemType,
) {
  return useQuery({
    enabled: Boolean(session),
    queryFn: () => fetchPropertyCashFlowItems(session?.access_token || '', propertyId, itemType),
    queryKey: cashFlowKeys.property(session?.user.id, propertyId, itemType),
  });
}

export function usePropertyCashFlowSummary(session: Session | null, propertyId: string) {
  return useQuery({
    enabled: Boolean(session && propertyId),
    queryFn: () => fetchPropertyCashFlowSummary(session?.access_token || '', propertyId),
    queryKey: cashFlowKeys.summary(session?.user.id, propertyId),
  });
}

export function useCreatePropertyCashFlowItem(session: Session | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemInput,
      itemType,
      propertyId,
    }: {
      itemInput: PropertyCashFlowItemCreate;
      itemType: CashFlowItemType;
      propertyId: string;
    }) => createPropertyCashFlowItem(session?.access_token || '', propertyId, itemType, itemInput),
    onSuccess: async (item) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: cashFlowKeys.property(session?.user.id, item.property_id, item.item_type),
        }),
        queryClient.invalidateQueries({
          queryKey: cashFlowKeys.summary(session?.user.id, item.property_id),
        }),
      ]);
    },
  });
}

export function useDeletePropertyCashFlowItem(session: Session | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      itemType,
      propertyId,
    }: {
      itemId: string;
      itemType: CashFlowItemType;
      propertyId: string;
    }) => deletePropertyCashFlowItem(session?.access_token || '', propertyId, itemType, itemId),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: cashFlowKeys.property(
            session?.user.id,
            variables.propertyId,
            variables.itemType,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: cashFlowKeys.summary(session?.user.id, variables.propertyId),
        }),
      ]);
    },
  });
}
