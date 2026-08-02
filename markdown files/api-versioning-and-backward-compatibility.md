# TrackMyProps API Versioning and Backward Compatibility

## 1. Purpose

This document defines how TrackMyProps APIs and contracts evolve safely over time.

It applies to:

```text
TrackMyProps/
├── frontend/
├── backend/
├── ai-platform/
├── data-platform/
├── contracts/
└── integrations/
```

It covers:

- public API versioning;
- internal API versioning;
- mobile-client compatibility;
- web-client compatibility;
- event-schema compatibility;
- AI tool contracts;
- provider adapters;
- deprecation;
- migration;
- client communication;
- feature rollout;
- compatibility testing;
- retirement of old versions.

This document must remain consistent with:

```text
api-design.md
contracts.md
event-catalogue.md
deployment-and-devops.md
testing-strategy.md
frontend_SKILL.md
backend_SKILL.md
ai-platform_SKILL.md
```

---

# 2. Objectives

The compatibility strategy must:

- prevent breaking supported clients;
- allow backend evolution;
- support slow mobile-store adoption;
- provide clear deprecation timelines;
- minimise permanent legacy code;
- make contract changes testable;
- preserve internal service interoperability;
- support provider changes safely;
- keep release ownership clear.

---

# 3. Core principles

1. Compatibility is a product requirement.
2. Supported mobile clients must continue working after backend releases.
3. Breaking changes require an explicit version boundary.
4. Additive changes are preferred.
5. Clients must tolerate unknown optional fields and enum values where documented.
6. Removing a field is a breaking change.
7. Changing meaning is a breaking change even if the type remains unchanged.
8. Internal APIs require compatibility discipline too.
9. Deprecation must be observable.
10. Old versions must have a retirement plan.
11. Database-schema changes must not leak directly into public contracts.
12. Contract tests are mandatory.
13. Production artifacts must declare supported contract versions.
14. Version negotiation must fail clearly.
15. Compatibility decisions must be documented.

---

# 4. Versioned contract surfaces

TrackMyProps has several independently versioned surfaces:

```text
public backend API
internal AI API
internal backend tool API
event schemas
webhook schemas
mobile application runtime
frontend web application
agent input/output schemas
calculation versions
dataset schemas
provider adapters
public partner APIs
future MCP tools and resources
```

These versions must not be conflated.

---

# 5. Public API versioning

Initial base path:

```text
/api/v1
```

Future breaking version:

```text
/api/v2
```

Versioning by URL path is recommended for the public API because it is:

- explicit;
- easy to route;
- easy to document;
- visible in logs;
- compatible with mobile clients;
- easy to retire.

Do not rely only on an `Accept` header for major public versions.

---

# 6. Internal API versioning

Internal APIs use:

```text
/internal/v1
```

Internal does not mean unversioned.

Internal callers may deploy independently and can still break.

Required:

- schema version;
- compatibility tests;
- caller and callee version visibility;
- deprecation process;
- supported-version register.

---

# 7. API-version semantics

Major API version represents a breaking contract family.

Examples:

```text
v1
v2
```

Do not create:

```text
v1.1
v1.2
```

in the URL path.

Minor additive evolution occurs within the same major version.

---

# 8. Backward-compatible changes

Generally compatible:

- adding a new endpoint;
- adding an optional request field;
- adding an optional response field;
- adding pagination metadata;
- adding a new error detail field;
- adding a safe enum value when clients are required to handle unknown values;
- relaxing validation;
- adding a new event type;
- adding a new optional event payload field;
- adding an optional include or filter parameter.

Compatibility still requires testing.

---

# 9. Breaking changes

Examples:

- removing a field;
- renaming a field;
- changing field type;
- changing units;
- changing rate representation;
- changing null semantics;
- making optional input required;
- changing endpoint path;
- changing HTTP method;
- changing error code meaning;
- changing pagination model;
- changing authentication mechanism;
- changing resource ownership semantics;
- changing enum meaning;
- changing default behaviour materially;
- returning less-authorised data than contract promises;
- changing event aggregate meaning;
- changing approval behaviour;
- changing calculation output meaning without versioning.

---

# 10. Behavioural compatibility

