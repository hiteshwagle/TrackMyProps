# TrackMyProps Architecture

## 1. Purpose

This document defines the target architecture for TrackMyProps, an AI-first property investment operating system.

TrackMyProps is composed of four independently deployable projects:

```text
TrackMyProps/
├── frontend/
├── backend/
├── ai-platform/
└── data-platform/
```

The architecture must support:

- property portfolio management;
- property, loan, income, expense, lease, valuation, and document tracking;
- suburb and market intelligence;
- property discovery and listing monitoring;
- specialist AI agents;
- portfolio performance analysis;
- sell, hold, refinance, and debt-repayment scenarios;
- user education and property-management guidance;
- AI-generated communication drafts;
- scheduled data ingestion and enrichment;
- event-driven recommendations and alerts;
- secure, auditable, and explainable workflows.

---

## 2. Architectural principles

1. **The backend is the system of record.**
2. **The frontend contains presentation and interaction logic, not authoritative business logic.**
3. **The AI platform reasons over trusted data but does not own core financial records.**
4. **The data platform ingests and publishes datasets but does not generate final investment recommendations.**
5. **All consequential actions require explicit user control.**
6. **All services are independently deployable.**
7. **All external dependencies are accessed through explicit adapters.**
8. **Every important calculation, recommendation, and data point must be traceable.**
9. **Caching is configurable per agent and dependency.**
10. **Secrets are never stored in source code.**
11. **The platform is provider-independent wherever practical.**
12. **Historical records are preserved rather than silently overwritten.**
13. **Every service emits structured logs and trace IDs.**
14. **All APIs and events are versioned.**
15. **Security and privacy are designed in from the beginning.**

---

## 3. High-level architecture

```text
                           ┌───────────────────────────────┐
                           │          End User             │
                           │ iOS / Android / Web via Expo  │
                           └───────────────┬───────────────┘
                                           │ HTTPS
                                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         Frontend Project                             │
│ Expo React Native + JavaScript + Expo Router                        │
│ Zustand + TanStack Query + React Hook Form                          │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                                │ Supabase Auth JWT
                                │ REST / Realtime / Storage
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                          Backend Project                             │
│ FastAPI + SQLAlchemy + Alembic                                      │
│ System of record, APIs, rules, calculations, approvals, audit       │
└───────────────┬───────────────────┬───────────────────┬──────────────┘
                │                   │                   │
                │ Internal API      │ Events            │ SQL / Storage
                ▼                   ▼                   ▼
┌───────────────────────┐  ┌───────────────────┐  ┌────────────────────┐
│ AI Platform Project   │  │ Data Platform     │  │ Supabase           │
│ FastAPI + LangGraph   │  │ Cloud Run Jobs    │  │ PostgreSQL         │
│ Specialist agents    │  │ ETL + quality     │  │ Auth + Storage     │
│ Tools + prompts       │  │ Lineage + history │  │ Realtime           │
└───────────┬───────────┘  └──────────┬────────┘  └────────────────────┘
            │                         │
            │ Model APIs              │ Public / licensed sources
            ▼                         ▼
┌───────────────────────┐  ┌───────────────────────────────────────────┐
│ OpenAI / Anthropic    │  │ ABS / RBA / state open data / partners   │
│ Gemini / Bedrock      │  │ schools / crime / planning / hazards     │
│ Embeddings / OCR      │  │ property market and rental providers     │
└───────────────────────┘  └───────────────────────────────────────────┘
```

---

## 4. Project responsibilities

## 4.1 Frontend

The frontend owns:

- user interface;
- navigation;
- authentication session handling;
- forms and client-side validation;
- local UI state;
- server-state caching;
- optimistic updates where safe;
- offline notes and inspection drafts;
- progress displays for asynchronous jobs;
- draft review and approval screens;
- portfolio dashboards;
- charts and comparisons;
- property and suburb exploration;
- AI chat and learning experiences;
- notification preferences;
- accessibility and responsive behaviour.

The frontend must not own:

