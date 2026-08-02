# TrackMyProps Connections

## 1. Purpose

This document defines how TrackMyProps components communicate.

It records:

- caller and receiver;
- purpose;
- protocol;
- authentication;
- contract;
- timeout;
- retry;
- idempotency;
- failure behaviour;
- ownership;
- monitoring;
- data sensitivity.

This is the operational integration map for debugging, security review, implementation, and onboarding.

---

# 2. Connection principles

1. Frontend clients call the backend, not internal services.
2. Internal services authenticate with workload identity or approved service credentials.
3. Contracts are versioned.
4. Every network call has a timeout.
5. Retries apply only to retry-safe operations.
6. Consequential writes use idempotency.
7. External provider access is isolated behind adapters.
8. Secrets never travel to the frontend.
9. Sensitive payloads are minimised.
10. Every critical connection is monitored.
11. Failure behaviour is explicit.
12. Data-provider licence controls are enforced at consumption time.

---

# 3. High-level map

```text
Expo Mobile / Web
        │
        │ HTTPS + Supabase user JWT
        ▼
Backend API
   ├──────► Supabase Auth
   ├──────► Supabase PostgreSQL
   ├──────► Supabase Storage
   ├──────► Supabase Realtime
   ├──────► AI Platform
   ├──────► Email Provider
   ├──────► Notification Provider
   ├──────► Billing Provider
   ├──────► Maps / Geocoding
   └──────► Licensed Property Providers

AI Platform
   ├──────► Backend Internal Tools
   ├──────► Approved Model Providers
   └──────► AI-owned persistence and cache

Data Platform
   ├──────► Official Public Sources
   ├──────► Licensed Commercial Sources
   ├──────► Raw Storage
   ├──────► Staging / Canonical / Curated DB
   └──────► Backend Data Event Endpoint

Cloud Scheduler
   ├──────► Cloud Run Jobs
   └──────► Approved Authenticated Endpoints
```

---

# 4. Connection register

Each connection record should include:

```text
connection_id
caller
receiver
purpose
protocol
authentication
contract
timeout
retry
idempotency
rate_limit
failure_mode
owner
monitoring
data_classification
environment
```

---

# 5. Frontend to backend

## Connection ID

```text
CONN-FE-BE-001
```

## Purpose

All user-facing application operations.

## Protocol

```text
HTTPS
JSON
REST
```

## Authentication

```text
Authorization: Bearer <Supabase access token>
```

## Contract

```text
/api/v1
OpenAPI backend-v1
```

## Typical timeout

```text
10–30 seconds by endpoint
```

Long work returns `202 Accepted`.

## Retry

- safe GET requests may retry with backoff;
- consequential POST requests require idempotency;
- do not blindly retry communication send or billing operations.

## Failure behaviour

Frontend shows:

- offline;
- validation;
- permission denial;
- stale data;
- provider unavailable;
- retry.

## Owner

```text
Frontend Lead + Backend Lead
```

## Monitoring

- request count;
- p50, p95, p99 latency;
- HTTP status;
- client version;
- platform;
- trace ID.

---

# 6. Frontend to Supabase Auth

## Connection ID

```text
CONN-FE-AUTH-001
```

## Purpose

- sign-up;
- sign-in;
- OAuth;
- session refresh;
- logout.

## Authentication

Supabase public client configuration.

## Restrictions

Frontend may use only:

- public Supabase URL;
- anonymous key;
- user session tokens.

It must never use:

- service-role key;
- database credentials;
- admin Auth API.

## Failure behaviour

- expired session triggers refresh;
- failed refresh returns user to sign-in;
- logout clears local user-specific caches.

---

# 7. Frontend to Supabase Storage

Preferred flow:

```text
Frontend requests signed upload from Backend
    ↓
Backend validates access
    ↓
Frontend uploads using short-lived URL
    ↓
Frontend notifies Backend of completion
```

The frontend must not create arbitrary storage paths.

---

# 8. Frontend realtime connection

## Purpose

- AI progress;
- notifications;
- recommendation updates;
- selected portfolio refresh events.

## Authentication

User session with authorised channels or tables.

## Rules

- realtime payloads are minimal;
- the client re-fetches authoritative data after material events;
- RLS remains enforced;
- reconnect uses bounded backoff.

---

# 9. Backend to Supabase PostgreSQL

## Connection ID

```text
CONN-BE-DB-001
```

## Protocol

```text
PostgreSQL over TLS
```

## Authentication

Server-side database credential or approved pooled connection.

## Rules

- SQLAlchemy owns application data access;
- transactions remain short;
- queries are parameterised;
- connection pooling is configured for Cloud Run;
- RLS is preserved for user-context paths where designed;
- privileged paths require explicit service policy.