A change can be breaking without schema change.

Examples:

- endpoint becomes asynchronous;
- sort order changes;
- default filter changes;
- deleted resources start appearing;
- stale data is newly rejected;
- operation requires approval;
- retry behaviour changes;
- idempotency semantics change.

Behavioural changes must be explicitly reviewed.

---

# 11. Mobile compatibility challenge

Mobile clients may remain installed for months.

The backend must support a documented client window.

Suggested initial policy:

```text
Current production mobile version
Previous two minor mobile versions
Minimum supported runtime defined explicitly
```

Final support window must be based on:

- adoption rate;
- security risk;
- store review delays;
- API cost;
- business impact.

---

# 12. Mobile-client headers

Clients should send:

```text
X-App-Platform
X-App-Version
X-App-Build
X-Runtime-Version
X-Client-Contract-Version
```

Example:

```text
X-App-Platform: ios
X-App-Version: 1.5.0
X-App-Build: 102
X-Runtime-Version: 1.5
X-Client-Contract-Version: 1
```

---

# 13. Minimum-supported version

Backend may return:

```text
426 Upgrade Required
```

only where necessary.

Response:

```json
{
  "error": {
    "code": "CLIENT_UPGRADE_REQUIRED",
    "message": "This version of TrackMyProps is no longer supported.",
    "details": {
      "minimum_version": "1.3.0",
      "latest_version": "1.6.0",
      "upgrade_reason": "security"
    }
  }
}
```

Use forced upgrade sparingly.

---

# 14. Soft upgrade

Prefer a soft upgrade before forced upgrade.

Client states:

```text
supported
upgrade_recommended
upgrade_required
blocked
```

A recommended upgrade must not block core use.

---

# 15. Web compatibility

The web frontend can usually deploy with the backend.

Even so:

- deploy backend-compatible changes first;
- keep static assets versioned;
- avoid cached old frontend calling incompatible APIs;
- use cache-busting;
- support rollback;
- keep API compatibility during CDN propagation.

---

# 16. Expand-and-contract API changes

Recommended sequence:

```text
1. Add new optional field or endpoint
2. Deploy backend support
3. Update clients to use new contract
4. Observe adoption
5. Deprecate old field or endpoint
6. Remove only in next major version or after policy allows
```

Never remove first and update clients later.

---

# 17. Field migration pattern

Example:

Old:

```json
{
  "weekly_rent": "650.00"
}
```

New:

```json
{
  "weekly_rent": {
    "amount": "650.00",
    "currency": "AUD"
  }
}
```

Safe migration:

- add `weekly_rent_money`;
- support both inputs temporarily;
- return both where needed;
- update clients;
- measure old-field use;
- remove old field only under a major-version or approved retirement plan.

---

# 18. Endpoint migration pattern

Old:

```text
POST /api/v1/properties/{id}/analyse
```

New:

```text
POST /api/v1/ai-executions
```

Migration options:

- retain old endpoint as adapter;
- return deprecation headers;
- log usage;
- update clients;
- retire after support window.

---

# 19. Deprecation headers

Use standard or documented headers:

```text
Deprecation: true
Sunset: <HTTP date>
Link: <migration documentation>; rel="deprecation"
```

Optional:

```text
X-Deprecated-Endpoint
X-Replacement-Endpoint
```

Do not expose internal-only links to public clients.

---

# 20. Deprecation policy

Every deprecation must define:

```text
deprecated_contract
replacement
announcement_date
minimum_migration_period
sunset_date
affected_clients
owner
usage_metric
removal_release
```

Suggested minimum periods:

```text
Public mobile API: 6 months
Partner API: contract-defined, usually 6–12 months
Internal API: 30–90 days depending on deployment ownership
Event schema: until all registered consumers migrate
```

Security issues may require shorter periods.

---

# 21. Deprecation communication

Communicate through:

- developer documentation;
- release notes;
- in-app soft-upgrade messaging;
- partner email;
- technical account contact;
- dashboard warning;
- API response headers;
- support notice.

Internal deprecations require named consumer owners.

---

# 22. Usage telemetry

Track deprecated-contract use by:

```text
endpoint
field
event_version
client_version
platform
partner
consumer_service
```