- authoritative financial calculations;
- user authorisation rules;
- AI prompt logic;
- data ingestion;
- email delivery;
- investment recommendation persistence;
- cache invalidation rules for AI agents;
- database credentials;
- service-role secrets.

---

## 4.2 Backend

The backend is the system of record.

The backend owns:

- user and household records;
- authentication verification;
- permissions and role checks;
- properties and ownership structures;
- loans and repayments;
- income and expenses;
- leases and tenants where applicable;
- valuations;
- documents and metadata;
- financial calculations;
- portfolio metrics;
- scenario calculations;
- subscriptions and entitlements;
- AI execution requests;
- recommendation persistence;
- user decisions;
- approvals;
- email sending;
- notifications;
- audit logs;
- feature flags;
- usage limits;
- idempotency;
- webhooks;
- API contracts.

The backend must not:

- embed vendor-specific AI logic throughout business services;
- scrape third-party websites;
- maintain raw public datasets;
- allow the frontend to access service-role credentials;
- send AI-generated communication without user approval.

---

## 4.3 AI platform

The AI platform owns:

- agent registry;
- prompt registry;
- model routing;
- LangGraph workflows;
- specialist-agent execution;
- context assembly;
- tool orchestration;
- recommendation synthesis;
- evidence packaging;
- confidence assessment;
- AI-specific memory;
- per-agent cache policy;
- execution checkpoints;
- model fallback;
- AI evaluations;
- token and cost tracking;
- AI observability.

The AI platform must not:

- bypass backend permissions;
- modify authoritative property or financial records directly;
- perform unverified financial arithmetic through an LLM;
- send email directly;
- approve an expression of interest;
- use unrestricted SQL or arbitrary HTTP tools;
- trust document or listing text as instructions.

---

## 4.4 Data platform

The data platform owns:

- source registry;
- licence registry;
- scheduled ingestion;
- authorised scraping where permitted;
- raw source artefacts;
- canonical schemas;
- transformations;
- historical snapshots;
- geospatial processing;
- entity matching;
- data quality;
- anomaly detection;
- lineage;
- curated datasets;
- prediction feature tables;
- dataset publishing;
- freshness metadata;
- downstream invalidation events.

The data platform must not:

- contain user-facing portfolio logic;
- make final recommendations;
- access user financial data unless explicitly approved;
- use undocumented or prohibited source access methods;
- publish data that fails critical quality rules.

---

## 5. Deployment topology

## 5.1 Frontend deployment

```text
Expo Application Services
├── iOS build
├── Android build
└── Web build
```

Recommended:

- Expo EAS Build;
- Expo EAS Submit;
- Expo Updates where appropriate;
- environment-specific app configuration;
- separate development, staging, and production builds.

---

## 5.2 Backend deployment

```text
Google Cloud Run
└── trackmyprops-backend
```

Recommended:

- containerised FastAPI service;
- HTTPS only;
- managed service account;
- Secret Manager;
- Cloud Logging;
- Cloud Monitoring;
- scale to zero where acceptable;
- minimum instances only when latency justifies the cost.

---

## 5.3 AI platform deployment

```text
Google Cloud Run
└── trackmyprops-ai-platform
```

Recommended:

- separate Cloud Run service from backend;
- asynchronous execution model;
- PostgreSQL-backed LangGraph checkpoints;
- provider keys in Secret Manager;
- independent scaling from backend;
- explicit service-to-service authentication.

---

## 5.4 Data platform deployment

```text
Google Cloud Run Jobs
├── trackmyprops-data-refresh
├── trackmyprops-data-backfill
├── trackmyprops-data-verify
└── trackmyprops-data-reconcile
```

Triggered by:

```text
Google Cloud Scheduler
```

Recommended:

- one image with explicit job commands;
- separate job definitions by workload class;
- controlled task parallelism;
- source-specific schedules;
- dedicated service account;
- raw and processed storage buckets.

---

## 5.5 Core managed services

```text
Supabase
├── PostgreSQL
├── Auth
├── Storage
└── Realtime
```

Google Cloud:

