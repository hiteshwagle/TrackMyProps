import { lookupAddresses } from '../src/features/properties/address-lookup';

describe('lookupAddresses', () => {
  it('does not invoke the Edge Function before seven characters', async () => {
    const invoke = jest.fn();

    await expect(lookupAddresses('123456', 'token', invoke)).resolves.toEqual([]);
    expect(invoke).not.toHaveBeenCalled();
  });

  it('validates the minimized Edge Function response', async () => {
    const invoke = jest.fn().mockResolvedValue({
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
    });

    const suggestions = await lookupAddresses(' 21 marigold ', 'token', invoke);

    expect(invoke).toHaveBeenCalledWith('21 marigold', 'token');
    expect(suggestions[0]?.address_id).toBe('GAVIC421626446');
  });

  it('rejects unexpected provider fields at the frontend boundary', async () => {
    const invoke = jest.fn().mockResolvedValue({
      suggestions: [
        {
          address_id: 'GAVIC421626446',
          address_line_1: '21 MARIGOLD AV',
          country: 'Australia',
          formatted_address: '21 MARIGOLD AV, ALTONA NORTH VIC 3025',
          postcode: '3025',
          provider_secret: 'must-not-pass-through',
          state: 'VIC',
          suburb: 'ALTONA NORTH',
        },
      ],
    });

    await expect(lookupAddresses('21 marigold', 'token', invoke)).rejects.toThrow(
      'Address lookup returned an invalid response.',
    );
  });
});
