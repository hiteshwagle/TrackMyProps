# TrackMyProps Implementation Findings

**Status:** Documentation audit complete  
**Audit date:** 2 August 2026  
**Implementation state observed:** Documentation only; no application scaffold was present in the workspace at the time of review.

## 1. Purpose

This document records the findings from the pre-implementation review of TrackMyProps. It summarises the intended architecture, identifies conflicts and unsupported assumptions, defines the minimum safe scaffold, and lists decisions and controls that must be resolved before product feature development.

This review does not approve a commercial provider, production environment, credential, legal position, or product integration. It does not implement product business logic.

## 2. Audit basis and document authority

The review used the following working order when a temporary disposition was required:

1. the current task constraints and `AGENTS.md`;
2. accepted decisions in `decision-log.md`;
3. master architecture, security, privacy, contract, and roadmap documents;
4. detailed subsystem documents and project-specific skill files;
5. examples, suggested values, and future-facing guidance.

This order is only a safe implementation aid. It does not silently supersede conflicting documentation. Every material conflict remains recorded below and should be corrected or resolved through an ADR before the affected implementation begins.

## 3. Documents read

All 44 Markdown files present in `markdown files/` were reviewed.

### 3.1 Mandated primary set

1. `README.md`
2. `architecture.md`
3. `connections.md`
4. `coding-standards.md`
5. `database.md`
6. `contracts.md`
7. `api-design.md`
8. `security.md`
9. `privacy-and-retention.md`
10. `testing-strategy.md`
11. `deployment-and-devops.md`
12. `PROJECT_ROADMAP.md`
13. `feature-specifications.md`
14. `permissions-matrix.md`
15. `calculation-specification.md`
16. `frontend_SKILL.md`
17. `backend_SKILL.md`
18. `ai-platform_SKILL.md`
19. `data-platform_SKILL.md`

### 3.2 Cross-check set

1. `SETUP.md`
2. `SKILL.md`
3. `agent-catalogue.md`
4. `ai-governance.md`
5. `ai-guidelines.md`
6. `api-versioning-and-backward-compatibility.md`
7. `business-continuity.md`
8. `cost-optimization.md`
9. `data-dictionary.md`
10. `data-sources.md`
11. `database-migration-playbook.md`
12. `decision-log.md`
13. `deployment.md`
14. `disaster-recovery.md`
15. `environment-variables.md`
16. `event-catalogue.md`
17. `incident-response.md`
18. `observability.md`
19. `performance-and-scalability.md`
20. `production-readiness.md`
21. `release-checklist.md`
22. `roadmap.md`
23. `runbooks.md`
24. `support-operations.md`
25. `user-journeys.md`

`AGENTS.md` was also read as the repository-level execution policy.

## 4. Current repository state

At the time of review, the workspace contained `AGENTS.md`, the 44 Markdown documents, editor metadata, and a local Python virtual environment. The expected application directories, root package manifests, GitHub workflows, Supabase structure, and Terraform structure were not present. The directory was not a Git worktree, so no commit history or tracked-file status was available as audit evidence.

No visible Supabase temporary-secret directory was inspected. If local Supabase tooling later creates `.temp`, `.branches`, generated secrets, or local credential files, those paths must be ignored and excluded from source control. Secret values must never be copied into findings, examples, logs, screenshots, or handover documents.

## 5. Intended architecture

### 5.1 Repository and deployment model

TrackMyProps is intended to be one monorepo containing four independently deployable application projects:

```text
frontend
backend
ai-platform
data-platform
```

Shared contracts, Supabase migrations, infrastructure, scripts, cross-project tests, and CI/CD remain in the same repository. Independent deployability is a service boundary, not a requirement for separate Git repositories.

### 5.2 Frontend

The frontend is an Expo React Native application for mobile and web. It owns presentation, navigation, forms, accessibility, local UI state, server-state caching, upload orchestration, and approved realtime subscriptions.

