import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

import {
  AddressPersistenceError,
  handleAddressLookup,
  type ProviderAddressRecord,
} from "./lookup.ts";
import { loadAddressLookupSecrets } from "./app-settings.ts";

const secrets = loadAddressLookupSecrets(Deno.env.get);

export default {
  fetch: withSupabase({ auth: "user" }, async (request, context) => {
    return handleAddressLookup(request, {
      fetchImplementation: fetch,
      persist: async (addresses: ProviderAddressRecord[]) => {
        const { error } = await context.supabaseAdmin
          .from("provider_addresses")
          .upsert(addresses, { onConflict: "address_id" });

        if (error) {
          throw new AddressPersistenceError();
        }
      },
      providerApiKey: secrets.providerApiKey,
    });
  }),
};
