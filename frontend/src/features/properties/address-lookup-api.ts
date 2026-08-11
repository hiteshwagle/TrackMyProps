import { getSupabaseClient } from '../../lib/supabase';
import { appSettings } from '../../config/app-settings';
import { lookupAddresses, type AddressSuggestion } from './address-lookup';

export async function lookupAddressesWithSupabase(
  query: string,
  accessToken: string,
): Promise<AddressSuggestion[]> {
  return lookupAddresses(query, accessToken, async (cleanedQuery, token) => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Address lookup is not configured.');
    }

    const { data, error } = await client.functions.invoke(
      appSettings.supabaseFunctions.addressLookup,
      {
        body: { query: cleanedQuery },
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (error) {
      throw new Error('Address lookup is unavailable. Try again shortly.');
    }
    return data;
  });
}
