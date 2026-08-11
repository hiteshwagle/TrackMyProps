export const appSettings = {
  addressLookup: {
    debounceMilliseconds: 1_500,
    maximumQueryLength: 200,
    maximumSuggestions: 10,
    minimumQueryLength: 7,
  },
  feedback: {
    successMessageDurationMilliseconds: 5_000,
  },
  supabaseFunctions: {
    addressLookup: 'address-lookup',
  },
} as const;