## Timeout

Set:

- connection timeout;
- statement timeout;
- transaction timeout.

## Monitoring

- connection usage;
- slow queries;
- locks;
- query errors;
- pool exhaustion;
- replication or backup status.

---

# 10. Backend to Supabase Auth

## Purpose

- validate token claims;
- administrative identity actions where explicitly approved;
- session and account operations.

## Authentication

Service credential restricted to backend.

## Rules

- validate issuer, audience, expiry, and user status;
- do not trust frontend-supplied roles;
- household roles come from backend data.

---

# 11. Backend to Supabase Storage

## Purpose

- signed upload URLs;
- signed download URLs;
- document deletion;
- metadata validation.

## Rules

- private buckets;
- generated paths;
- short-lived signed links;
- MIME and size controls;
- deletion cascades to derived artefacts;
- no permanent public URLs.

---

# 12. Backend to AI platform

## Connection ID

```text
CONN-BE-AI-001
```

## Purpose

- create AI execution;
- query execution;
- cancel execution;
- retrieve registry metadata.

## Protocol

```text
HTTPS
JSON
/internal/v1
```

## Authentication

Google service identity token with correct audience.

## Timeout

Initial execution request:

```text
5–15 seconds
```

Execution itself is asynchronous.

## Retry

Create execution requires idempotency.

Query operations may retry.

## Failure behaviour

- provider or AI failure must not corrupt domain records;
- execution moves to controlled failed or partial state;
- frontend receives safe status.

## Owner

```text
Backend Lead + AI Platform Lead
```

---

# 13. AI platform to backend tools

## Connection ID

```text
CONN-AI-TOOLS-001
```

## Purpose

Narrowly scoped access to:

- property context;
- portfolio context;
- deterministic calculations;
- curated data;
- recommendation persistence;
- communication-draft persistence.

## Protocol

```text
HTTPS
JSON
/internal/v1/tools
```

## Authentication

AI runtime service identity.

## Rules

There must be no:

```text
query_any_database
call_any_url
send_any_email
```

Every tool has:

- version;
- input schema;
- output schema;
- permission;
- timeout;
- audit rule.

---

# 14. AI platform to model providers

## Connection ID

```text
CONN-AI-MODEL-001
```

## Purpose

Language and embedding model inference.

## Authentication

Provider API key or workload identity stored in Secret Manager.

## Timeout

Agent-specific.

## Retry

- limited retry for rate limits and transient provider errors;
- no infinite retry;
- respect provider retry headers;
- no duplicate external side effects.

## Privacy controls

- minimise personal information;
- no secrets;
- no full unrelated documents;
- no general model training by default;
- document processing location and retention;
- approved provider only.

## Monitoring

- model;
- latency;
- tokens;
- estimated cost;
- retry;
- validation failure;
- provider error;
- cache hit.

---

# 15. AI platform persistence

The AI platform may persist only AI-owned records:

- execution state;
- checkpoint state;
- cache;
- agent memory;
- evaluation results;
- provider usage metadata.

It must not directly update domain financial records.

---

# 16. Data platform to official public sources

## Connection ID

```text
CONN-DATA-PUBLIC-001
```

Potential sources:

- ABS;
- RBA;
- data.gov.au;
- state and local open-data services;
- planning, crime, school, hazard, and infrastructure sources.

## Protocol

Source-specific:

```text
HTTPS API
CSV
JSON
SDMX
WFS
WMS
ArcGIS REST
bulk download
```

## Authentication

Often none or registration-specific.

## Rules

- verify dataset licence;
- identify original publisher;
- store publication date;
- use conditional requests where available;
- preserve raw artefact when permitted;
- avoid source overload.

---

# 17. Data platform to commercial property providers

## Connection ID

```text
CONN-DATA-COMMERCIAL-001
```

Candidate providers may include:

- Cotality;
- PropTrack;
- Domain;
- other approved specialists.

## Authentication

Provider-specific OAuth, API key, or feed credential.

## Rules

- contract must permit intended use;
- enforce request limits;
- store only permitted data;
- enforce retention and attribution;
- isolate provider schema behind adapter;
- monitor contract expiry;
- no subscription-screen scraping.

---

# 18. Data platform to raw storage

## Purpose

Store approved immutable source artefacts.

## Rules

- source/date/version partitioning;
- checksum;
- encryption;
- retention by source licence;
- restricted access;
- no user-facing direct access.

---

# 19. Data platform to staging, canonical, and curated data

Flow:

```text
Raw
 ↓
Staging
 ↓
Canonical
 ↓
Quality gate
 ↓
Curated
 ↓
Publication event
```

Rules:

- no direct raw-to-frontend path;
- canonical records retain provenance;
- curated datasets retain dataset version;
- failed quality gate blocks publication.

