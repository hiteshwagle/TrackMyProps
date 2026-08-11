import { z } from 'zod';

import { appSettings } from '../../config/app-settings';

const addressSuggestionSchema = z
  .object({
    address_id: z.string().min(1).max(100),
    address_line_1: z.string().min(1).max(300),
    country: z.literal('Australia'),
    formatted_address: z.string().min(1).max(300),
    postcode: z.string().regex(/^\d{4}$/),
    state: z.string().min(1).max(10),
    suburb: z.string().min(1).max(100),
  })
  .strict();

const addressLookupResponseSchema = z
  .object({
    suggestions: z.array(addressSuggestionSchema).max(appSettings.addressLookup.maximumSuggestions),
  })
  .strict();

export type AddressSuggestion = z.infer<typeof addressSuggestionSchema>;

export async function lookupAddresses(
  query: string,
  accessToken: string,
  invoke: (query: string, accessToken: string) => Promise<unknown>,
): Promise<AddressSuggestion[]> {
  const cleanedQuery = query.trim();
  if (
    cleanedQuery.length < appSettings.addressLookup.minimumQueryLength ||
    cleanedQuery.length > appSettings.addressLookup.maximumQueryLength
  ) {
    return [];
  }

  const result = addressLookupResponseSchema.safeParse(await invoke(cleanedQuery, accessToken));
  if (!result.success) {
    throw new Error('Address lookup returned an invalid response.');
  }
  return result.data.suggestions;
}