It may authenticate through approved Supabase client capabilities and call the public backend API. It must not make authoritative financial calculations, decide permissions, call the AI platform directly, access raw or internal schemas, hold service-role or provider credentials, or send external communications directly.

### 5.3 Backend

The Python FastAPI backend is the authoritative business layer. It owns authentication validation, household authorisation, domain records, deterministic financial calculations, scenarios, approvals, entitlements, audit events, notifications, external communication sending, exports, and deletion workflows.

Public APIs use `/api/v1`. Internal tools use narrowly scoped `/internal/v1` routes. Route handlers should remain thin; business rules belong in small typed functions or focused services, with explicit transactions and SQLAlchemy 2 persistence.

### 5.4 AI platform

The Python FastAPI and LangGraph AI platform owns agent execution, graphs, prompts, model adapters, structured-output validation, checkpoints, AI caches, memory, evaluations, and model cost tracking.

It must operate through narrowly scoped backend tools. It must not mutate property or financial records directly, send email, charge users, change permissions, delete user data, execute arbitrary SQL, or call arbitrary URLs. Deterministic calculations remain backend-owned.

### 5.5 Data platform

The Python data platform runs bounded ingestion and publication jobs on Cloud Run Jobs and Cloud Scheduler. It owns source and licence registries, raw artefacts, staging, canonical and curated datasets, quality gates, lineage, freshness, and publication events.

Only approved official, public, partner, or contractually licensed sources may be used. Raw or staging provider payloads must not flow directly to frontend or AI consumers.

### 5.6 Managed services and infrastructure

The target managed-service set is:

- Supabase PostgreSQL, Auth, Storage, and Realtime;
- Google Cloud Run and Cloud Run Jobs;
- Cloud Scheduler;
- Artifact Registry;
- Secret Manager;
- Cloud Logging and Cloud Monitoring;
- Expo EAS for frontend delivery;
- Terraform for infrastructure as code;
- GitHub Actions for CI/CD unless an ADR selects another system.

No production account, project, region, domain, key, bucket, service identity, or provider endpoint is established by the documentation.

### 5.7 Data ownership

The backend owns user and property business data. The AI platform owns AI execution state and AI-specific persistence. The data platform owns source, raw, canonical, curated, quality, and lineage data. The frontend owns only client-local state and caches.

Recommended PostgreSQL schemas include `backend`, `ai`, `data_registry`, `raw_metadata`, `staging`, `canonical`, `curated`, `quality`, `lineage`, `operations`, and `audit`, alongside Supabase-managed schemas. Ownership and migration authority must remain explicit per schema.

### 5.8 Communication and contracts

The architecture uses:

- synchronous HTTPS/JSON for ordinary API work;
- asynchronous executions for long-running AI, document, report, and data work;
- versioned, idempotent events for publication, invalidation, and operational updates;
- polling or an approved realtime channel for progress updates;
- signed, short-lived access for private documents;
- an outbox and idempotent consumers where events are introduced.

Shared contracts cover errors, money, rates, pagination, idempotency, events, execution state, evidence, assumptions, freshness, and approvals. Financial values are decimal strings at API boundaries and `Decimal` in Python. Missing values must never be converted to zero.

### 5.9 Security and privacy model

Household-scoped access requires defence in depth: verified identity, backend authorisation, database RLS, explicit permission and entitlement checks, and negative tests. Internal service calls require distinct authenticated service identities. Storage is private by default. Secrets are externalised. AI memory and caches are tenant scoped. Deletion must cover derived data, exports, documents, embeddings, AI state, provider copies where applicable, and restoration from backups.

## 6. Contradictions and unresolved document conflicts