```text
Google Cloud
├── Cloud Run
├── Cloud Run Jobs
├── Cloud Scheduler
├── Artifact Registry
├── Secret Manager
├── Cloud Logging
├── Cloud Monitoring
└── Cloud Build or GitHub Actions
```

---

## 6. Environment model

Maintain separate environments:

```text
local
development
staging
production
```

Each environment must have separate:

- Supabase project or isolated schema strategy;
- Google Cloud project or strongly isolated resources;
- service accounts;
- Secret Manager secrets;
- storage buckets;
- API keys;
- OAuth credentials;
- model-provider budgets;
- email sending configuration;
- notification credentials;
- domain names;
- monitoring alerts.

Production data must never be copied into development without de-identification and approval.

---

## 7. Data ownership matrix

| Domain | Owner |
|---|---|
| User identity | Supabase Auth / Backend |
| User profile | Backend |
| Household | Backend |
| Property record | Backend |
| Ownership | Backend |
| Loan | Backend |
| Income | Backend |
| Expense | Backend |
| Lease | Backend |
| Valuation history | Backend |
| Portfolio calculations | Backend |
| Scenario calculations | Backend |
| Recommendation | Backend |
| User decision | Backend |
| Approval | Backend |
| Outbound email | Backend |
| AI execution state | AI platform |
| AI checkpoints | AI platform |
| AI prompt versions | AI platform |
| AI agent versions | AI platform |
| AI cache entries | AI platform |
| Raw public or licensed data | Data platform |
| Canonical market datasets | Data platform |
| Curated suburb metrics | Data platform |
| Data quality and lineage | Data platform |
| UI local state | Frontend |
| Server cache in client | Frontend |

No table or concept should be independently owned by two services.

---

## 8. Database boundaries

Recommended PostgreSQL schemas:

```text
auth
public
backend
ai
data_registry
raw_metadata
staging
canonical
curated
quality
lineage
operations
audit
```

Recommended ownership:

```text
backend schema       → backend service
ai schema            → AI platform
canonical/curated    → data platform
raw/staging          → data platform only
audit                → backend with controlled append access
```

The frontend must not query staging, raw, AI checkpoint, or internal audit tables directly.

Use row-level security where direct Supabase client access is allowed.

Prefer backend APIs for complex or sensitive operations.

---

## 9. Authentication and authorisation

## 9.1 User authentication

Use Supabase Auth.

Supported methods may include:

- email and password;
- magic link;
- Google;
- Apple.

Frontend receives a user JWT.

Backend validates:

- issuer;
- audience;
- signature;
- expiry;
- subject;
- required claims.

---

## 9.2 Service-to-service authentication

Use Google service identities or signed service tokens.

Flows:

```text
Backend → AI platform
Backend → Data event endpoint
Data platform → Backend
AI platform → Backend internal tools
```

Each service must validate:

- service identity;
- audience;
- expiry;
- allowed scope;
- request trace;
- replay-sensitive headers where required.

Do not share one universal service credential across all projects.

---

## 9.3 Authorisation

The backend must enforce:

- user ownership;
- household membership;
- subscription tier;
- role;
- resource scope;
- action permission;
- feature entitlement;
- approval status.

The AI platform must receive only the context the user is authorised to access.

---

## 10. Communication patterns

Use three main patterns.

## 10.1 Synchronous request-response

Use for:

- CRUD;
- quick calculations;
- retrieving dashboards;
- fetching property details;
- retrieving AI execution status;
- validating a draft;
- retrieving datasets.

Example:

```text
Frontend → Backend → Database → Backend → Frontend
```

---

## 10.2 Asynchronous job execution

Use for:

- property analysis;
- portfolio review;
- scenario synthesis;
- report generation;
- document analysis;
- daily briefing;
- large AI workflows.

Example:

```text
Frontend
   ↓
Backend creates execution
   ↓
AI platform runs graph
   ↓
AI platform emits progress
   ↓
Backend stores result
   ↓
Frontend receives completion
```

---

## 10.3 Event-driven updates

Use for:

- dataset refresh;
- cache invalidation;
- recommendation triggers;
- loan changes;
- valuation changes;
- new listings;
- lease milestones;
- rate changes;
- portfolio risk thresholds.

