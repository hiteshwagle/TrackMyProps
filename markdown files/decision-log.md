# TrackMyProps Decision Log

## 1. Purpose

This document records important architecture, product, security, data, and operational decisions for TrackMyProps.

It prevents:

- repeating settled discussions;
- losing the reasons behind technical choices;
- introducing conflicting implementations;
- silently changing risk boundaries;
- treating assumptions as permanent facts.

This file acts as the decision register. Detailed Architecture Decision Records may later be stored under:

```text
docs/adr/
```

---

## 2. Decision statuses

```text
Proposed
Accepted
Rejected
Superseded
Deprecated
Under Review
```

---

## 3. ADR format

```text
ADR ID:
Title:
Status:
Date:
Owners:
Context:
Decision:
Rationale:
Alternatives:
Consequences:
Risks:
Review trigger:
Related documents:
Supersedes:
Superseded by:
```

---

## 4. Decision rules

1. Record decisions that materially affect multiple components or long-term operation.
2. Record why, not only what.
3. Do not rewrite old accepted decisions to hide history.
4. Supersede an ADR with a new ADR.
5. Link implementation and documentation.
6. Identify assumptions that require future validation.
7. Decisions involving law, privacy, provider contracts, or commercial access require specialist review.
8. A decision may be accepted before every implementation detail is complete.
9. Review triggers must be explicit.
10. The decision log is not proof that implementation is complete.

---

# ADR-001 — Use a four-project architecture

**Status:** Accepted  
**Date:** 2026-08-02  
**Owners:** Product and Architecture

## Context

TrackMyProps requires distinct frontend, domain, AI, and data responsibilities.

## Decision

Use four independently deployable projects:

```text
frontend
backend
ai-platform
data-platform
```

## Rationale

- clear ownership;
- independent scaling;
- AI and data workloads differ from public API workloads;
- safer permissions;
- easier provider isolation;
- independent release cycles.

## Alternatives

- single monolith;
- frontend plus one backend;
- many smaller microservices.

## Consequences

- versioned internal contracts are required;
- observability must correlate across services;
- deployment is more complex than one service;
- boundaries reduce unsafe cross-domain mutation.

## Review trigger

Material team growth, deployment overhead, or scaling evidence.

---

# ADR-002 — Use Expo React Native for frontend

**Status:** Accepted  
**Date:** 2026-08-02  
**Owners:** Frontend

## Decision

Use Expo React Native for iOS, Android, and web-oriented application delivery.

## Rationale

- shared development model;
- EAS build and release workflow;
- existing project direction;
- appropriate for mobile-first property workflows.

## Alternatives

- native Swift and Kotlin;
- Flutter;
- separate React web application.

## Consequences

- mobile API backward compatibility is critical;
- native runtime compatibility must be tracked;
- platform-specific behaviour still requires testing.

---

# ADR-003 — Use FastAPI for backend services

**Status:** Accepted  
**Date:** 2026-08-02  
**Owners:** Backend and AI Platform

## Decision

Use Python FastAPI for the backend and AI platform HTTP services.

## Rationale

- typed schemas;
- strong Python ecosystem;
- suitable for AI integration;
- OpenAPI generation;
- asynchronous request support;
- good Cloud Run compatibility.

## Alternatives

- Node.js/NestJS;
- Django;
- .NET;
- Go.

## Consequences

- Python dependency and type-checking standards are required;
- CPU-heavy workloads must not block API workers;
- long-running work is asynchronous.

---

# ADR-004 — Use Supabase for PostgreSQL, Auth, Storage, and Realtime

**Status:** Accepted  
**Date:** 2026-08-02  
**Owners:** Architecture and Backend

## Decision

Use Supabase as the primary application data and identity platform.

## Rationale

- PostgreSQL foundation;
- Auth;
- Storage;
- Realtime;
- row-level security;
- reduced initial operational burden.

## Alternatives

- self-managed PostgreSQL plus separate identity and storage;
- Firebase;
- cloud-native database and identity services assembled separately.

## Consequences

- RLS design is mandatory;
- environment projects must be isolated;
- provider capability and recovery options must be validated;
- database design must avoid platform lock-in where reasonable.