| Topic | Conflicting evidence | Impact | Safe temporary disposition |
|---|---|---|---|
| Frontend language | `AGENTS.md` technology decisions require TypeScript. `README.md` section 2, `architecture.md` section 3, `coding-standards.md` section 5, and `SKILL.md` describe JavaScript. | Scaffold, linting, contracts, and test configuration cannot be selected consistently. | Use strict TypeScript for the scaffold. Record an ADR or documentation correction before frontend feature work. |
| Repository model | `AGENTS.md`, `decision-log.md` ADR-016, and `deployment-and-devops.md` section 7 require an initial monorepo. `architecture.md` section 33 refers to four repositories or deployable projects. | Could lead to repository splitting, duplicate CI, and contract drift. | One monorepo with four independently deployable projects. Interpret the architecture wording as four projects, not four Git repositories. |
| Phase 0 scope | `AGENTS.md` separates documentation audit, scaffold, CI, contracts, identity/RLS, and the first feature slice. `PROJECT_ROADMAP.md` section 5 includes deployed environments, authentication, household isolation, RLS, audit, privacy artefacts, and shared contracts in Phase 0. | The next task could expand from a small scaffold into product and infrastructure work. | The next approved Phase 0 task is scaffold-only. Contracts and household security remain separately approved later stages. |
| AI/data sequence | `AGENTS.md` stages 9-10 place the first AI foundation before the data-platform foundation. `architecture.md` section 37 puts data before AI. `PROJECT_ROADMAP.md` places AI analysis before data enrichment. `database.md` section 40 puts the data platform after AI, discovery, and learning. | Teams could build agents without data or build broad data infrastructure before portfolio value exists. | Follow the small sequence in section 13 of this document. Introduce one AI path only after portfolio calculations are stable, then one approved public-data path. |
| RLS scope | `AGENTS.md` and `README.md` require database RLS for every household-scoped resource. `architecture.md` section 8, `security.md` section 7, and `backend_SKILL.md` section 8.2 frame RLS around direct Supabase client access. | Backend-only tables could be left without database isolation, weakening defence in depth. | Require RLS for household-scoped tables before property features. Every table in an exposed schema must have RLS. Private schemas still need explicit roles and should use RLS where it materially protects tenant data. |
| RLS timing | `database.md` section 40 lists RLS in final hardening, while `AGENTS.md` requires household isolation before properties and the roadmap describes RLS as foundational. | Security could be retrofitted after data and features exist. | Implement and test household RLS with the identity foundation, not during final hardening. Hardening may review or extend it, not introduce it for the first time. |
| RLS helper functions | `security.md` section 7.2 suggests carefully reviewed security-definer membership helpers. Such functions can bypass RLS and are dangerous when executable from exposed schemas. | A convenience helper could create a broad privilege-escalation path. | Prefer invoker-safe policies. Any necessary security-definer helper requires a non-exposed schema, fixed search path, revoked default execute privileges, explicit identity checks, security review, and denial tests. |
| API response envelope | `contracts.md` sections 8-9 suggests a `data`/`meta` envelope. `api-design.md` section 8 permits direct single-resource responses. `backend_SKILL.md` section 7.3 uses an envelope only “where it adds value.” | Generated clients and contract tests cannot assume one response shape. | Resolve in the shared-contract stage. Do not create domain endpoints before selecting one convention per API. |
| Correlation field in errors | `contracts.md` and `api-design.md` require `trace_id`; `backend_SKILL.md` error example uses `request_id`. Observability requires both request and trace identifiers. | Client error handling and operational correlation may diverge. | Define both semantics in the shared error contract and select the required client-visible field before public endpoints are added. |
| Pagination | `contracts.md` supports page pagination for small user collections and cursor pagination for streams. `api-design.md` lists property and notification uses for page pagination. `backend_SKILL.md` permits offset pagination only for small stable administrative lists. | Collection endpoints may be incompatible or inefficient. | Defer collection pagination until the shared-contract stage; document the chosen strategy per endpoint. |
| Health paths | `api-design.md` section 16 places backend health at `/health` and AI health at `/internal/v1/health`. `deployment.md` section 29 says both services expose `/health` and `/ready`. | Probes, routing, and access controls may disagree. | Use backend `/health` and `/ready`; recommend AI `/internal/v1/health` and `/internal/v1/ready`, with a deployment probe mapping if required. Approve the exact shape before scaffold implementation. |
| Private upload flow | `connections.md` allows frontend-to-Supabase Storage and `contracts.md` permits multipart uploads. Other documents describe backend-issued signed upload URLs and prohibit arbitrary paths. | A frontend could gain broader object access or bypass validation. | Use backend-authorised, short-lived upload instructions for private files. Finalise whether the token is a Supabase signed upload URL or another bounded mechanism before document features. |
| Supabase environment isolation | `architecture.md` allows separate Supabase projects or isolated schemas. `security.md` section 27 requires separate Supabase projects. | Schema-only isolation could mix credentials, Auth users, Storage, or Realtime across environments. | Local and CI may be ephemeral; development, staging, and production should use separate projects unless a reviewed ADR demonstrates equivalent isolation. |
| Migration ownership | `database.md` describes one shared PostgreSQL architecture. Backend and data project skills each assign Alembic ownership to their schemas, while Supabase migrations are also required. | Multiple migration histories could conflict or apply out of order. | Before the first schema change, assign one migration history and deployment order per schema. Never let two tools own the same object. |
| Event transport | `connections.md`, `event-catalogue.md`, and `decision-log.md` leave Pub/Sub versus an authenticated endpoint unresolved while other documents assume events and cache invalidation. | Infrastructure and retry semantics could be implemented speculatively. | Use no external event transport in the scaffold. Retain versioned event contracts and an outbox as later design requirements. |
| Progress delivery | Documents permit Supabase Realtime, backend event streams, polling, callbacks, or another approved mechanism. | Frontend, backend, and AI platform could implement incompatible lifecycle flows. | Use ordinary status polling for the first execution path unless an ADR selects a realtime mechanism based on demonstrated need. |
| MVP definition | `PROJECT_ROADMAP.md` and `roadmap.md` use different phase numbering and breadth; the latter describes an MVP spanning multiple substantial phases. | Scope and exit criteria are ambiguous. | Treat the first MVP as sequential vertical slices, beginning with sign-in, household, create property, and view property after the security foundation. Do not implement the full roadmap as one MVP task. |