Event structure:

```json
{
  "event_id": "uuid",
  "event_type": "dataset.published",
  "event_version": "1.0",
  "occurred_at": "ISO-8601",
  "producer": "data-platform",
  "trace_id": "uuid",
  "payload": {}
}
```

Events must be idempotent and versioned.

---

## 11. Core workflow: add and manage a property

```text
User enters property
        ↓
Frontend validates form
        ↓
Backend verifies user and household
        ↓
Backend creates property
        ↓
Backend creates ownership record
        ↓
User adds loan, expenses, income, lease, valuation
        ↓
Backend recalculates portfolio metrics
        ↓
Backend publishes property.updated event
        ↓
AI caches depending on property version are invalidated
        ↓
Frontend refreshes dashboard
```

Key rules:

- calculations run in backend;
- each change increments a relevant version or fingerprint;
- important changes are audited;
- historical values are preserved;
- AI recommendations are regenerated only according to policy.

---

## 12. Core workflow: property analysis

```text
User requests property analysis
        ↓
Backend verifies entitlement
        ↓
Backend creates AI execution
        ↓
AI platform loads approved property context
        ↓
AI platform retrieves current market and suburb data
        ↓
Specialist agents run
        ↓
Property Analysis Agent synthesises result
        ↓
Confidence and evidence are validated
        ↓
Backend stores recommendation
        ↓
Frontend displays result
```

Property analysis final synthesis should always execute.

Underlying data tools may use their own source-level caches.

---

## 13. Core workflow: prediction agent

```text
User requests prediction
        ↓
Backend creates AI execution
        ↓
AI platform computes cache key
        ↓
Cache younger than six hours?
       ├── Yes → return cached result
       └── No  → run prediction workflow
                     ↓
                 validate output
                     ↓
                  save cache
                     ↓
                  return result
```

Invalidate earlier when:

- prediction feature version changes;
- property facts change;
- model version changes;
- prompt version changes;
- market dataset changes materially.

---

## 14. Core workflow: portfolio performance

```text
Portfolio data changes
        ↓
Backend recalculates authoritative metrics
        ↓
Backend emits portfolio.updated
        ↓
AI platform invalidates portfolio-dependent results
        ↓
Portfolio Performance Agent runs on demand or schedule
        ↓
Compare:
  - property versus suburb
  - property versus portfolio
  - portfolio versus user strategy
        ↓
Backend stores recommendations
        ↓
Frontend shows:
  - outperformers
  - underperformers
  - risk concentrations
  - suggested reviews
```

The AI platform explains performance. The backend supplies the calculations.

---

## 15. Core workflow: sell property to repay another loan

```text
User selects property to sell
        ↓
User selects target loan or repayment strategy
        ↓
Frontend captures assumptions
        ↓
Backend calculates:
  - estimated sale proceeds
  - selling costs
  - debt discharge
  - tax placeholders or supplied values
  - remaining cash
  - target loan reduction
  - revised repayments
  - revised cash flow
  - revised LVR
        ↓
AI platform compares scenarios
        ↓
Frontend displays assumptions and alternatives
        ↓
User may save scenario
```

The AI must not invent tax, sale price, or loan values.

---

## 16. Core workflow: expression of interest

```text
New listing matches criteria
        ↓
Backend creates opportunity
        ↓
User opens opportunity
        ↓
User requests EOI draft
        ↓
Backend sends approved context to AI platform
        ↓
EOI Agent generates structured draft
        ↓
Backend stores draft as awaiting review
        ↓
Frontend displays editable content
        ↓
User edits and confirms recipient
        ↓
User explicitly approves send
        ↓
Backend sends email
        ↓
Backend records final content and audit event
```

Initial release must not automatically send an EOI without review.

---

## 17. Core workflow: learning agent

```text
User selects learning goal
        ↓
Backend loads learning profile
        ↓
AI tutor creates lesson
        ↓
Frontend displays lesson and examples
        ↓
User completes quiz
        ↓
Backend stores progress
        ↓
AI tutor adapts next lesson
```