Do not remove a deprecated contract based only on elapsed time.

Confirm actual usage.

---

# 23. Unknown-field tolerance

Clients should ignore unknown response fields.

Servers should reject unknown request fields only where necessary.

For strict financial or security commands, unknown fields may be rejected to avoid ambiguity.

The policy must be endpoint specific.

---

# 24. Enum evolution

Clients must implement a fallback.

Example:

```typescript
switch (status) {
  case "active":
  case "archived":
    break;
  default:
    return "unknown";
}
```

Do not assume the enum list is permanently closed unless explicitly documented.

---

# 25. Nullability changes

Changing nullable to required is breaking.

Changing required to nullable may still break clients that assume presence.

New nullable fields must have documented null meaning.

Never replace missing with zero solely for compatibility.

---

# 26. Error compatibility

Stable error code examples:

```text
VALIDATION_ERROR
PROPERTY_NOT_FOUND
HOUSEHOLD_ACCESS_DENIED
APPROVAL_REQUIRED
QUOTA_EXCEEDED
CLIENT_UPGRADE_REQUIRED
```

Within a major API version:

- do not reuse an error code for a different meaning;
- adding new error codes is allowed;
- clients should handle unknown errors generically;
- HTTP status and error code must remain coherent.

---

# 27. Pagination compatibility

Do not silently change:

```text
page based
```

to:

```text
cursor based
```

on the same endpoint.

Create a new endpoint, new parameter mode, or new major version.

Cursor tokens are opaque and must not expose implementation details.

---

# 28. Sorting compatibility

Default sort order is part of behaviour.

If changed:

- add explicit sort parameter;
- preserve old default during migration;
- document change;
- version if necessary.

---

# 29. Authentication compatibility

Changing from one authentication scheme to another requires:

- overlap period;
- dual validation where safe;
- client migration;
- token audience validation;
- deprecation;
- security review.

Do not weaken authentication for compatibility.

---

# 30. Webhook versioning

Webhook payloads must include:

```text
event_type
event_version
event_id
occurred_at
```

Receivers should register supported versions.

Breaking webhook payload changes require:

- new version;
- parallel delivery or endpoint;
- migration window;
- signature compatibility;
- replay testing.

---

# 31. Event schema versioning

Event version example:

```text
property.updated v1.0
```

Backward-compatible change:

```text
v1.1
```

Breaking payload or meaning change:

```text
v2.0
```

The transport event name may remain:

```text
property.updated
```

with version in the envelope.

Alternatively, topic or event name may include major version where transport requires isolation.

---

# 32. Event consumer compatibility

Every consumer must declare:

```text
supported_event_types
supported_versions
owner
deployment
fallback behaviour
```

A producer must not publish a breaking event version until all required consumers are ready.

---

# 33. AI tool contract versioning

AI tool definitions are contracts.

Each tool requires:

```text
tool_id
tool_version
input_schema
output_schema
permission
timeout
```

Breaking tool change requires a new tool version.

Example:

```text
calculate_sale_scenario_v1
calculate_sale_scenario_v2
```

Do not change tool meaning silently because prompts and agents may depend on it.

---

# 34. Agent schema compatibility

Every agent has:

```text
agent_version
prompt_version
input_schema_version
output_schema_version
```

A backend consumer must declare supported output versions.

Agent rollout should support:

- shadow validation;
- canary;
- rollback;
- dual parsing during migration;
- stored result version.

---

# 35. Calculation versioning

Financial calculations must use explicit versions.

Example:

```text
calculation_version: 1.2.0
```

A formula change may not require API v2 if the response contract remains stable, but it must:

- preserve old snapshots;
- identify calculation version;
- document changed meaning;
- update acceptance tests;
- avoid rewriting historical outputs.

---

# 36. Dataset-schema compatibility

Curated datasets require:

```text
dataset_id
dataset_version
schema_version
effective_date
```

Breaking schema changes require:

- new schema version;
- consumer readiness;
- parallel publication where needed;
- rollback pointer;
- lineage preservation.

---

# 37. Provider-adapter compatibility

External provider changes must be isolated behind adapters.

