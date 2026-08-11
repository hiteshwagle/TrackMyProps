# Address lookup Edge Function

`address-lookup` is an authenticated, stateless proxy for the PSMA/Geoscape Addresses API. It keeps the provider credential out of the Expo client, validates and minimizes third-party data, stores normalized provider records through the server-only Supabase service role, and returns at most ten address suggestions.

Non-secret runtime settings are centralized in `app-settings.ts`. The provider credential remains in the `PSMA_API_KEY` environment variable and is loaded through the same module; it is never stored in source-controlled settings.

## Why an Edge Function

The user explicitly selected a Supabase Edge Function for this small Supabase-specific provider bridge. The function needs Supabase user authentication and a server-side provider secret, but no authoritative business rules, financial calculations, or long-running processing. Moving this one bounded lookup through the FastAPI service would add another hop without improving its current responsibilities. Core property creation and all business logic remain in the FastAPI backend.

## Interface

- Method: `POST`
- Path: `/functions/v1/address-lookup`
- Authentication: valid Supabase user access token; `verify_jwt = true` and function auth mode `user`
- Input: `{ "query": "21 marigold" }`
- Validation: trimmed query from 7 to 200 characters; no additional fields
- Output: `{ "suggestions": [...] }`, containing at most ten records with `address_id`, `formatted_address`, structured Australian address fields, and no raw provider payload
- Provider timeout: 5 seconds
- Retry policy: no retries
- Persistence: validated provider records are atomically upserted by `address_id` before suggestions are returned
- Failure: safe 4xx/5xx error code and message; provider bodies, search text, credentials, and database details are not logged
- Owner: TrackMyProps backend/application owner
- Tests: `make test-address-function`

The frontend adds its own 1.5-second debounce for usability and request reduction. That debounce is not an enforceable server rate limit. Provider quota controls and a production rate-limiting mechanism remain unresolved.

## Secrets and environments

Use `PSMA_API_KEY` only as a Supabase function secret. A placeholder is committed in `../.env.example`; real environment files are ignored.

Local development:

```bash
cp supabase/functions/.env.example supabase/functions/.env.development
make dev-functions
```

Production deployment must use the Supabase secrets manager and a separately rotated production credential. Never put the provider key in frontend configuration, curl examples, source files, logs, issues, or test fixtures.

## Provider decision record

| Item                                           | Current status                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| Source                                         | PSMA/Geoscape Addresses API v2 geocoder endpoint supplied by the user          |
| Purpose                                        | Authenticated Australian address suggestions and structured address prefilling |
| Data sent                                      | User-entered partial address text                                              |
| Data stored                                    | Normalized address and geocode fields returned by the provider                 |
| Licence / contract owner                       | Unresolved                                                                     |
| Allowed application use                        | Unverified                                                                     |
| Permanent-storage and cache rights             | Unverified; production blocker                                                 |
| Display and redistribution rights              | Unverified; production blocker                                                 |
| Attribution requirements                       | Unverified                                                                     |
| Provider processing location and subprocessors | Unverified                                                                     |
| Provider logging and retention                 | Unverified                                                                     |
| Refresh frequency                              | On authenticated user lookup only                                              |
| Application retention/deletion                 | Unresolved; must align with provider rights and privacy policy                 |
| AI-processing rights                           | Not required and not permitted by this implementation                          |

The geocoder result is address data, not authoritative title, ownership, building, room, valuation, or financial data. The response supplied for development contains none of those additional property attributes.