## Review trigger

Scalability, compliance, regional resilience, or provider limitation.

---

# ADR-005 — Use SQLAlchemy and Alembic

**Status:** Accepted  
**Date:** 2026-08-02  
**Owners:** Backend

## Decision

Use SQLAlchemy for backend persistence and Alembic for migrations.

## Rationale

- explicit domain models;
- migration control;
- mature Python tooling;
- separation from raw SQL while permitting optimisation.

## Alternatives

- direct SQL;
- Django ORM;
- another Python ORM.

## Consequences

- ORM query behaviour must be monitored;
- N+1 prevention is required;
- RLS and database functions remain version controlled.

---

# ADR-006 — Use LangGraph for AI orchestration

**Status:** Accepted  
**Date:** 2026-08-02  
**Owners:** AI Platform

## Decision

Use LangGraph for stateful multi-agent workflows.

## Rationale

- explicit graph and state;
- checkpointing;
- interrupt and approval support;
- suitable for parallel specialist agents and final synthesis;
- better fit than unstructured agent loops.

## Alternatives

- custom orchestration;
- CrewAI;
- simple prompt chains;
- provider-specific agent framework.

## Consequences

- graph state schemas require versioning;
- execution persistence is required;
- agent and prompt versions must be recorded;
- AI remains behind internal APIs.

---

# ADR-007 — Use deterministic backend calculations

**Status:** Accepted  
**Date:** 2026-08-02  
**Owners:** Backend and Product

## Decision

Financial calculations are implemented in deterministic, versioned backend services rather than calculated authoritatively by an LLM.

## Rationale

- reproducibility;
- testability;
- financial accuracy;
- explainable formulas;
- historical snapshot integrity.

## Alternatives

- LLM-generated calculations;
- frontend-only formulas;
- spreadsheet-based runtime logic.

## Consequences

- calculation specification is authoritative;
- AI agents call calculation tools;
- historical outputs retain calculation version.

---

# ADR-008 — Require explicit approval before external communication

**Status:** Accepted  
**Date:** 2026-08-02  
**Owners:** Product, Security, Backend

## Decision

AI may create communication drafts, but it may not send them. EOI and related external communication require explicit approval of the exact draft version and recipient.

## Rationale

- consequential action risk;
- financial and legal implications;
- recipient safety;
- auditability;
- user control.

## Alternatives

- autonomous send;
- approve a template rather than exact content;
- no communication feature.

## Consequences

- approval and sending are separate records and permissions;
- edits invalidate approval;
- idempotency and duplicate prevention are mandatory;
- AI tools cannot include an email-send capability.

---

# ADR-009 — Use official and licensed data sources

**Status:** Accepted  
**Date:** 2026-08-02  
**Owners:** Data Platform and Product

## Decision

Prefer official public datasets and licensed commercial APIs or feeds. Do not rely on unauthorised website scraping.

## Rationale

- reliability;
- legal and contractual clarity;
- operational stability;
- data provenance;
- commercial product suitability.

## Alternatives

- broad website scraping;
- manually copied reports;
- one undocumented aggregator.

## Consequences

- commercial access requires procurement;
- source and licence registries are mandatory;
- provider use may limit storage, display, export, caching, and AI use.

---

# ADR-010 — Use raw, canonical, and curated data layers

**Status:** Accepted  
**Date:** 2026-08-02  
**Owners:** Data Platform

## Decision

External data moves through:

```text
raw
staging
canonical
curated
```

## Rationale

- lineage;
- source replay;
- quality gates;
- provider isolation;
- consistent product data.

## Alternatives

- ingest directly into product tables;
- one denormalised warehouse;
- source-specific frontend consumption.

## Consequences

- data publication is versioned;
- quality checks precede release;
- canonical models require governance.

---

# ADR-011 — Use Cloud Run for backend and AI services

**Status:** Accepted  
**Date:** 2026-08-02  
**Owners:** Platform

## Decision

Deploy containerised backend and AI services to Google Cloud Run.

## Rationale

- managed autoscaling;
- no cluster administration;
- suitable for FastAPI containers;
- controlled scaling and cost;
- revision-based rollback.

## Alternatives

