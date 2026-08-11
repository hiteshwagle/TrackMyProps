import type { SupabaseClient } from '@supabase/supabase-js';

import { appSettings } from '../src/config/app-settings';
import { lookupAddressesWithSupabase } from '../src/features/properties/address-lookup-api';
import { getSupabaseClient } from '../src/lib/supabase';

jest.mock('../src/lib/supabase', () => ({
  getSupabaseClient: jest.fn(),
}));

const mockInvoke = jest.fn();
const mockGetSupabaseClient = jest.mocked(getSupabaseClient);

describe('lookupAddressesWithSupabase', () => {
  beforeEach(() => {
    mockGetSupabaseClient.mockReset();
    mockInvoke.mockReset();
  });

  it('invokes the centrally configured address function', async () => {
    mockGetSupabaseClient.mockReturnValue({
      functions: { invoke: mockInvoke },
    } as unknown as SupabaseClient);
    mockInvoke.mockResolvedValue({
      data: {
        suggestions: [
          {
            address_id: 'GAVIC421626446',
            address_line_1: '21 MARIGOLD AV',
            country: 'Australia',
            formatted_address: '21 MARIGOLD AV, ALTONA NORTH VIC 3025',
            postcode: '3025',
            state: 'VIC',
            suburb: 'ALTONA NORTH',
          },
        ],
      },
      error: null,
    });

    const suggestions = await lookupAddressesWithSupabase('21 marigold', 'user-token');

    expect(mockInvoke).toHaveBeenCalledWith(appSettings.supabaseFunctions.addressLookup, {
      body: { query: '21 marigold' },
      headers: { Authorization: 'Bearer user-token' },
    });
    expect(suggestions[0]?.address_id).toBe('GAVIC421626446');
  });
});