Canonical contracts should not expose provider-specific field volatility.

Provider adapter must map:

```text
provider payload
    ↓
provider schema
    ↓
canonical schema
```

A provider change should not force public API change unless product semantics change.

---

# 38. Partner API compatibility

Future partners require:

- API key or OAuth scope;
- versioned documentation;
- sandbox;
- changelog;
- deprecation notice;
- usage telemetry;
- contract support period;
- rate-limit policy;
- support contact.

Partner contracts may require longer deprecation windows than internal clients.

---

# 39. Future MCP compatibility

Future MCP server contracts should version:

- tools;
- resources;
- prompts;
- schemas;
- capability metadata.

Breaking tool changes should create a new version rather than silently changing arguments.

Tool descriptions must remain semantically stable for the supported version.

---

# 40. Database compatibility

Database migrations should follow:

```text
expand
migrate
contract
```

Application releases must tolerate:

- old schema during rollout;
- new schema before all instances update;
- mixed service revisions during canary.

Do not assume all instances switch simultaneously.

---

# 41. Rolling-deployment compatibility

During Cloud Run rollout, old and new revisions may serve traffic.

Therefore:

- database schema must support both;
- events must remain parseable;
- cache keys must be versioned;
- internal API calls must be compatible;
- feature flags must not create incompatible mixed states.

---

# 42. Backward-compatible data writing

When both old and new clients are active:

- server may dual-write fields;
- server may derive old representation from new;
- conflicts need explicit precedence;
- provenance must be retained;
- dual write must have an end date.

---

# 43. Read repair

Read repair may be used to migrate records gradually.

Requirements:

- deterministic;
- idempotent;
- observable;
- bounded;
- not executed invisibly on sensitive records without audit where needed.

---

# 44. Contract registry

Maintain:

```text
contracts/registry.yaml
```

Suggested fields:

```text
contract_id
contract_type
major_version
current_version
status
owner
consumers
introduced_at
deprecated_at
sunset_at
documentation
schema_path
```

---

# 45. Supported-version matrix

Maintain a matrix:

| Surface | Supported versions |
|---|---|
| Public API | v1 |
| Internal AI API | v1 |
| Backend tools | v1 |
| Mobile contract | 1 |
| Event schemas | event specific |
| Agent output | agent specific |
| Calculation | versioned by result |

Update with every release.

---

# 46. Client capability discovery

Optional endpoint:

```text
GET /api/v1/capabilities
```

Potential response:

```json
{
  "api_version": "v1",
  "minimum_mobile_version": "1.3.0",
  "latest_mobile_version": "1.6.0",
  "features": {
    "prediction": true,
    "eoi_send": false
  }
}
```

Do not expose sensitive internal configuration.

---

# 47. Compatibility middleware

Backend middleware may:

- parse client headers;
- record client version;
- reject unsupported clients;
- attach deprecation headers;
- expose trace IDs;
- log deprecated usage.

Do not embed complex business compatibility logic only in middleware.

---

# 48. Compatibility testing

Required:

- old client against new backend;
- current client against old-compatible backend;
- mixed Cloud Run revisions;
- event v1 consumer with additive v1 update;
- deprecated endpoint adapter;
- unknown enum;
- missing optional field;
- extra response field;
- old mobile build;
- forced-upgrade response;
- provider schema change;
- agent-output migration.

---

# 49. Contract tests

Use:

- OpenAPI validation;
- JSON Schema;
- generated client tests;
- consumer-driven contracts where useful;
- event schema tests;
- fixture comparisons;
- compatibility diff tooling.

A breaking OpenAPI diff must fail CI unless explicitly approved as a new major version.

---

# 50. Golden fixtures

Maintain versioned fixtures for:

```text
property
portfolio
scenario
AI execution
recommendation
communication draft
event envelope
provider adapter
```

Fixtures must avoid real user data.

---

# 51. CI compatibility gates

CI should fail when:

- required field removed;
- type changed;
- enum narrowed;
- endpoint removed;
- error response changed incompatibly;
- event field removed;
- generated clients fail;
- old client fixture fails;
- unsupported migration introduced.

---

# 52. Release compatibility checklist

