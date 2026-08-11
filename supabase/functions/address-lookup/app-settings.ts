export const addressLookupSettings = {
  maximumProviderResponseBytes: 1_000_000,
  maximumQueryLength: 200,
  maximumResults: 10,
  minimumQueryLength: 7,
  providerTimeoutMilliseconds: 5_000,
  providerUrl: "https://api.psma.com.au/v2/addresses/geocoder",
} as const;

export function loadAddressLookupSecrets(
  readEnvironmentVariable: (name: string) => string | undefined,
) {
  return {
    providerApiKey: readEnvironmentVariable("PSMA_API_KEY")?.trim() ?? "",
  } as const;
}
