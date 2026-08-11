import assert from "node:assert/strict";
import test from "node:test";

import { loadAddressLookupSecrets } from "./app-settings.ts";
import {
  AddressPersistenceError,
  handleAddressLookup,
  type ProviderAddressRecord,
} from "./lookup.ts";

test("loads the provider credential from the Edge Function environment", () => {
  const secrets = loadAddressLookupSecrets((name) =>
    name === "PSMA_API_KEY" ? " server-only-key " : undefined,
  );

  assert.equal(secrets.providerApiKey, "server-only-key");
});

const providerFeatureCollection = {
  features: [
    {
      geometry: { coordinates: [144.85455782, -37.82782582], type: "Point" },
      matchCode: { streetName: "exact", streetNumber1: "exact" },
      matchQuality: "Fair",
      matchScore: 65,
      matchType: "Primary Address",
      messages: [],
      properties: {
        addressId: "GAVIC421626446",
        addressRecordType: "PRIMARY",
        aliasPrincipal: "PRINCIPAL",
        cadastralIdentifier: "CM1\\PS720034",
        contributorPropertyId: "221379619",
        dataset: "gnaf,mailAddress,continuousAddress",
        formattedAddress: "21 MARIGOLD AV, ALTONA NORTH VIC 3025",
        geoFeature: "FRONTAGE CENTRE SETBACK",
        jurisdictionId: "221379620",
        localityAlias: ["BROOKLYN"],
        localityId: "loc08caad3924ee",
        localityName: "ALTONA NORTH",
        localityNeighbour: ["ALTONA"],
        postcode: "3025",
        stateTerritory: "VIC",
        streetAlias: [],
        streetLocalityId: "VIC2009126",
        streetName: "MARIGOLD",
        streetNumber1: "21",
        streetType: "AV",
        streetTypeDescription: "AVENUE",
      },
      type: "Feature",
    },
  ],
  type: "FeatureCollection",
};

function request(query: string): Request {
  return new Request("http://localhost/functions/v1/address-lookup", {
    body: JSON.stringify({ query }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
}

test("validates, stores, and minimizes provider suggestions", async () => {
  let stored: ProviderAddressRecord[] = [];
  const fetchImplementation: typeof fetch = async (input, init) => {
    const url = new URL(input.toString());
    assert.equal(url.searchParams.get("address"), "21 marigold");
    assert.equal(url.searchParams.get("maxResults"), "10");
    assert.equal(
      new Headers(init?.headers).get("Authorization"),
      "server-only-key",
    );
    return Response.json(providerFeatureCollection);
  };

  const response = await handleAddressLookup(request("21 marigold"), {
    fetchImplementation,
    persist: async (addresses) => {
      stored = addresses;
    },
    providerApiKey: "server-only-key",
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    suggestions: [
      {
        address_id: "GAVIC421626446",
        address_line_1: "21 MARIGOLD AV",
        country: "Australia",
        formatted_address: "21 MARIGOLD AV, ALTONA NORTH VIC 3025",
        postcode: "3025",
        state: "VIC",
        suburb: "ALTONA NORTH",
      },
    ],
  });
  assert.equal(stored[0]?.longitude, 144.85455782);
  assert.equal(stored[0]?.latitude, -37.82782582);
  assert.equal(stored[0]?.match_score, 65);
});

test("rejects address queries shorter than seven characters without calling the provider", async () => {
  let providerCalled = false;
  const response = await handleAddressLookup(request("123456"), {
    fetchImplementation: async () => {
      providerCalled = true;
      return Response.json(providerFeatureCollection);
    },
    persist: async () => undefined,
    providerApiKey: "server-only-key",
  });

  assert.equal(response.status, 400);
  assert.equal(providerCalled, false);
});

test("returns a safe failure when provider records cannot be stored", async () => {
  const response = await handleAddressLookup(request("21 marigold"), {
    fetchImplementation: async () => Response.json(providerFeatureCollection),
    persist: async () => {
      throw new AddressPersistenceError();
    },
    providerApiKey: "server-only-key",
  });

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    error: {
      code: "ADDRESS_STORAGE_UNAVAILABLE",
      message: "Address lookup is unavailable.",
    },
  });
});

test("fails closed when the provider credential is missing", async () => {
  const response = await handleAddressLookup(request("21 marigold"), {
    fetchImplementation: async () => Response.json(providerFeatureCollection),
    persist: async () => undefined,
    providerApiKey: "",
  });

  assert.equal(response.status, 503);
});