---

# 20. Data platform to backend data events

## Connection ID

```text
CONN-DATA-BE-001
```

## Purpose

Notify backend that approved datasets or partitions changed.

## Protocol

- Pub/Sub or approved authenticated endpoint;
- versioned event envelope.

## Retry

At-least-once delivery.

Backend consumers are idempotent.

## Events

Examples:

```text
dataset.published
dataset.partition_updated
dataset.stale
dataset.quality_degraded
```

---

# 21. Backend to email provider

## Connection ID

```text
CONN-BE-EMAIL-001
```

## Purpose

- account email;
- notifications;
- user-approved EOI and other communications.

## Authentication

Provider API key in Secret Manager.

## Safety rules

- non-production recipient allowlist or mail sink;
- EOI requires exact approval;
- send uses idempotency;
- recipient is backend validated;
- delivery webhooks require signature verification;
- full content is not logged.

## Failure behaviour

- transient failures may retry;
- permanent bounce does not retry indefinitely;
- duplicate send is prevented.

---

# 22. Email provider to backend webhook

## Connection ID

```text
CONN-EMAIL-WEBHOOK-001
```

## Purpose

Delivery, bounce, complaint, and failure status.

## Security

- verify signature;
- prevent replay;
- validate event schema;
- store provider event ID;
- process idempotently.

---

# 23. Backend to notification provider

## Purpose

Push notifications to registered devices.

## Rules

- minimise lock-screen content;
- respect quiet hours;
- remove invalid tokens;
- deduplicate;
- apply user preferences;
- do not expose sensitive property or financial details by default.

---

# 24. Backend to billing provider

## Connection ID

```text
CONN-BE-BILLING-001
```

## Purpose

- checkout;
- customer portal;
- subscription reconciliation;
- entitlements;
- usage where applicable.

## Rules

- sandbox outside production;
- backend is authoritative for entitlement state after verified provider events;
- webhook signatures are mandatory;
- duplicate events are safe;
- payment card data is not stored by TrackMyProps.

---

# 25. Billing provider to backend webhook

Events may include:

```text
subscription_created
subscription_updated
subscription_cancelled
payment_succeeded
payment_failed
```

The backend must store:

- provider event ID;
- processing status;
- idempotency result;
- trace.

---

# 26. Backend to maps and geocoding

## Purpose

- address suggestions;
- geocoding;
- routes and travel time;
- map display support.

## Rules

- provider terms govern caching;
- geocoder result is not authoritative title data;
- permanent storage is limited to allowed fields;
- provider keys are restricted;
- client-side keys have platform and API restrictions.

---

# 27. Backend to property-data provider

Use for on-demand:

- property match;
- property attributes;
- valuations;
- comparable sales;
- rental estimates;
- listing details.

Rules:

- provider adapter;
- timeout and circuit breaker;
- entitlement check;
- licence-aware response transformation;
- disclaimer propagation;
- approved caching period;
- export restrictions.

---

# 28. Cloud Scheduler to Cloud Run Jobs

## Connection ID

```text
CONN-SCHED-JOB-001
```

## Authentication

Google service identity.

## Rules

- approved job only;
- no plaintext secrets in schedule;
- retry and missed-run policy;
- owner and runbook;
- timezone documented;
- alert on repeated failure.

---

# 29. CI/CD to Google Cloud

## Purpose

- build images;
- push artifacts;
- deploy Cloud Run;
- update Jobs;
- apply approved infrastructure.

## Authentication

Workload identity federation is preferred.

## Restrictions

Deployment identity must not automatically receive:

- application database access;
- user-data access;
- all runtime secrets.

---

# 30. CI/CD to Supabase

## Purpose

- apply migrations;
- validate schema;
- deploy approved functions where used.

## Rules

- environment-specific credential;
- staging rehearsal;
- migration gate;
- no production migration from developer laptop by default;
- release record includes migration revision.

---

# 31. Observability connections

All services send approved telemetry to:

- Google Cloud Logging;
- Google Cloud Monitoring;
- tracing backend;
- error monitoring if approved.

Telemetry must include:

```text
service
environment
release
trace_id
request_id
status
duration
```

It must not include:

- access tokens;
- document content;
- EOI body;
- raw AI prompts by default;
- full property addresses in general analytics.

---

# 32. Event transport

Recommended pattern:

```text
Domain transaction
    ↓
PostgreSQL outbox
    ↓
Publisher
    ↓
Event transport
    ↓
Consumer inbox
```

Delivery:

```text
at least once
```

Consumers must be idempotent.

---

# 33. DNS and TLS

Connections exposed over the internet require:

- approved domain;
- TLS;
- certificate monitoring;
- secure DNS management;
- production/staging separation.

