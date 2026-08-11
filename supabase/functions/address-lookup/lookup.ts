import { addressLookupSettings } from "./app-settings.ts";

type JsonObject = Record<string, unknown>;

export type ProviderAddressRecord = {
  address_id: string;
  address_record_type: string | null;
  alias_principal: string | null;
  cadastral_identifier: string | null;
  contributor_property_id: string | null;
  dataset: string | null;
  formatted_address: string;
  geo_feature: string | null;
  jurisdiction_id: string | null;
  latitude: number | null;
  locality_alias: string[];
  locality_id: string | null;
  locality_name: string;
  locality_neighbour: string[];
  longitude: number | null;
  lot_identifier: string | null;
  match_code: unknown;
  match_quality: string | null;
  match_score: number | null;
  match_type: string | null;
  messages: unknown;
  postcode: string;
  retrieved_at: string;
  state_territory: string;
  street_alias: unknown;
  street_locality_id: string | null;
  street_name: string;
  street_number_1: string;
  street_type: string | null;
  street_type_description: string | null;
};

export type AddressSuggestion = {
  address_id: string;
  address_line_1: string;
  country: "Australia";
  formatted_address: string;
  postcode: string;
  state: string;
  suburb: string;
};

type LookupDependencies = {
  fetchImplementation: typeof fetch;
  persist: (addresses: ProviderAddressRecord[]) => Promise<void>;
  providerApiKey: string;
};

export class AddressPersistenceError extends Error {}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const cleaned = value.trim();
  return cleaned && cleaned.length <= maxLength ? cleaned : null;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .slice(0, 50)
    .map((item) => boundedString(item, 200))
    .filter((item): item is string => item !== null);
}

function boundedJson(value: unknown, fallback: unknown): unknown {
  try {
    const serialized = JSON.stringify(value);
    return serialized.length <= 10_000 ? JSON.parse(serialized) : fallback;
  } catch {
    return fallback;
  }
}

function coordinate(
  value: unknown,
  minimum: number,
  maximum: number,
): number | null {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= minimum &&
    value <= maximum
    ? value
    : null;
}

function normalizeFeature(
  feature: unknown,
  retrievedAt: string,
): ProviderAddressRecord | null {
  if (!isObject(feature) || !isObject(feature.properties)) {
    return null;
  }

  const properties = feature.properties;
  const addressId = boundedString(properties.addressId, 100);
  const formattedAddress = boundedString(properties.formattedAddress, 300);
  const localityName = boundedString(properties.localityName, 100);
  const stateTerritory = boundedString(properties.stateTerritory, 10);
  const postcode = boundedString(properties.postcode, 4);
  const streetName = boundedString(properties.streetName, 200);
  const streetNumber = boundedString(properties.streetNumber1, 30);

  if (
    !addressId ||
    !formattedAddress ||
    !localityName ||
    !stateTerritory ||
    !postcode?.match(/^[0-9]{4}$/) ||
    !streetName ||
    !streetNumber
  ) {
    return null;
  }

  const geometry = isObject(feature.geometry) ? feature.geometry : null;
  const coordinates =
    geometry && Array.isArray(geometry.coordinates) ? geometry.coordinates : [];
  const matchScore = feature.matchScore;

  return {
    address_id: addressId,
    address_record_type: boundedString(properties.addressRecordType, 50),
    alias_principal: boundedString(properties.aliasPrincipal, 50),
    cadastral_identifier: boundedString(properties.cadastralIdentifier, 100),
    contributor_property_id: boundedString(
      properties.contributorPropertyId,
      100,
    ),
    dataset: boundedString(properties.dataset, 300),
    formatted_address: formattedAddress,
    geo_feature: boundedString(properties.geoFeature, 100),
    jurisdiction_id: boundedString(properties.jurisdictionId, 100),
    latitude: coordinate(coordinates[1], -90, 90),
    locality_alias: stringArray(properties.localityAlias),
    locality_id: boundedString(properties.localityId, 100),
    locality_name: localityName,
    locality_neighbour: stringArray(properties.localityNeighbour),
    longitude: coordinate(coordinates[0], -180, 180),
    lot_identifier: boundedString(properties.lotIdentifier, 100),
    match_code: boundedJson(feature.matchCode, {}),
    match_quality: boundedString(feature.matchQuality, 50),
    match_score:
      typeof matchScore === "number" && Number.isInteger(matchScore)
        ? matchScore
        : null,
    match_type: boundedString(feature.matchType, 100),
    messages: boundedJson(feature.messages, []),
    postcode,
    retrieved_at: retrievedAt,
    state_territory: stateTerritory,
    street_alias: boundedJson(properties.streetAlias, []),
    street_locality_id: boundedString(properties.streetLocalityId, 100),
    street_name: streetName,
    street_number_1: streetNumber,
    street_type: boundedString(properties.streetType, 50),
    street_type_description: boundedString(
      properties.streetTypeDescription,
      100,
    ),
  };
}

