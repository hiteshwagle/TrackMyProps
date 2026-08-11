import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';
import { z } from 'zod';

import {
  getEnvironmentConfigurationError,
  getPublicServiceUrlError,
  publicConfig,
} from '../../config/public-config';
import { BackendApiError } from '../profile/current-user';

const decimalString = z.string().regex(/^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/);
const moneySchema = z
  .object({
    amount: decimalString,
    currency: z.literal('AUD'),
  })
  .strict();
const rateSchema = z
  .object({
    display_percent: decimalString,
    value: decimalString,
  })
  .strict();

const propertySchema = z
  .object({
    address_id: z.string().nullable(),
    address_line_1: z.string(),
    address_line_2: z.string().nullable(),
    annual_interest_rate: rateSchema.nullable(),
    bathrooms: decimalString,
    bedrooms: decimalString,
    building_area_sqm: decimalString,
    car_spaces: z.number().int(),
    country: z.literal('Australia'),
    created_at: z.string(),
    current_value: moneySchema.nullable(),
    current_value_as_of: z.string().nullable(),
    display_name: z.string(),
    has_loan: z.boolean().nullable(),
    land_area_sqm: decimalString,
    loan_balance_as_of: z.string().nullable(),
    next_repayment_date: z.string().nullable(),
    notes: z.string().nullable(),
    original_loan_amount: moneySchema.nullable(),
    owner_user_id: z.uuid(),
    postcode: z.string(),
    property_id: z.uuid(),
    property_type: z.enum([
      'house',
      'apartment_unit',
      'townhouse',
      'villa',
      'land',
      'commercial',
      'other',
    ]),
    purchase_date: z.string(),
    purchase_price: moneySchema,
    remaining_loan_balance: moneySchema.nullable(),
    repayment_amount: moneySchema.nullable(),
    repayment_frequency: z
      .enum(['weekly', 'fortnightly', 'monthly', 'quarterly', 'annually'])
      .nullable(),
    state: z.string(),
    status: z.enum(['active', 'sold', 'archived']),
    suburb: z.string(),
    updated_at: z.string(),
  })
  .strict();

const propertyListSchema = z
  .object({
    items: z.array(propertySchema),
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
const errorResponseSchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
});

export type Property = z.infer<typeof propertySchema>;

export type PropertyCreate = {
  address_id: string | null;
  address_line_1: string;
  address_line_2: string | null;
  annual_interest_rate: { display_percent: string; value: string } | null;
  bathrooms: string;
  bedrooms: string;
  building_area_sqm: string;
  car_spaces: number;
  country: 'Australia';
  current_value: { amount: string; currency: 'AUD' } | null;
  current_value_as_of: string | null;
  display_name: string;
  has_loan: boolean | null;
  land_area_sqm: string;
  loan_balance_as_of: string | null;
  next_repayment_date: string | null;
  notes: string | null;
  original_loan_amount: { amount: string; currency: 'AUD' } | null;
  postcode: string;
  property_type: Property['property_type'];
  purchase_date: string;
  purchase_price: { amount: string; currency: 'AUD' };
  remaining_loan_balance: { amount: string; currency: 'AUD' } | null;
  repayment_amount: { amount: string; currency: 'AUD' } | null;
  repayment_frequency: Property['repayment_frequency'];
  state: string;
  suburb: string;
};

export const propertyKeys = {
  all: ['properties'] as const,
  active: (userId: string | undefined) => [...propertyKeys.all, 'active', userId] as const,
};

function backendConfigurationError(backendUrl: string): string | null {
  const serviceError = getPublicServiceUrlError(backendUrl, 'Backend');
  if (serviceError) {
    return serviceError;
  }
  if (backendUrl !== publicConfig.backendUrl) {
    return null;
  }
  return getEnvironmentConfigurationError(
    publicConfig.appEnvironment,
    publicConfig.supabaseUrl,
    publicConfig.backendUrl,
  );
}

async function backendRequest(
  path: string,
  accessToken: string,
  init: RequestInit,
  backendUrl: string,
  fetchImplementation: typeof fetch,
): Promise<unknown> {
  const configurationError = backendConfigurationError(backendUrl);
  if (configurationError) {
    throw new BackendApiError(configurationError, 0, 'BACKEND_NOT_CONFIGURED');
  }

  let response: Response;
  try {
    response = await fetchImplementation(`${backendUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
  } catch {
    throw new BackendApiError(
      'The backend is unavailable. Check the local services and try again.',
      0,
      'BACKEND_UNAVAILABLE',
    );
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const parsedError = errorResponseSchema.safeParse(payload);
    throw new BackendApiError(
      parsedError.success ? parsedError.data.error.message : 'The request could not be completed.',
      response.status,
      parsedError.success ? parsedError.data.error.code : 'BACKEND_REQUEST_FAILED',
    );
  }
  return payload;
}

export async function fetchProperties(
  accessToken: string,
  backendUrl = publicConfig.backendUrl,
  fetchImplementation: typeof fetch = fetch,
): Promise<Property[]> {
  const payload = await backendRequest(
    '/api/v1/properties',
    accessToken,
    { method: 'GET' },
    backendUrl,
    fetchImplementation,
  );
  const parsed = propertyListSchema.safeParse(payload);
  if (!parsed.success) {
    throw new BackendApiError(
      'The backend returned an invalid property list.',
      200,
      'INVALID_BACKEND_RESPONSE',
    );
  }
  return parsed.data.items;
}

export async function createProperty(
  accessToken: string,
  propertyInput: PropertyCreate,
  backendUrl = publicConfig.backendUrl,
  fetchImplementation: typeof fetch = fetch,
): Promise<Property> {
  const payload = await backendRequest(
    '/api/v1/properties',
    accessToken,
    { body: JSON.stringify(propertyInput), method: 'POST' },
    backendUrl,
    fetchImplementation,
  );
  const parsed = propertySchema.safeParse(payload);
  if (!parsed.success) {
    throw new BackendApiError(
      'The backend returned an invalid property.',
      200,
      'INVALID_BACKEND_RESPONSE',
    );
  }
  return parsed.data;
}

export function useProperties(session: Session | null) {
  return useQuery({
    enabled: Boolean(session),
    queryFn: () => fetchProperties(session?.access_token || ''),
    queryKey: propertyKeys.active(session?.user.id),
  });
}

export function useCreateProperty(session: Session | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (propertyInput: PropertyCreate) =>
      createProperty(session?.access_token || '', propertyInput),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: propertyKeys.all });
    },
  });
}