```text
[ ] Contract diff reviewed
[ ] Change classified as compatible or breaking
[ ] Mobile support window checked
[ ] Internal consumers identified
[ ] Event consumers verified
[ ] Deprecation documented
[ ] Usage telemetry added
[ ] Migration path tested
[ ] Rollback tested
[ ] Documentation updated
[ ] Release notes published
```

---

# 53. Breaking-change approval

A breaking change requires:

- architecture approval;
- product approval;
- mobile impact assessment;
- partner impact assessment;
- migration plan;
- deprecation plan;
- support plan;
- release timeline;
- rollback plan.

---

# 54. Emergency compatibility changes

Security or legal issues may require immediate breaking changes.

Process:

- declare incident or emergency change;
- minimise scope;
- provide safe error;
- notify affected users or partners;
- issue patched clients;
- document decision;
- complete post-change review.

Security must not be weakened to preserve compatibility.

---

# 55. API retirement

Before retirement:

- replacement is production ready;
- documentation exists;
- usage is zero or formally exempted;
- partners are notified;
- client support window has ended;
- telemetry confirms no active supported client;
- support is prepared;
- route returns controlled retirement response before final removal where appropriate.

---

# 56. Retirement response

During sunset:

```text
410 Gone
```

Example:

```json
{
  "error": {
    "code": "API_VERSION_RETIRED",
    "message": "This API version is no longer available.",
    "details": {
      "replacement": "/api/v2",
      "retired_at": "2027-08-01"
    }
  }
}
```

---

# 57. Documentation requirements

Maintain:

```text
docs/api/
├── versioning.md
├── compatibility.md
├── deprecations.md
├── migration-guides/
├── changelog.md
└── supported-versions.md
```

---

# 58. Release notes

Release notes must distinguish:

```text
added
changed
deprecated
removed
fixed
security
```

User-facing release notes and developer contract notes may differ.

---

# 59. Ownership

Suggested owners:

| Contract | Owner |
|---|---|
| Public backend API | Backend lead |
| Mobile contract | Frontend lead |
| Internal AI API | AI platform lead |
| Backend tools | Backend + AI leads |
| Events | Producer domain lead |
| Data schemas | Data platform lead |
| Partner API | Platform/product owner |
| MCP contracts | Platform owner |

---

# 60. Metrics

Track:

```text
requests_by_api_version
requests_by_client_version
deprecated_endpoint_calls
deprecated_field_usage
unsupported_client_requests
upgrade_required_count
event_version_usage
agent_output_version_usage
partner_version_usage
```

---

# 61. Alerts

Alert on:

- supported client receives incompatibility error;
- old API use after sunset warning;
- unknown event version;
- agent-output parse failure;
- provider schema break;
- sudden upgrade-required increase;
- deprecated usage not declining.

---

# 62. Codex rules

Codex must:

1. preserve supported public contracts;
2. classify every contract change;
3. use additive evolution where possible;
4. create a new major version for breaking changes;
5. update OpenAPI and schemas;
6. add compatibility tests;
7. support documented mobile versions;
8. add deprecation headers and telemetry;
9. version events, tools, agents, calculations, and datasets;
10. avoid exposing provider volatility;
11. use expand-and-contract migrations;
12. preserve mixed-revision compatibility;
13. document migration and retirement;
14. update the supported-version matrix;
15. report compatibility risk explicitly.

---

# 63. Definition of done

Versioning and compatibility readiness is complete when:

- versioned surfaces are documented;
- public and internal API versions exist;
- mobile support policy exists;
- minimum-version handling exists;
- deprecation process exists;
- usage telemetry exists;
- event and AI tool schemas are versioned;
- calculation and dataset versions are preserved;
- provider adapters isolate external change;
- CI detects breaking contract changes;
- old-client tests pass;
- retirement process is documented;
- every breaking change has an approved migration plan.

---

# 64. Final compatibility principle

For every TrackMyProps contract change, the team must answer:

```text
Is it backward compatible?
Which clients and consumers are affected?
How long must the old contract remain supported?
How will usage be measured?
How will clients migrate?
How can the change be rolled back?
When can the old version be removed safely?
```

If those questions cannot be answered, the change is not ready to release.