function suggestion(address: ProviderAddressRecord): AddressSuggestion {
  return {
    address_id: address.address_id,
    address_line_1:
      address.formatted_address.split(",", 1)[0]?.trim() ||
      address.formatted_address,
    country: "Australia",
    formatted_address: address.formatted_address,
    postcode: address.postcode,
    state: address.state_territory,
    suburb: address.locality_name,
  };
}

function errorResponse(
  status: number,
  code: string,
  message: string,
): Response {
  return Response.json({ error: { code, message } }, { status });
}

async function parseRequest(request: Request): Promise<string | null> {
  try {
    const body: unknown = await request.json();
    if (!isObject(body) || Object.keys(body).some((key) => key !== "query")) {
      return null;
    }
    const query = boundedString(
      body.query,
      addressLookupSettings.maximumQueryLength,
    );
    return query && query.length >= addressLookupSettings.minimumQueryLength
      ? query
      : null;
  } catch {
    return null;
  }
}

async function fetchProviderAddresses(
  query: string,
  dependencies: LookupDependencies,
): Promise<ProviderAddressRecord[]> {
  const url = new URL(addressLookupSettings.providerUrl);
  url.searchParams.set("address", query);
  url.searchParams.set(
    "maxResults",
    String(addressLookupSettings.maximumResults),
  );

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    addressLookupSettings.providerTimeoutMilliseconds,
  );
  try {
    const response = await dependencies.fetchImplementation(url, {
      headers: {
        Accept: "application/geo+json, application/json",
        Authorization: dependencies.providerApiKey,
      },
      method: "GET",
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error("provider response was not successful");
    }

    const body = await response.text();
    if (body.length > addressLookupSettings.maximumProviderResponseBytes) {
      throw new Error("provider response was too large");
    }
    const payload: unknown = JSON.parse(body);
    if (
      !isObject(payload) ||
      payload.type !== "FeatureCollection" ||
      !Array.isArray(payload.features)
    ) {
      throw new Error("provider response was invalid");
    }

    const retrievedAt = new Date().toISOString();
    const records = payload.features
      .slice(0, addressLookupSettings.maximumResults)
      .map((feature) => normalizeFeature(feature, retrievedAt))
      .filter((record): record is ProviderAddressRecord => record !== null);
    return [
      ...new Map(records.map((record) => [record.address_id, record])).values(),
    ];
  } finally {
    clearTimeout(timeout);
  }
}

export async function handleAddressLookup(
  request: Request,
  dependencies: LookupDependencies,
): Promise<Response> {
  if (request.method !== "POST") {
    return errorResponse(
      405,
      "METHOD_NOT_ALLOWED",
      "Use POST for address lookup.",
    );
  }
  if (!dependencies.providerApiKey) {
    return errorResponse(
      503,
      "ADDRESS_LOOKUP_NOT_CONFIGURED",
      "Address lookup is not configured.",
    );
  }

  const query = await parseRequest(request);
  if (!query) {
    return errorResponse(
      400,
      "INVALID_ADDRESS_QUERY",
      `Enter an address containing between ${addressLookupSettings.minimumQueryLength} and ${addressLookupSettings.maximumQueryLength} characters.`,
    );
  }

  let addresses: ProviderAddressRecord[];
  try {
    addresses = await fetchProviderAddresses(query, dependencies);
    if (addresses.length > 0) {
      await dependencies.persist(addresses);
    }
  } catch (error) {
    if (error instanceof AddressPersistenceError) {
      return errorResponse(
        503,
        "ADDRESS_STORAGE_UNAVAILABLE",
        "Address lookup is unavailable.",
      );
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      return errorResponse(
        504,
        "ADDRESS_PROVIDER_TIMEOUT",
        "Address lookup timed out.",
      );
    }
    return errorResponse(
      502,
      "ADDRESS_PROVIDER_UNAVAILABLE",
      "Address lookup is unavailable.",
    );
  }

  return Response.json({ suggestions: addresses.map(suggestion) });
}