Potential domains:

```text
api.trackmyprops.com.au
app.trackmyprops.com.au
```

Final domains must be configured through infrastructure code.

---

# 34. Timeout guidance

Suggested starting values:

| Connection | Timeout |
|---|---:|
| Frontend read API | 10 s |
| Frontend write API | 15 s |
| Backend database statement | endpoint specific, generally <10 s |
| Backend to AI start | 15 s |
| Backend internal tool | 5–15 s |
| External property provider | 5–15 s |
| Email send request | 10 s |
| Model provider | agent specific, commonly 30–120 s |
| Scheduled source request | source specific |

Long work should be asynchronous rather than solved with very long HTTP timeouts.

---

# 35. Retry guidance

Retry only when:

- operation is idempotent;
- failure is transient;
- retry is bounded;
- backoff and jitter are used.

Do not automatically retry:

- an unprotected email send;
- payment creation;
- ownership change;
- destructive deletion;
- non-idempotent provider command.

---

# 36. Circuit breakers

Use for:

- AI providers;
- property providers;
- email provider;
- maps provider;
- billing provider.

Circuit state:

```text
closed
open
half_open
```

Degraded-mode behaviour must be documented.

---

# 37. Rate limits

Apply and monitor:

- frontend user requests;
- AI executions;
- provider requests;
- document analysis;
- communication sends;
- exports;
- webhooks;
- internal tools.

Rate-limit errors should include safe retry guidance.

---

# 38. Data-classification by connection

| Connection | Typical classification |
|---|---|
| Frontend ↔ Backend | Confidential / Restricted |
| Backend ↔ Database | Restricted |
| Backend ↔ AI | Confidential / Restricted, minimised |
| AI ↔ Model provider | Minimised confidential data |
| Data ↔ Public sources | Public / Internal |
| Data ↔ Commercial provider | Contract controlled |
| Backend ↔ Email | Restricted |
| Backend ↔ Billing | Confidential / Restricted |
| Observability | Internal, redacted |

---

# 39. Ownership matrix

| Connection area | Primary owner |
|---|---|
| Frontend API integration | Frontend Lead |
| Public API | Backend Lead |
| AI orchestration | AI Platform Lead |
| Internal AI tools | Backend + AI Leads |
| Database | Backend/Data owner by schema |
| Data sources | Data Platform Lead |
| Email and notifications | Backend Lead |
| Billing | Backend/Product Owner |
| Cloud IAM and networking | Platform/DevOps Owner |
| Observability | Platform Owner |
| Privacy review | Privacy Owner |
| Security review | Security Owner |

---

# 40. Failure escalation

Escalate when:

- critical connection is unavailable beyond SLO;
- cross-household data is exposed;
- provider schema changes;
- webhook verification fails repeatedly;
- AI provider sends invalid results at scale;
- billing reconciliation diverges;
- data publication is stale;
- queue lag exceeds threshold;
- credential is compromised.

Use `incident-response.md`.

---

# 41. Connection testing

Every connection requires relevant:

- authentication test;
- authorisation test;
- timeout test;
- retry test;
- schema test;
- idempotency test;
- degraded-mode test;
- monitoring test;
- environment-isolation test.

Use mocks and sandboxes in CI.

---

# 42. Connection documentation per integration

Maintain:

```text
docs/connections/<connection-id>.md
```

Each file should include:

```text
purpose
caller
receiver
contract
authentication
data
timeout
retry
idempotency
rate limits
failure behaviour
monitoring
owner
runbook
```

---

# 43. Codex rules

Codex must:

1. keep frontend-to-backend as the public application boundary;
2. authenticate all internal calls;
3. use versioned contracts;
4. configure timeouts;
5. add bounded retries only where safe;
6. add idempotency for consequential operations;
7. isolate providers behind adapters;
8. minimise sensitive payloads;
9. add metrics and trace propagation;
10. document new connections;
11. add integration tests;
12. enforce environment isolation;
13. never expose server secrets to clients;
14. respect provider licence rules;
15. fail closed for security-sensitive operations.

---

# 44. Definition of done

A connection is production ready when:

- purpose is defined;
- owner is assigned;
- protocol and authentication are defined;
- contract is versioned;
- data classification is known;
- timeout exists;
- retry and idempotency are correct;
- provider and privacy rules are handled;
- failure mode is defined;
- monitoring exists;
- runbook exists;
- tests pass.

---

# 45. Final connection principle

For every TrackMyProps connection, the platform must answer:

```text
Who is calling whom?
Why is the connection needed?
How is the caller authenticated?
What data crosses the boundary?
Which contract applies?
What are the timeout and retry rules?
What happens when it fails?
Who owns and monitors it?
```

If those questions cannot be answered, the connection is not ready for production.