## 7. Duplication and source-of-truth risks

| Area | Overlapping documents | Risk | Recommended ownership |
|---|---|---|---|
| Delivery roadmap | `PROJECT_ROADMAP.md`, `roadmap.md`, roadmap sections in architecture, database, and skill files | Phase numbers and sequencing drift. | `PROJECT_ROADMAP.md` should be the master product roadmap; project documents should link to it and contain only subsystem sequencing. |
| Deployment | `deployment.md`, `deployment-and-devops.md`, `SETUP.md`, operational checklists | Environment, tooling, and release requirements may diverge. | `deployment-and-devops.md` owns policy; `deployment.md` owns procedures; `SETUP.md` owns placeholder values and manual setup. |
| Configuration | `SETUP.md`, `environment-variables.md`, project skill files, deployment documents | Variables can be duplicated, unused, or accidentally treated as required. | `environment-variables.md` should be the machine-facing register; project `.env.example` files contain only implemented values; `SETUP.md` explains acquisition and ownership. |
| API and data contracts | `contracts.md`, `api-design.md`, `data-dictionary.md`, `event-catalogue.md`, `database.md` | Wire types, database fields, and examples can conflict. | `contracts/` artefacts become executable wire truth; `data-dictionary.md` owns meaning; `database.md` owns persistence; API and event documents own behaviour. |
| AI behaviour | `ai-guidelines.md`, `ai-governance.md`, `agent-catalogue.md`, `ai-platform_SKILL.md`, `SKILL.md` | Agent lists, schemas, risk controls, and model policies may drift. | Governance owns approval and risk; catalogue owns agent definitions; AI skill owns implementation guidance; guidelines own product-wide behaviour. |
| Security and permissions | `security.md`, `permissions-matrix.md`, RLS sections in database and backend documents | Role and RLS changes may not update every copy. | Permissions matrix owns action semantics; security owns controls; executable policy and denial tests are implementation truth. |

