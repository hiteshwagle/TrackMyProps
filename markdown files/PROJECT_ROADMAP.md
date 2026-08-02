# TrackMyProps Project Roadmap

## 1. Purpose

This is the master delivery roadmap for TrackMyProps.

It translates the product vision and architecture into phased, testable releases.

This roadmap is directional. Dates and sequencing must be updated using actual team capacity, commercial provider access, legal review, user evidence, technical risk, and funding.

It must remain consistent with:

```text
roadmap.md
feature-specifications.md
user-journeys.md
architecture.md
data-sources.md
security.md
privacy-and-retention.md
deployment-and-devops.md
```

---

# 2. Product vision

TrackMyProps aims to become an AI-first operating system for Australian property investors.

The platform should help a user answer:

- What do I own?
- What is it worth?
- What does it cost?
- How is it performing?
- What risks require attention?
- What should I review next?
- What happens if I sell, hold, refinance, or buy?
- Which properties or suburbs fit my goals?
- What information is missing?
- Which actions still require professional advice or user approval?

---

# 3. Roadmap principles

1. Build a trustworthy portfolio foundation before advanced AI.
2. Use deterministic calculations before AI interpretation.
3. Establish security, privacy, and audit early.
4. Integrate commercial data only with confirmed rights.
5. Keep autonomous external actions out of the initial product.
6. Release feature slices end to end.
7. Measure user outcomes, not only feature completion.
8. Use feature flags and staged rollout.
9. Do not promise dates before dependencies are understood.
10. Update this roadmap after major learning or procurement decisions.

---

# 4. Phase structure

```text
Phase 0  Foundation
Phase 1  Portfolio MVP
Phase 2  AI Analysis
Phase 3  Scenario and Decision Support
Phase 4  Data Enrichment
Phase 5  Discovery and EOI
Phase 6  Ongoing Portfolio Operations
Phase 7  Learning and Advisory Support
Phase 8  Collaboration and Professional Ecosystem
Phase 9  Advanced Intelligence
Phase 10 Scale, Partners, and Expansion
```

---

# 5. Phase 0 — Engineering and product foundation

## Goal

Create a secure, deployable platform skeleton.

## Scope

### Repository and standards

- monorepo structure;
- project-specific skill files;
- coding standards;
- contracts;
- CI;
- branch protection;
- documentation index;
- ADR process.

### Environments

- local;
- CI;
- development;
- staging;
- production structure.

### Platform

- Supabase projects;
- Cloud Run services;
- Cloud Run Jobs;
- Secret Manager;
- Artifact Registry;
- logging and monitoring.

### Security and privacy

- authentication;
- household model;
- RLS;
- service identities;
- audit foundation;
- privacy policy draft;
- collection notices;
- deletion architecture.

### Shared contracts

- OpenAPI;
- event envelope;
- error model;
- money type;
- pagination;
- idempotency.

## Exit criteria

- all services build;
- staging deploys;
- health checks pass;
- authentication works;
- household isolation tests pass;
- CI blocks failing changes;
- secrets are externalised;
- logs and traces are visible;
- rollback is demonstrated.

---

# 6. Phase 1 — Portfolio MVP

## Goal

Allow users to create and understand an owned-property portfolio.

## User capabilities

- sign up and sign in;
- create household;
- invite member;
- add property;
- record acquisition;
- record ownership;
- add loan;
- record offset and redraw;
- add rent and income;
- add expenses;
- add lease;
- add valuation;
- view property dashboard;
- view portfolio dashboard;
- view historical snapshots;
- manage notification preferences.

## Backend capabilities

- deterministic calculations;
- property and portfolio snapshots;
- cross-collateralised loan handling;
- role and RLS enforcement;
- audit events;
- exports;
- account deletion.

## Key metrics

- onboarding completion;
- first property completion;
- financial setup completion;
- dashboard return rate;
- calculation error rate;
- cross-household security failures.

## Exit criteria

- a user can enter a complete property;
- property and portfolio metrics reconcile;
- missing values do not become zero;
- calculation tests pass;
- export and deletion work;
- core journeys pass end to end.

---

# 7. Phase 2 — AI analysis

## Goal

Add evidence-backed, user-controlled AI analysis.

## Scope

- AI execution service;
- agent registry;
- property-analysis workflow;
- finance agent;
- risk agent;
- demographics agent;
- market agent;
- due-diligence agent;
- final synthesis;
- recommendation persistence;
- progress updates;
- structured validation;
- evidence and freshness;
- cost and token monitoring;
- agent-specific caching.

