# TrackMyProps Shared Contracts

This directory is the executable source of truth for versioned TrackMyProps wire contracts. It contains the shared foundation, authenticated identity, and first owner-property API contract. Household, billing, provider, and AI-agent contracts remain deferred.

## Contract inventory

| Contract             | Source                                                | Purpose                                             |
| -------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| Backend API v1       | `openapi/backend-v1.yaml`                             | Operations, identity, and owner property routes      |
| AI-platform API v1   | `openapi/ai-platform-v1.yaml`                         | Current internal AI health and readiness routes     |
| Health response      | `json-schema/common/health-response.schema.json`      | Direct operational status response                  |
| API version metadata | `json-schema/common/api-version-metadata.schema.json` | API, contract, service, request, and trace metadata |
| Money                | `json-schema/common/money.schema.json`                | Decimal-string amount with ISO 4217 currency        |
| Rate                 | `json-schema/common/rate.schema.json`                 | Decimal-form rate and derived display percentage    |
| Pagination           | `json-schema/common/pagination.schema.json`           | Page or cursor metadata selected per endpoint       |
| Idempotency key      | `json-schema/common/idempotency-key.schema.json`      | Safe `X-Idempotency-Key` value                      |
| Error response       | `json-schema/errors/error-response.schema.json`       | Stable error with request and trace correlation     |
| Current user         | `json-schema/identity/current-user.schema.json`       | Backend-verified Supabase identity                  |
| Event envelope       | `events/common.schema.json`                           | Immutable, transport-neutral event metadata         |

`registry.yaml` records versions, ownership roles, consumers, and source paths. Synthetic examples under `examples/` are validated in CI.

`trackmyprops-engineering` is an ownership role, not a named staffing assignment. A named accountable owner remains an operational decision.

## Foundation decisions

These decisions reconcile the documentation conflicts identified before implementation:

1. Health and readiness responses remain direct operational objects rather than API data envelopes. Their existing runtime shapes and paths are now formal contracts.
2. Future single-resource success responses use `data` plus versioned response metadata. Collections use `items`, one endpoint-selected pagination model, and the same metadata. Domain envelopes are added with the first domain contract rather than as an unconstrained generic schema.
3. Client-visible errors require both `request_id` and `trace_id`. The request ID identifies one inbound request; the trace ID correlates distributed work.
4. Page pagination is for small stable collections. Cursor pagination is for large or time-ordered streams. An endpoint selects one model in OpenAPI and cannot silently switch within the same API major version.
5. Public API major versions use `/api/v1`; internal APIs use `/internal/v1`. Health probes retain their approved unversioned backend paths and versioned internal AI paths.
6. Money uses decimal strings and an explicit three-letter currency. The foundation permits negative amounts because sign meaning belongs to the future domain contract.
7. Rates use decimal form in `value`. `display_percent` is derived presentation data and is never authoritative for calculations.
8. Events use a versioned envelope but no event transport is selected. Outbox, delivery, retry, and consumer behaviour remain future implementation work.
9. Contract version, API major version, and application service version are independent values.

Changing any representation above may be breaking. Additive optional fields still require compatibility tests.

## Commands

```bash
uv sync --python 3.12 --frozen
uv run ruff format --check .
uv run ruff check .
uv run mypy tests
uv run pytest
```

Tests validate:

- every JSON Schema against Draft 2020-12;
- all registered paths and unique contract identifiers;
- every synthetic example against its schema;
- OpenAPI 3.1 structure and external schema references;
- representative unsafe or incompatible values are rejected;
- canonical JSON formatting.

## Compatibility

- Additive optional fields are normally compatible.
- Removing a field, changing a type or meaning, changing money or rate representation, changing pagination model, or making an optional field required is breaking.
- Breaking API changes require a new major path such as `/api/v2`.
- Breaking event changes require a new event major version.
- Consumers must ignore unknown response fields and handle unknown error codes safely.

## Validation dependencies

- `jsonschema` validates JSON Schema 2020-12 sources and examples (MIT).
- `openapi-spec-validator` validates OpenAPI 3.1 documents (Apache-2.0).
- `PyYAML` reads the contract registry (MIT).

The tools are development-only, isolated to this directory, and locked in `uv.lock`. Broad optional format dependencies are deliberately excluded.

Generated clients are deliberately deferred until a domain API requires one. Generated files, when introduced, must never be edited manually.

## Security

Contracts and examples must not contain credentials, service-role keys, provider secrets, production identifiers, stack traces, internal connection strings, unrestricted storage paths, private documents, or real user data.