Tutor content should distinguish:

- general education;
- current law or policy;
- illustrative examples;
- personal scenario;
- professional advice boundary.

---

## 18. Core workflow: daily CIO briefing

```text
Scheduled trigger or meaningful events
        ↓
Backend identifies eligible users
        ↓
AI platform retrieves:
  - recent portfolio changes
  - market changes
  - listing matches
  - loan milestones
  - lease milestones
  - risk alerts
        ↓
Specialist agents provide updates
        ↓
CIO Agent prioritises material items
        ↓
Backend stores briefing
        ↓
Frontend and notification service deliver summary
```

Deduplicate repeated recommendations.

Avoid notifying when nothing material changed.

---

## 19. AI agent registry

Each agent must have:

- stable ID;
- version;
- input schema;
- output schema;
- allowed tools;
- model policy;
- cache policy;
- timeout;
- retries;
- prompt ID;
- prompt version;
- evaluation suite;
- safety classification.

Example:

```text
agent_id: prediction
version: 1.0.0
execution: cache_until_ttl
ttl: 21600 seconds
dependencies:
  - property_version
  - market_dataset_version
  - prediction_feature_version
  - prompt_version
  - model_policy_version
```

---

## 20. Cache architecture

Use multiple cache layers.

### Frontend cache

TanStack Query caches backend responses.

Purpose:

- avoid repeated API calls;
- support refetching;
- support stale and loading states.

### Backend cache

Optional for:

- stable reference data;
- rate-limited external responses;
- expensive dashboard queries.

### AI cache

Per-agent, dependency-aware.

### Data cache

Raw artefact reuse and unchanged-source detection.

Never treat all caches as one shared mechanism.

---

## 21. Versioning strategy

Version:

- APIs;
- events;
- agents;
- prompts;
- output schemas;
- calculation engine;
- datasets;
- pipelines;
- model policies;
- cache key strategy;
- document parsers;
- geospatial boundaries.

Recommended:

```text
API: /api/v1
Event: event_version 1.0
Agent: semantic version
Prompt: semantic version
Dataset: publication version
Schema: major.minor
```

Every recommendation should record relevant versions.

---

## 22. Financial calculation architecture

All authoritative calculations live in backend services.

Potential modules:

```text
backend/app/domain/calculations/
├── cash_flow.py
├── yield.py
├── lvr.py
├── equity.py
├── loan_repayment.py
├── amortisation.py
├── sale_proceeds.py
├── portfolio_metrics.py
├── scenario.py
└── assumptions.py
```

Calculations must:

- use Decimal for money where appropriate;
- document formulas;
- support effective dates;
- include assumptions;
- be unit tested;
- record calculation-engine version.

The AI platform consumes results and explains them.

---

## 23. Data freshness architecture

Every data response should expose:

- observed date;
- published date;
- ingested date;
- dataset version;
- freshness status;
- quality score;
- source.

Example:

```json
{
  "value": 850000,
  "effective_date": "2026-07-01",
  "published_at": "2026-07-15T00:00:00Z",
  "ingested_at": "2026-07-15T02:10:00Z",
  "dataset_version": "2026.07.15",
  "freshness": "current",
  "quality_score": 0.94
}
```

---

## 24. Recommendation model

A recommendation should contain:

```text
recommendation_id
recommendation_type
subject_type
subject_id
summary
priority
confidence
evidence
assumptions
risks
alternatives
suggested_actions
data_freshness
agent_version
prompt_version
model_metadata
created_at
expires_at
status
user_decision
```

Statuses:

```text
new
viewed
acknowledged
dismissed
saved
actioned
expired
superseded
```

---

## 25. Document architecture

Documents are stored in Supabase Storage or approved object storage.

Backend owns:

- metadata;
- user access;
- document type;
- property association;
- upload status;
- retention;
- deletion;
- processing status.

AI platform may receive:

- authorised signed URL;
- extracted text;
- selected excerpts;
- document ID;
- page references.

Do not expose permanent unrestricted URLs.

---

## 26. Realtime and progress updates