## Initial cache rules

```text
Demographics:
    long-lived or source-event invalidated

Prediction:
    six hours when introduced

Final property-analysis synthesis:
    fresh execution
```

## Safety

- no arbitrary SQL;
- no unrestricted HTTP;
- no direct domain mutation;
- no external sending;
- no hidden reasoning exposed;
- no professional-certification claims.

## Key metrics

- analysis completion;
- structured-output validation;
- evidence coverage;
- user usefulness rating;
- latency;
- cache hit;
- cost per completed analysis.

## Exit criteria

- analysis is traceable;
- calculation values come from backend tools;
- missing information is visible;
- invalid output fails safely;
- user data does not cross households;
- quality evaluation threshold is met.

---

# 8. Phase 3 — Scenario and decision support

## Goal

Help users compare realistic strategic choices.

## Scope

- hold scenario;
- sell scenario;
- refinance scenario;
- sell and repay another loan;
- purchase scenario;
- interest-rate sensitivity;
- vacancy sensitivity;
- sale-price sensitivity;
- scenario comparison;
- strategy agent;
- portfolio performance agent;
- recommendation acknowledgement and dismissal.

## Guardrails

- tax is excluded until a validated tax module exists;
- break cost remains an explicit missing input;
- scenario output does not change live records;
- all assumptions and calculation versions are visible.

## Key metrics

- scenario creation;
- scenario completion;
- comparison use;
- recommendation action rate;
- user-reported decision clarity.

## Exit criteria

- scenarios reproduce;
- assumptions are editable;
- no live data is changed;
- result differences are explainable;
- strategy recommendations link to evidence.

---

# 9. Phase 4 — Data enrichment

## Goal

Add reliable Australian suburb, market, planning, school, crime, hazard, and infrastructure context.

## Public data foundation

- ABS;
- ASGS;
- RBA;
- selected state and local datasets;
- official schools;
- crime adapters;
- planning and infrastructure;
- flood and bushfire layers.

## Commercial procurement

Evaluate:

- Cotality;
- PropTrack;
- Domain;
- specialist providers where unique value exists.

## Platform work

- source registry;
- licence registry;
- raw/canonical/curated pipelines;
- dataset quality;
- lineage;
- freshness;
- geography versioning;
- canonical property identity.

## Key metrics

- geographic coverage;
- data freshness;
- provider match rate;
- quality failures;
- source uptime;
- cost per enriched property.

## Exit criteria

- source rights are confirmed;
- freshness is visible;
- quality gates block bad publication;
- core suburb screens work;
- providers are isolated behind adapters;
- no unauthorised scraping is required.

---

# 10. Phase 5 — Discovery and EOI

## Goal

Help users identify opportunities and prepare controlled communication.

## Scope

- watchlists;
- licensed listing feed;
- listing matches;
- match reasoning;
- shortlist and reject;
- listing analysis;
- prompt-injection defence;
- EOI draft;
- recipient confirmation;
- exact-version approval;
- send;
- delivery and bounce tracking.

## Safety boundary

```text
AI drafts
User reviews
Authorised user approves
Backend sends
```

No autonomous offer submission.

## Key metrics

- watchlist creation;
- qualified match rate;
- shortlist rate;
- analysis requests;
- EOI draft completion;
- approval rate;
- send success;
- duplicate prevention.

## Exit criteria

- listing licence allows product use;
- withdrawn listings update correctly;
- AI cannot trigger send;
- changed content invalidates approval;
- duplicate send is prevented;
- communication audit is complete.

---

# 11. Phase 6 — Ongoing portfolio operations

## Goal

Support routine ownership and property-management work.

## Scope

- property-manager records;
- management agreements;
- lease milestones;
- rent reviews;
- vacancy tracking;
- inspections;
- findings;
- maintenance;
- linked expenses;
- document reminders;
- fixed-rate expiry;
- valuation staleness;
- CIO briefings;
- prioritised notifications.

## Key metrics

- milestone completion;
- overdue maintenance;
- reminder action rate;
- CIO briefing open rate;
- duplicate notification suppression;
- stale-data resolution.

## Exit criteria

- important milestones are surfaced;
- low-value noise is controlled;
- inspection and maintenance history is complete;
- operational actions remain user controlled.

---