Summary duplication in `README.md` and `architecture.md` is useful for onboarding, but those summaries should link to the owning detailed document and avoid restating volatile values.

## 8. Unsupported assumptions

The following statements are plans or candidates, not verified implementation facts:

- any commercial property, listing, valuation, rental, vacancy, image, or comparable-sales access;
- provider pricing, quotas, API coverage, historical depth, redistribution, storage, derived-output, export, and AI-use rights;
- the currency, availability, licence, schema, cadence, and reliability of public datasets in every Australian jurisdiction;
- legal, tax, privacy, consumer, financial-advice, direct-marketing, record-retention, and children-related interpretations;
- Australian-region availability, data residency, recovery capability, latency, and cost for every managed service and subprocessor;
- production Supabase plan, quotas, backup features, point-in-time recovery, project isolation, and connection limits;
- team roles, named owners, support coverage, review boards, incident staffing, and commercial response targets;
- user demand, acceptable latency, traffic, data volume, AI volume, cache benefit, availability targets, RPO, RTO, and subscription economics;
- model accuracy, safety, latency, cost, structured-output reliability, regional processing, retention, and fallback quality;
- availability of Apple, Google, Expo, cloud, domain, email, payment, maps, monitoring, and provider accounts;
- the final role set, entitlement model, subscription plans, quotas, advisor model, and support-access policy;
- final tax-module scope, property-health score, prediction model, benchmark methodology, and recommendation thresholds.

These assumptions must be measured, contracted, legally reviewed, or explicitly accepted before they become production requirements.

## 9. Unresolved commercial and external decisions

No provider is selected by this audit.

| Decision | Current status | Evidence required before selection |
|---|---|---|
| Primary property-data provider | Candidates only | Contract rights, coverage proof, match quality, freshness, display/export/derived-data/AI rights, privacy, cost, support, and exit plan. |
| Listing provider | Unselected | Licensed API/feed, status-change handling, image rights, caching/retention, user display rights, webhook or refresh capability, and EOI contact use. |
| AVM and rental-estimate providers | Unselected | Accuracy benchmark, ranges/confidence, disclaimers, model dates, historical storage rights, purpose limits, and price. |
| Vacancy and specialist market data | Unselected | Methodology compatibility, geography, cadence, redistribution, and derived-metric rights. |
| Maps, tiles, geocoding, routing, and address source | Unselected | Authoritativeness, storage and caching rights, key restrictions, costs, coverage, attribution, and mixing restrictions. |
| Primary AI model and fallback | Unselected | Task-specific evaluations, structured output, tool use, latency, cost, retention, training terms, data residency, subprocessors, deletion, and fallback behaviour. |
| Embedding, reranking, OCR, and document extraction | Unselected | Need, evaluation, document privacy, retention, regional processing, deletion, and cost. Do not add these services until a current feature requires them. |
| Email delivery | Unselected | Sender verification, Australian delivery needs, sandbox, webhook signatures, bounce/complaint handling, data location, retention, and price. |
| Push notifications | Unselected | Expo/native delivery design, platform credentials, privacy, invalid-token handling, cost, and operational ownership. |
| Billing and mobile subscription reconciliation | Unselected | Web versus app-store obligations, entitlement source of truth, webhook security, refund/cancellation flows, taxes, fees, and regional support. |
| Product analytics | Unselected | Data minimisation, consent, property-address exclusion, residency, retention, deletion, mobile/web support, and cost. |
| Error monitoring and tracing export | Unselected | PII redaction, residency, retention, sampling, mobile/backend coverage, and integration cost. |
| OAuth methods | Supabase Auth accepted; methods unselected | Product need, Apple/Google account availability, callback design, account linking, recovery, mobile/web compatibility, and privacy notices. |
| Event transport | Unselected | Actual throughput, delivery semantics, ordering needs, retries, cost, IAM, local testing, and operational burden. |
| Realtime progress transport | Unselected | User latency requirement, reconnect semantics, authorisation, mobile behaviour, cost, and simpler polling comparison. |
| Feature flags | Unselected | Need, security separation, auditability, offline/mobile compatibility, cost, and removal lifecycle. |
| Production regions and disaster recovery | Preference only | Service availability, residency/legal review, budget, measured RPO/RTO, Supabase capabilities, failover testing, and operational ownership. |