Use Supabase Realtime or backend event streams for:

- AI execution progress;
- report completion;
- recommendation created;
- portfolio recalculated;
- draft ready;
- notification status.

Frontend should display meaningful progress:

```text
Loading property facts
Retrieving current suburb data
Calculating cash flow
Running risk analysis
Generating final recommendation
```

Do not expose private chain-of-thought.

---

## 27. Notifications

Notification channels may include:

- in-app;
- push;
- email;
- optional SMS later.

Notification triggers:

- report ready;
- new listing match;
- loan milestone;
- fixed-rate expiry;
- rent review;
- lease expiry;
- cash-flow deterioration;
- valuation change;
- portfolio risk;
- suburb trend change;
- EOI response;
- learning reminder.

Backend owns notification preferences and delivery eligibility.

---

## 28. Security architecture

Required controls:

- HTTPS everywhere;
- JWT validation;
- service identity validation;
- least privilege;
- row-level security where applicable;
- encrypted secrets;
- signed storage URLs;
- audit logging;
- rate limiting;
- request size limits;
- document type validation;
- malware scanning when implemented;
- prompt injection protections;
- tool allowlists;
- SQL injection protections;
- dependency scanning;
- secret scanning;
- environment separation.

Never place service-role keys in the frontend.

---

## 29. Privacy architecture

TrackMyProps may store sensitive financial and property information.

Required:

- data minimisation;
- explicit consent;
- user-access controls;
- household separation;
- retention policy;
- export capability;
- correction capability;
- deletion workflow;
- auditability;
- de-identification for analytics;
- no cross-user AI memory leakage;
- no global caching of user-specific output.

---

## 30. Observability

Use a shared trace ID across services.

Example:

```text
Frontend request ID
   ↓
Backend trace ID
   ↓
AI execution ID
   ↓
Tool call trace
   ↓
Data source job reference
```

Track:

- request latency;
- error rate;
- AI token usage;
- AI cost;
- cache hits;
- database duration;
- job duration;
- dataset quality;
- event delivery;
- notification success;
- EOI send status.

Do not log secrets or unnecessary personal information.

---

## 31. Resilience

Implement:

- retries with backoff;
- circuit breakers where justified;
- idempotency keys;
- job locks;
- checkpoints;
- timeouts;
- cancellation;
- fallback providers;
- atomic publication;
- dead-letter tracking;
- partial-result policies;
- rollback.

Critical calculation or permission failures stop the workflow.

Non-critical AI specialist failures may allow partial completion only when clearly disclosed.

---

## 32. CI/CD architecture

Each project has an independent pipeline.

### Frontend

```text
lint
test
build
preview
release
```

### Backend

```text
lint
type-check
test
migration-check
Docker build
deploy staging
smoke test
deploy production
```

### AI platform

```text
lint
type-check
unit tests
graph tests
evaluation tests
Docker build
deploy staging
smoke tests
deploy production
```

### Data platform

```text
lint
type-check
unit tests
contract tests
migration-check
Docker build
deploy jobs
run sample verification
```

Production deployment should require protected branches and approval.

---

## 33. Repository strategy

The initial recommended structure is one parent folder containing four repositories or deployable projects:

```text
TrackMyProps/
├── frontend/
├── backend/
├── ai-platform/
└── data-platform/
```

Shared contracts may live in:

```text
TrackMyProps/contracts/
```

Potential shared assets:

```text
contracts/
├── openapi/
├── events/
├── json-schema/
├── enums/
└── examples/
```

Do not share runtime business logic through uncontrolled copy-paste.

Use generated clients where practical.

---

## 34. API conventions

Use:

- REST initially;
- JSON;
- ISO-8601 timestamps;
- UUID identifiers;
- explicit pagination;
- consistent error structure;
- idempotency headers for relevant writes;
- request IDs;
- versioned routes.

Example error:

```json
{
  "error": {
    "code": "PROPERTY_NOT_FOUND",
    "message": "The requested property could not be found.",
    "details": {},
    "trace_id": "uuid"
  }
}
```

---

## 35. Event conventions

Events must be:

- immutable;
- versioned;
- idempotent;
- traceable;
- minimal;
- free of unnecessary sensitive information.

Suggested events:

```text
property.created
property.updated
loan.updated
lease.updated
valuation.updated
portfolio.recalculated
recommendation.created
recommendation.superseded
ai.execution.completed
ai.execution.failed
dataset.published
dataset.stale
listing.matched
eoi.draft.created
eoi.sent
```

---

## 36. Feature flags

Use feature flags for:

- beta agents;
- new model routing;
- new prediction engine;
- new portfolio score;
- automatic listing analysis;
- new data providers;
- learning features;
- new email workflows.

Feature flags must not bypass security, approval, or entitlement checks.

---

## 37. Initial implementation order

### Phase 1 — Platform foundation

- create four projects;
- configure environments;
- configure Supabase;
- configure Google Cloud;
- establish CI/CD;
- establish contracts;
- establish observability.

### Phase 2 — Portfolio core

- users and households;
- properties;
- ownership;
- loans;
- expenses;
- income;
- leases;
- valuations;
- dashboard calculations.

### Phase 3 — Data foundation

- RBA;
- ABS;
- geography;
- schools;
- crime;
- infrastructure;
- approved market datasets.

### Phase 4 — AI foundation

- agent registry;
- model adapter;
- tool registry;
- cache policies;
- execution service;
- checkpoints;
- Demographics Agent;
- Suburb Agent;
- Finance Agent;
- Property Analysis Agent.

### Phase 5 — Portfolio intelligence

- portfolio performance;
- underperformance analysis;
- sell/hold/refinance scenarios;
- debt-repayment scenarios;
- CIO briefing.

### Phase 6 — Discovery and communications

- listing watch;
- matching;
- negotiation drafts;
- EOI draft and approval workflow;
- response tracking.

### Phase 7 — Learning

- property investment tutor;
- property management tutor;
- learning profile;
- quizzes and progress.

### Phase 8 — Hardening

- evaluation;
- security review;
- performance testing;
- cost optimisation;
- incident runbooks;
- production rollout.

---

## 38. Required setup outputs

Each project must generate:

```text
.env.example
SETUP.md
README.md
```

The parent project must generate:

```text
ARCHITECTURE.md
DEPLOYMENT.md
DATABASE.md
SECURITY.md
ROADMAP.md
CONTRACTS.md
```

The final setup documentation must list:

- Supabase project URL;
- Supabase anon key;
- Supabase service-role key;
- PostgreSQL connection string;
- storage bucket names;
- Google Cloud project ID;
- Google Cloud region;
- Cloud Run service names;
- Cloud Run Job names;
- service account emails;
- Artifact Registry repository;
- Secret Manager secret names;
- OAuth credentials;
- model-provider keys;
- email-provider keys;
- notification credentials;
- maps and geocoding keys;
- licensed data-provider credentials;
- monitoring endpoints;
- domain names;
- callback URLs;
- redirect URLs;
- webhook secrets;
- feature flags;
- per-environment values.

No real secrets should be committed.

---

## 39. Architecture definition of done

The architecture is implemented correctly when:

- all four projects can run independently;
- service boundaries are respected;
- backend is the system of record;
- frontend contains no service secrets;
- AI tools are allowlisted;
- data ingestion is source-governed;
- all APIs and events are versioned;
- user-specific data is isolated;
- recommendations are traceable;
- financial calculations are deterministic;
- communication drafts require approval;
- per-agent caching works;
- dataset updates invalidate relevant AI caches;
- historical records are preserved;
- every service emits trace IDs;
- CI/CD exists for each project;
- setup documentation contains every required variable;
- production and staging are isolated;
- no critical security boundary is undocumented.

---

## 40. Final target

TrackMyProps should operate as a coordinated system:

```text
Data platform gathers trusted facts.
Backend owns users, properties, money, rules, and approvals.
AI platform interprets facts and produces explainable guidance.
Frontend gives the user control over every decision.
```

The platform should feel like an intelligent property investment partner while remaining transparent, auditable, secure, and user-controlled.