# 12. Phase 7 — Learning and advisory support

## Goal

Help users understand property investment and property management.

## Scope

- knowledge assessment;
- investment learning paths;
- property-management learning paths;
- lessons;
- examples;
- quizzes;
- mastery;
- adaptive tutor;
- source-backed current explanations;
- saved checklists.

## Safety

- educational, not licensed advice;
- current law and tax require approved sources;
- user-specific examples remain clearly labelled;
- no automatic professional communication.

## Key metrics

- path started;
- lesson completed;
- quiz improvement;
- concept mastery;
- return learning sessions.

## Exit criteria

- progress persists;
- feedback is consistent;
- current facts are sourced;
- learning memory is reviewable and deletable.

---

# 13. Phase 8 — Collaboration and professional ecosystem

## Goal

Allow controlled collaboration with professionals.

## Potential capabilities

- advisor role;
- property-specific assignment;
- accountant access;
- mortgage broker collaboration;
- buyer’s agent collaboration;
- property-manager portal;
- secure document exchange;
- comments and tasks;
- professional verification;
- tradie ecosystem where relevant.

## Dependencies

- advisor permission model;
- commercial model;
- consent;
- professional identity verification;
- terms and insurance review;
- communication boundaries;
- audit.

## Exit criteria

- access is explicitly scoped;
- new properties are not automatically exposed;
- professional and user responsibilities are clear;
- no hidden impersonation;
- data sharing is revocable.

---

# 14. Phase 9 — Advanced intelligence

## Goal

Provide deeper forecasting and portfolio optimisation after the data and evaluation foundation is mature.

## Potential capabilities

- validated prediction models;
- bounded rent and capital-growth ranges;
- probability-based vacancy and stress indicators;
- portfolio optimisation;
- acquisition-fit models;
- anomaly detection;
- renovation and improvement scenarios;
- insurance and climate-risk enrichment;
- lender and refinancing intelligence;
- strategy simulation.

## Required prerequisites

- historical datasets;
- point-in-time feature store;
- no-look-ahead testing;
- model governance;
- calibration;
- drift detection;
- explainability;
- human review;
- current data rights.

## Exit criteria

- model quality is measured;
- ranges and confidence are calibrated;
- drift alerts work;
- false precision is avoided;
- users understand limitations.

---

# 15. Phase 10 — Scale, partner APIs, and expansion

## Potential scope

- public partner API;
- MCP server;
- enterprise and adviser accounts;
- white-label capabilities;
- advanced reporting;
- organisation administration;
- commercial property;
- international markets.

## Expansion requirements

For each new country:

- legal review;
- tax and lending review;
- provider procurement;
- address and property identity;
- geography;
- currency;
- privacy;
- consumer law;
- product terminology;
- model validation.

Australia-first assumptions must not be copied silently.

---

# 16. Cross-phase workstreams

## Security

Continuous:

- threat modelling;
- RLS testing;
- vulnerability management;
- service identity review;
- incident exercises;
- secret rotation.

## Privacy

Continuous:

- collection notices;
- PIAs;
- retention;
- deletion;
- subprocessor reviews;
- automated-decision transparency.

## Data

Continuous:

- source quality;
- licensing;
- lineage;
- provider change;
- freshness;
- data-cost control.

## AI governance

Continuous:

- evaluation;
- prompt and model versions;
- cost;
- hallucination review;
- safety tests;
- cache rules;
- provider review.

## Reliability

Continuous:

- SLOs;
- load testing;
- backups;
- restore tests;
- incident review;
- disaster exercises.

---

# 17. Proposed release slices

Prefer small end-to-end releases.

Examples:

## Slice A

```text
Sign up
Create household
Add property
View property
```

## Slice B

```text
Add loan
Add rent and expenses
Calculate cash flow and LVR
```

## Slice C

```text
Request AI property analysis
Track progress
View validated result
```

## Slice D

```text
Create sell scenario
Compare with hold
```

## Slice E

```text
Create watchlist
Review licensed listing match
```

---

# 18. Priority framework

Use:

```text
User value
Risk reduction
Dependency
Learning value
Revenue impact
Implementation cost
Operational burden
```

Suggested classification:

```text
Must
Should
Could
Not now
```

---

# 19. MVP definition

The initial MVP should include:

- account and household;
- one or more properties;
- acquisition;
- loans;
- income;
- expenses;
- lease;
- valuations;
- property dashboard;
- portfolio dashboard;
- deterministic calculations;
- basic scenarios;
- AI property analysis;
- recommendations;
- document upload;
- notifications;
- export and deletion;
- billing and entitlement foundation.

Discovery, EOI, tutors, and advanced prediction can follow after the core is trustworthy.

---

# 20. MVP exclusions

Do not include initially:

- autonomous property purchase;
- autonomous EOI sending;
- automatic negotiation;
- tax-return preparation;
- legal approval;
- structural diagnosis;
- guaranteed valuation;
- guaranteed returns;
- unauthorised listing scraping;
- unrestricted professional access;
- global launch;
- broad model training on user data.

---

# 21. Major dependencies

## Commercial

- property-data agreement;
- listing-data agreement;
- mapping agreement;
- AI provider terms;
- email and billing agreements.

## Legal and privacy

- privacy policy;
- terms;
- collection notices;
- PIA for AI and document analysis;
- automated-decision review;
- EOI and communication legal review.

## Technical

- Supabase environment architecture;
- Cloud Run;
- contracts;
- RLS;
- deterministic calculations;
- observability;
- deployment pipeline.

---

# 22. Major risks

| Risk | Mitigation |
|---|---|
| Commercial data cost | Provider proof of concept and staged procurement |
| Data licensing restrictions | Source and licence registry |
| AI hallucination | Structured output, evidence, validation, backend calculations |
| Cross-household exposure | RLS, policy service, negative tests |
| Mobile compatibility | Versioned API and support window |
| External communication risk | Exact approval and idempotent send |
| Provider outage | Caching, circuit breaker, degraded mode |
| Incorrect financial output | Versioned deterministic formulas and tests |
| Privacy expansion | PIAs, minimisation, retention, deletion |
| Scope expansion | Phase gates and MVP exclusions |

---

# 23. Roadmap metrics

Track at roadmap level:

```text
active households
properties created
financial setup completeness
monthly active investors
portfolio dashboard usage
AI analysis completion
scenario usage
recommendation action rate
data freshness
support volume
subscription conversion
retention
infrastructure cost per active household
AI cost per useful output
security and privacy incidents
```

---

# 24. Phase gates

A phase should not close until:

- acceptance criteria pass;
- security review passes;
- privacy obligations are addressed;
- observability exists;
- support documentation exists;
- release and rollback work;
- user outcome is measured;
- unresolved risks are explicitly accepted.

---

# 25. Roadmap governance

Review cadence:

```text
Monthly:
    delivery and dependency review

Quarterly:
    product and architecture review

After major incident:
    reprioritise reliability work

Before provider procurement:
    commercial and technical review

Before each phase:
    confirm exit and entry criteria
```

---

# 26. Status values

Use:

```text
not_started
discovery
planned
in_progress
blocked
in_validation
released
measuring
complete
deferred
cancelled
```

---

# 27. Roadmap register template

| Initiative | Phase | Status | Owner | Dependency | Target release | Evidence |
|---|---|---|---|---|---|---|
| Example | 1 | planned | Backend | Auth | TBD | Link |

Do not place unsupported dates in the roadmap.

---

# 28. Codex rules

Codex must:

1. identify the roadmap phase for each feature;
2. preserve phase dependencies;
3. avoid implementing excluded autonomous actions;
4. build end-to-end slices;
5. update status only with evidence;
6. link implementation to acceptance criteria;
7. add security, privacy, observability, and rollback;
8. document blockers;
9. avoid inventing provider access;
10. update ADRs for material changes;
11. maintain MVP scope;
12. add tests before marking complete;
13. report partial implementation honestly;
14. update roadmap metrics;
15. keep dates as TBD unless explicitly planned.

---

# 29. Definition of done

The project roadmap is effective when:

- phases align with the product vision;
- MVP scope is explicit;
- exclusions are explicit;
- dependencies and risks are visible;
- commercial and legal gates are included;
- each phase has exit criteria;
- work is delivered in end-to-end slices;
- status is evidence based;
- roadmap metrics are tracked;
- the roadmap is reviewed regularly.

---

# 30. Final roadmap principle

For every TrackMyProps roadmap item, the team must answer:

```text
Which user problem does it solve?
Which phase does it belong to?
What must exist first?
What is explicitly out of scope?
What proves it is ready to release?
How will we know it delivered value?
```

If those questions cannot be answered, the item is not ready to schedule.