- GKE;
- virtual machines;
- other serverless container platforms.

## Consequences

- services should be stateless;
- database pooling must account for autoscaling;
- startup and concurrency require tuning;
- regional strategy must be reviewed.

---

# ADR-012 — Use Cloud Run Jobs for data processing

**Status:** Accepted  
**Date:** 2026-08-02  
**Owners:** Data Platform and Platform

## Decision

Use Cloud Run Jobs and Cloud Scheduler for scheduled ingestion, ETL, backfills, retention, deletion, and publication tasks.

## Rationale

- job-oriented workload;
- managed execution;
- independent resource sizing;
- retry support;
- no always-on worker requirement for scheduled work.

## Alternatives

- always-on worker;
- Kubernetes CronJobs;
- functions;
- virtual machines.

## Consequences

- jobs must be idempotent;
- checkpoints and reconciliation are required for large tasks;
- missed-run and retry policy must be documented.

---

# ADR-013 — Prefer Australian hosting regions

**Status:** Accepted with validation required  
**Date:** 2026-08-02  
**Owners:** Platform, Privacy, Security

## Decision

Use Australian regions where available and operationally suitable.

## Rationale

- latency;
- user expectation;
- privacy and procurement preference;
- operational locality.

## Alternatives

- nearest global region;
- multi-region from initial launch.

## Consequences

- Australian hosting does not eliminate cross-border processing;
- model and SaaS provider locations still require review;
- resilience and disaster-recovery options require validation.

---

# ADR-014 — Use API path major versioning

**Status:** Accepted  
**Date:** 2026-08-02  
**Owners:** Backend and Platform

## Decision

Use explicit major versions:

```text
/api/v1
/internal/v1
```

## Rationale

- visible and easy to route;
- suitable for mobile clients;
- clear deprecation;
- straightforward OpenAPI separation.

## Alternatives

- header-only versioning;
- unversioned internal APIs;
- date-based versions.

## Consequences

- additive evolution occurs within a major version;
- breaking changes require a new major version;
- supported client versions must be monitored.

---

# ADR-015 — Use event outbox and idempotent consumers

**Status:** Accepted as target architecture  
**Date:** 2026-08-02  
**Owners:** Backend, Data, Platform

## Decision

Use a transactional outbox for durable event publication and consumer inbox records for idempotency.

## Rationale

- avoids lost events after database commits;
- supports at-least-once delivery;
- enables replay and audit;
- isolates domain transactions from transport failures.

## Alternatives

- direct best-effort publish;
- database polling without an outbox;
- synchronous service chaining.

## Consequences

- outbox publisher required;
- dead-letter and replay operations required;
- consumers must handle duplicates and out-of-order events.

---

# ADR-016 — Use a monorepo initially

**Status:** Accepted  
**Date:** 2026-08-02  
**Owners:** Engineering

## Decision

Keep frontend, backend, AI, data, contracts, infrastructure, and documentation in a monorepo initially.

## Rationale

- coordinated contract changes;
- simpler onboarding;
- atomic pull requests;
- shared CI and documentation;
- early team efficiency.

## Alternatives

- one repository per service;
- frontend/backend split repositories.

## Consequences

- CI should run selectively by path;
- ownership still requires CODEOWNERS;
- repository may be split later with evidence.

---

# ADR-017 — Use per-agent caching

**Status:** Accepted  
**Date:** 2026-08-02  
**Owners:** AI Platform and Product

## Decision

Caching is configured per agent and scope rather than globally.

Initial examples:

```text
Demographics: long-lived or event invalidated
Prediction: six hours
Final property-analysis synthesis: always fresh
```

## Rationale

- data volatility differs;
- user-specific context must remain isolated;
- final synthesis should incorporate latest user context;
- cost and latency can be reduced safely.

## Consequences

- cache keys include agent, prompt, input, scope, and dataset versions;
- event-driven invalidation is required;
- global caching of user-specific results is prohibited.

---

# ADR-018 — Separate permission, entitlement, and approval

**Status:** Accepted  
**Date:** 2026-08-02  
**Owners:** Security, Backend, Product

## Decision

Access is allowed only when relevant layers pass:

```text
authentication
authorisation
entitlement
quota
feature flag
provider policy
approval
```

## Rationale

A paid entitlement does not grant access to another household, and role permission does not replace explicit approval for consequential actions.

## Consequences

- policy logic is centralised;
- errors distinguish missing entitlement from permission denial;
- frontend flags are not authoritative.

---

# ADR-019 — Do not use production user data for general model training by default

**Status:** Accepted  
**Date:** 2026-08-02  
**Owners:** Privacy and AI Governance

## Decision

Do not use production user prompts, documents, portfolio data, or outputs to train general models by default.

## Rationale

- privacy;
- user trust;
- provider-contract risk;
- unnecessary exposure.

## Alternatives

- broad opt-out training;
- automatic internal fine-tuning.

## Consequences

- use synthetic, public, licensed, or specifically consented data for evaluation and training;
- provider training terms require review;
- quality sampling is minimised and retention limited.

---

# ADR-020 — Keep the first release Australia focused

**Status:** Accepted  
**Date:** 2026-08-02  
**Owners:** Product

## Decision

Initial product assumptions, terminology, datasets, calculations, legal notices, and provider evaluation are Australia focused.

## Rationale

- data and regulation are jurisdiction specific;
- clearer product-market fit;
- reduced complexity;
- stronger data quality.

## Alternatives

- multi-country launch;
- globally generic calculator product.

## Consequences

- currency defaults to AUD;
- state and territory adapters are required;
- international expansion needs separate legal, data, tax, and product work.

---

# 5. Decisions requiring future ADRs

Create additional ADRs before finalising:

- primary commercial property-data provider;
- listing provider;
- mapping and geocoding provider;
- primary AI model provider and fallback;
- embedding provider;
- event transport;
- feature-flag platform;
- analytics provider;
- error-monitoring provider;
- billing provider;
- notification provider;
- production Supabase architecture;
- disaster-recovery region and strategy;
- final subscription and quota model;
- advisor-access commercial model;
- public partner API;
- MCP server exposure;
- commercial versus community benchmarking;
- tax module scope;
- property-manager and tradie ecosystem.

---

# 6. Decision review cadence

Review:

- quarterly for decisions marked “Under Review”;
- annually for accepted platform decisions;
- immediately when assumptions change;
- after major incidents;
- before major provider procurement;
- before international expansion.

---

# 7. Decision register

| ADR | Title | Status |
|---|---|---|
| ADR-001 | Four-project architecture | Accepted |
| ADR-002 | Expo React Native frontend | Accepted |
| ADR-003 | FastAPI backend services | Accepted |
| ADR-004 | Supabase platform | Accepted |
| ADR-005 | SQLAlchemy and Alembic | Accepted |
| ADR-006 | LangGraph orchestration | Accepted |
| ADR-007 | Deterministic calculations | Accepted |
| ADR-008 | Explicit communication approval | Accepted |
| ADR-009 | Official and licensed data | Accepted |
| ADR-010 | Raw/canonical/curated data | Accepted |
| ADR-011 | Cloud Run services | Accepted |
| ADR-012 | Cloud Run Jobs | Accepted |
| ADR-013 | Australian hosting preference | Accepted with validation |
| ADR-014 | Path-based API versioning | Accepted |
| ADR-015 | Outbox and idempotent consumers | Target architecture |
| ADR-016 | Initial monorepo | Accepted |
| ADR-017 | Per-agent caching | Accepted |
| ADR-018 | Layered access decisions | Accepted |
| ADR-019 | No general training on user data | Accepted |
| ADR-020 | Australia-first product | Accepted |

---

# 8. Definition of done

Decision governance is effective when:

- material decisions are recorded;
- owners and status are visible;
- alternatives and consequences are documented;
- superseded decisions retain history;
- implementation links exist;
- future review triggers are known;
- open decisions are tracked;
- architecture changes cannot silently conflict with accepted decisions.

---

# 9. Final decision principle

For every material TrackMyProps decision, the team must answer:

```text
What problem were we solving?
What did we decide?
Why did we choose it?
Which alternatives were considered?
What are the consequences and risks?
What would cause us to revisit it?
```

If those questions are not recorded, the decision is incomplete.