Provider names and environment-variable examples in the repository are evaluation candidates or placeholders only. They are not evidence of access, approval, licensing, pricing, or contractual rights.

## 10. Risks that block feature development

### 10.1 Security

Before household-scoped product data is implemented:

- finalise the initial roles and permission matrix;
- verify Supabase JWTs server-side without trusting user-editable metadata;
- define session revocation and sensitive-operation reauthentication;
- implement backend authorisation and database RLS together;
- test owner, authorised member, viewer, inactive member, different household, and unauthenticated access;
- prevent household-ID and cross-household foreign-key manipulation;
- define exposed versus private schemas and explicit grants;
- review views and privileged functions so they do not bypass RLS accidentally;
- keep Storage private and issue only bounded upload/download access;
- define file validation, malware-scanning residual risk, and deletion;
- define separate service identities and prohibit a universal shared service key;
- externalise secrets and ignore local/generated secret paths;
- establish safe logging, request/trace IDs, audit events, rate limits, webhook verification, replay protection, and idempotency.

### 10.2 Privacy and legal

Before collecting real user data:

- assign privacy and legal owners;
- verify the current Australian legal and regulatory claims in the documentation;
- approve collection purposes and notices;
- classify data sensitivity and retention for every implemented store;
- define access, correction, export, account deletion, household deletion, and shared-record handling;
- ensure deletion covers storage, derived values, AI memory, cache, embeddings, exports, provider copies, and backup restoration;
- approve data residency, overseas recipients, subprocessors, provider training/retention terms, analytics, and support access;
- perform privacy impact assessments for high-risk AI, documents, predictions, communications, profiling, and new data sources;
- prohibit production user data from general model training by default.

### 10.3 Data

Before an external connector is implemented:

- create source and licence registries;
- confirm access method, authority, licence, attribution, commercial use, raw storage, display, redistribution, export, derived-output, caching, AI use, retention, and contract expiry;
- use only official or approved endpoints and never bypass access controls;
- define raw, canonical, curated, quality, and lineage boundaries;
- preserve provenance, observation time, publication time, dataset version, and quality status;
- define source-conflict and property/address matching rules;
- use only synthetic, public, or legally distributable fixtures;
- block publication when quality or licence checks fail.

### 10.4 AI

Before a production agent is implemented:

- select and contract providers through evidence;
- define agent, prompt, model, tool, schema, cache, evaluation, owner, and risk versions;
- restrict tools to narrow backend operations;
- keep financial calculations deterministic and backend-owned;
- validate structured outputs and expose evidence, assumptions, freshness, confidence, missing information, risks, and limitations;
- isolate cache and memory by user, household, property, conversation, purpose, and version as applicable;
- implement prompt-injection, malicious-document, tool-abuse, data-leakage, and cross-household tests;
- define measurable release thresholds, fallback behaviour, rapid disablement, cost limits, and incident handling;
- require exact human approval for consequential communication and prohibit AI sending.

## 11. MVP boundaries

The initial product should not be built as one broad MVP. It should be delivered as small vertical slices.

The first product journey, only after the household security foundation, is:

```text
sign in
create household
create property
view property
```

Explicitly out of scope for the documentation audit and scaffold:

- product tables or migrations;
- authentication and household implementation;
- property, loan, income, expense, lease, valuation, document, billing, or communication logic;
- authoritative financial calculations;
- AI agents, prompts, live model calls, vector stores, or embeddings;
- data connectors, scraping, schedules, or commercial SDKs;
- deployed cloud resources, production projects, domains, credentials, or secrets;
- Supabase Edge Functions;
- production legal, privacy, subscription, or provider selections.

## 12. Minimum Phase 0 scaffold

After this plan is reviewed and separately approved, create only:

```text
frontend/
backend/
ai-platform/
data-platform/
contracts/
supabase/
infrastructure/
scripts/
tests/
.github/
```

The scaffold should contain:

- project README files;
- minimal dependency manifests and committed lockfiles;
- strict TypeScript and typed Python configuration;
- formatting, linting, type checking, and test configuration;
- minimal backend and AI health/readiness endpoints;
- a minimal frontend build/render smoke path;
- a minimal data-platform import/CLI smoke path;
- placeholder-only `.env.example` files containing only implemented settings;
- a contracts directory structure without domain contracts;
- a Supabase migrations directory without migrations or Edge Functions;
- Terraform structure without production resources;
- path-aware GitHub Actions without deployments;
- simple root developer commands;
- secret and dependency scanning;
- no business logic or external integrations.

## 13. Smallest implementation sequence

1. **Approve this audit and Phase 0 plan.** Resolve or explicitly accept scaffold-level decisions only.
2. **Create the repository scaffold.** Add minimal project shells, tooling, documentation, health/readiness, and smoke tests.
3. **Establish CI.** Add path-aware format, lint, type, test, build, secret, and dependency checks.
4. **Define the first shared contracts.** Health, error, money, rate, pagination, idempotency, event envelope, and API version metadata.
5. **Build identity and household security.** Profile, household, membership, initial roles, RLS, audit event, outbox, and complete denial tests.
6. **Deliver the first vertical slice.** Sign in, create household, create property, and view property across database, backend, contracts, frontend, tests, security, and observability.
7. **Add the financial foundation.** Acquisition, ownership, loan, valuation, equity, and LVR using versioned `Decimal` calculations.
8. **Add income and expenses.** Rental income, expenses, cash flow, yield, and property/portfolio dashboards.
9. **Add one AI path.** Agent/execution registry, one Finance Agent, backend calculation tools, structured validation, progress, evaluations, and cost tracking.
10. **Add one data path.** Source/licence registry and one approved official public source through raw, canonical, curated, quality, lineage, and publication.

Each step requires separate acceptance criteria and approval. Do not start a later step merely because its documentation is detailed.

## 14. Assumptions and temporary defaults

- The repository remains a monorepo.
- The frontend uses strict TypeScript.
- Python 3.12 is the initial Python baseline unless the scaffold review approves a later supported version across local tooling, CI, and containers.
- The first release remains Australia focused but does not treat legal, tax, data, or provider assumptions as verified facts.
- GitHub Actions is the default CI system; Cloud Build remains unselected.
- Status polling is the simplest initial progress mechanism until realtime need is demonstrated.
- No optional provider, SDK, cache, queue, vector database, feature-flag service, analytics service, or Edge Function is added during the scaffold.

## 15. Conclusion

The intended architecture has strong boundaries and safety principles, but the documentation currently describes a target platform much larger than a safe first implementation. The correct next step is the minimal scaffold in `phase-0-implementation-plan.md`, followed by shared contracts and household isolation. Product features, AI, data providers, and production infrastructure must remain deferred until their prerequisites and evidence exist.

No commercial or external provider has been selected. All provider, legal, licensing, privacy, residency, pricing, and access claims require current evidence and the appropriate specialist or contract review before integration.
