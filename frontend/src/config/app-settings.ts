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
  propertyCashFlow: {
    expenseSuggestedNames: ['Council rates', 'Insurance', 'Maintenance', 'Property management'],
    incomeSuggestedNames: ['Rent'],
  },
  supabaseFunctions: {
    addressLookup: 'address-lookup',
  },
} as const;
