# TrackMyProps Product and Delivery Roadmap

## 1. Purpose

This roadmap defines how TrackMyProps should be delivered across the four projects:

```text
TrackMyProps/
├── frontend/
├── backend/
├── ai-platform/
└── data-platform/
```

It provides:

- delivery phases;
- MVP scope;
- dependencies;
- milestone sequencing;
- release gates;
- acceptance criteria;
- Codex implementation order;
- risk controls;
- future expansion priorities.

The roadmap is intentionally structured to deliver value early without creating architectural debt.

---

# 2. Product vision

TrackMyProps is an AI-first property investment operating system.

It should help users:

- manage owned properties;
- track loans, income, expenses, leases, valuations, and documents;
- understand property and suburb performance;
- compare properties against portfolio and market benchmarks;
- identify underperforming and outperforming assets;
- model hold, sell, refinance, and debt-repayment scenarios;
- discover matching properties;
- draft expressions of interest;
- receive proactive recommendations;
- learn property investment and property management;
- make more informed decisions with explainable AI.

The platform should evolve from a reliable portfolio tracker into a proactive investment partner.

---

# 3. Delivery principles

1. Build the system of record before advanced AI.
2. Build deterministic calculations before recommendations.
3. Build source governance before large-scale data ingestion.
4. Build explainability and auditability from the beginning.
5. Build user approval before communication automation.
6. Release narrow, complete workflows before broad incomplete ones.
7. Use feature flags for high-impact features.
8. Validate data and model quality before production release.
9. Prefer incremental delivery over one large launch.
10. Keep all four projects independently deployable.

---

# 4. Roadmap structure

The roadmap is divided into ten major phases:

```text
Phase 0  Foundation and planning
Phase 1  Portfolio core
Phase 2  Financial engine
Phase 3  Data foundation
Phase 4  AI foundation
Phase 5  Portfolio intelligence
Phase 6  Property discovery and communications
Phase 7  Learning and property management
Phase 8  Proactive CIO experience
Phase 9  Production hardening and scale
```

---

# 5. Phase 0 — Foundation and planning

## Objective

Create the technical, operational, and documentation foundation.

## Deliverables

### Parent workspace

```text
TrackMyProps/
├── SKILL.md
├── architecture.md
├── coding-standards.md
├── database.md
├── ai-guidelines.md
├── deployment.md
├── roadmap.md
├── frontend/
├── backend/
├── ai-platform/
└── data-platform/
```

### Shared decisions

- architecture boundaries;
- service ownership;
- database ownership;
- environment strategy;
- deployment targets;
- authentication strategy;
- naming conventions;
- API conventions;
- event conventions;
- security baseline;
- observability baseline.

### Infrastructure

- Google Cloud development project;
- Supabase development project;
- Artifact Registry;
- Secret Manager;
- development service accounts;
- CI skeletons;
- local development setup.

## Exit criteria

- all project folders exist;
- all SKILL files exist;
- architecture docs exist;
- each project starts with a minimal health check;
- CI runs lint and tests;
- local setup is documented;
- no real secrets are committed.

---

# 6. Phase 1 — Portfolio core

## Objective

Enable users to create an account and manage property records.

## Scope

### Frontend

- onboarding;
- authentication;
- household creation;
- property list;
- property creation;
- property edit;
- property details;
- ownership details;
- acquisition details;
- basic dashboard;
- empty, loading, and error states.

### Backend

- Supabase JWT validation;
- user profile;
- household;
- household membership;
- properties;
- ownership entities;
- property ownership;
- acquisitions;
- audit logging;
- RLS;
- CRUD APIs.

### Database

- core backend schema;
- user and household tables;
- property tables;
- ownership tables;
- audit tables;
- indexes;
- RLS policies.

### AI platform

Only foundation:

- health;
- readiness;
- service authentication;
- execution model skeleton;
- mock agent.

### Data platform

Only foundation:

- source registry;
- dataset registry;
- job runner;
- basic quality framework.

## MVP user value

The user can:

- register;
- create a household;
- add an owned property;
- add purchase details;
- view and update property information;
- see a basic portfolio summary.

## Exit criteria

- property CRUD works end to end;
- user isolation is tested;
- RLS is tested;
- audit events are created;
- frontend works on iOS, Android, and web;
- backend is deployed to development;
- core migrations run from zero.

---

# 7. Phase 2 — Financial engine

## Objective

Turn property records into a useful portfolio-management product.

## Scope

### Loans

- loan creation and editing;
- interest rate;
- fixed or variable;
- principal and interest or interest only;
- offset;
- redraw;
- current balance;
- repayment frequency;
- rate history;
- fixed-rate expiry.

### Income

- rent;
- additional property income;
- income frequency;
- rent history;
- vacancy periods.

### Expenses

- recurring and one-off expenses;
- expense categories;
- maintenance;
- insurance;
- strata;
- council and water rates;
- property management;
- land tax;
- accounting;
- capital expenses.

### Valuation

- user estimate;
- agent appraisal;
- bank valuation;
- automated estimate;
- valuation history.

### Calculations

- gross yield;
- net yield;
- annual income;
- annual expenses;
- cash flow;
- equity;
- LVR;
- loan repayment;
- portfolio totals.

### Frontend

- loan screens;
- income screens;
- expense screens;
- valuation screens;
- charts;
- cash-flow summary;
- property financial dashboard;
- portfolio dashboard.

## Exit criteria

- all financial calculations are deterministic;
- Decimal is used for money;
- formulas are documented and tested;
- snapshots are generated;
- users can see property and portfolio financials;
- versioned calculations are stored;
- no AI is required for core financial results.

---

# 8. Phase 3 — Data foundation

## Objective

Introduce trusted market and suburb data.

## Priority order

### 1. RBA and economic indicators

- cash rate;
- CPI;
- unemployment;
- lending indicators where available.

### 2. ABS demographics

- population;
- growth;
- household composition;
- income;
- employment;
- tenure;
- dwelling type.

### 3. Geography

- state;
- postcode;
- suburb/locality;
- LGA;
- statistical areas;
- boundaries;
- centroids.

### 4. Schools

- school locations;
- sector;
- type;
- approved public attributes.

### 5. Crime

- jurisdiction-specific approved datasets;
- rates and categories;
- suppression rules.

### 6. Infrastructure and planning

- transport;
- major projects;
- planning applications where approved.

### 7. Hazards

- flood;
- bushfire;
- environmental risk;
- official hazard data.

### 8. Market data

- licensed or approved sales;
- rental;
- vacancy;
- listing;
- comparable property data.

## Data-platform deliverables

- raw, canonical, and curated layers;
- source registry;
- licence registry;
- quality rules;
- lineage;
- historical snapshots;
- publishing;
- downstream events;
- Cloud Run Jobs;
- Scheduler.

## Backend deliverables

- curated data read APIs;
- suburb and market endpoints;
- data freshness responses;
- quality metadata.

## Frontend deliverables

- suburb overview;
- basic benchmark data;
- freshness display;
- source display.

## Exit criteria

- at least three trusted public datasets are live;
- each published dataset has lineage and quality;
- historical data is preserved;
- stale data is detected;
- data refresh jobs are scheduled;
- backend can retrieve curated metrics;
- frontend shows data dates and sources.

---

# 9. Phase 4 — AI foundation

## Objective

Create a safe, measurable AI platform.

## Scope

### Core platform

- agent registry;
- prompt registry;
- tool registry;
- model-provider abstraction;
- model routing;
- structured outputs;
- LangGraph execution;
- checkpoints;
- cache service;
- execution events;
- observability;
- evaluation framework;
- prompt-injection controls.

### First agents

1. Demographics Agent
2. Suburb Intelligence Agent
3. Finance Agent
4. Property Analysis Agent
5. Prediction Agent

### Execution policies

- Demographics Agent: cached;
- Suburb Agent: source-aware cache;
- Finance Agent: input fingerprint;
- Property Analysis Agent: final synthesis always runs;
- Prediction Agent: six-hour cache.

### Frontend

- AI execution screen;
- progress updates;
- recommendation display;
- evidence;
- assumptions;
- confidence;
- freshness;
- retry.

### Backend

- create AI execution;
- track entitlement;
- store recommendation;
- store user decision;
- provide approved tools;
- audit execution requests.

## Exit criteria

- agent outputs are typed;
- invalid outputs fail safely;
- evidence and confidence are visible;
- prompt versions are stored;
- cache policies work;
- user-specific cache isolation is tested;
- model cost and latency are measured;
- evaluation suites pass;
- no agent can bypass backend permissions.

---

# 10. Phase 5 — Portfolio intelligence

## Objective

Use AI and calculations to help users understand portfolio performance and options.

## Scope

### Portfolio Performance Agent

- property versus own history;
- property versus suburb;
- property versus portfolio;
- portfolio versus strategy;
- underperforming assets;
- outperforming assets;
- concentration;
- cash-flow pressure;
- leverage;
- diversification.

### Risk Agent

- interest-rate risk;
- LVR risk;
- vacancy risk;
- concentration;
- liquidity;
- flood and bushfire;
- supply;
- insurance;
- data quality.

### Strategy Agent

- growth versus cash flow;
- time horizon;
- borrowing capacity;
- diversification;
- portfolio fit.

### Sell, Hold, Refinance Agent

- sale scenario;
- hold scenario;
- refinance scenario;
- pay one loan with sale proceeds;
- compare alternatives;
- show assumptions and sensitivity.

### Frontend

- portfolio health score;
- outperformer and underperformer cards;
- scenario builder;
- scenario comparison;
- saved scenarios;
- recommendation history.

## Exit criteria

- portfolio metrics are calculated by backend;
- AI explanations use those calculations;
- sell and refinance results show assumptions;
- recommendation confidence is visible;
- users can save and compare scenarios;
- recommendations can be acknowledged or dismissed;
- no recommendation is presented as guaranteed advice.

---

# 11. Phase 6 — Property discovery and communications

## Objective

Help users find properties and communicate with selling agents.

## Scope

### Watchlists

- suburb;
- budget;
- property type;
- bedrooms;
- yield;
- growth;
- schools;
- transport;
- risk;
- portfolio fit.

### Listing ingestion

- approved provider or licensed source;
- listing status;
- asking range;
- auction date;
- updates;
- withdrawal;
- sale.

### Discovery Agent

- match score;
- reasons;
- disqualifiers;
- missing data;
- confidence.

### Opportunity workflow

```text
New listing
    ↓
Match against watchlist
    ↓
AI analysis
    ↓
User review
    ↓
Shortlist or reject
```

### Negotiation Agent

- questions for agent;
- offer approach;
- message drafting;
- response interpretation.

### EOI Agent

- structured draft;
- missing field warnings;
- user editing;
- recipient confirmation;
- explicit approval;
- backend email send;
- audit.

## Exit criteria

- source access is licensed or approved;
- listing refresh is reliable;
- match criteria are explainable;
- EOI drafts never send without approval;
- final sent content is audited;
- duplicate communication is prevented;
- staging uses restricted recipients;
- user can track communication status.

---

# 12. Phase 7 — Learning and property management

## Objective

Create an adaptive education and property-management experience.

## Scope

### Property Investment Tutor

- beginner assessment;
- learning path;
- cash flow;
- yield;
- leverage;
- equity;
- risk;
- due diligence;
- suburb research;
- finance basics;
- scenario examples;
- quizzes;
- revision.

### Property Management Tutor

- selecting a property manager;
- management fees;
- agreements;
- inspections;
- maintenance;
- arrears;
- rent reviews;
- tenant communication;
- compliance concepts;
- evaluating performance.

### Property-management tools

- property manager record;
- agreement tracking;
- inspection schedule;
- inspection findings;
- maintenance requests;
- documents;
- reminders.

### Frontend

- academy;
- lessons;
- quizzes;
- progress;
- concept mastery;
- personalised examples;
- property-management dashboard.

## Exit criteria

- learning progress is persisted;
- content adapts to knowledge level;
- current facts use approved sources;
- legal and regulatory boundaries are clear;
- users can track inspections and maintenance;
- tutor memory is reviewable and deletable.

---

# 13. Phase 8 — Proactive CIO experience

## Objective

Move from reactive analysis to proactive portfolio guidance.

## Scope

### Chief Investment Officer Agent

Review:

- portfolio changes;
- loan changes;
- rate changes;
- fixed-rate expiry;
- lease milestones;
- rent changes;
- expense changes;
- valuations;
- comparable sales;
- suburb changes;
- new listings;
- risk changes;
- recommendation status.

### Briefings

- daily or configurable digest;
- event-driven alerts;
- priority ranking;
- deduplication;
- materiality threshold;
- user notification preferences.

### Example briefing

```text
What changed
Why it matters
What to review
Confidence
```

### Automation

- fixed-rate expiry alert;
- rent-review reminder;
- insurance renewal reminder;
- negative cash-flow alert;
- valuation movement;
- new listing match;
- portfolio concentration warning.

## Exit criteria

- recommendations are deduplicated;
- dismissed alerts do not immediately repeat;
- no alert is generated without material change;
- users control frequency and channels;
- CIO output cites specialist evidence;
- notification fatigue is measured.

---

# 14. Phase 9 — Production hardening and scale

## Objective

Prepare for broad production use.

## Scope

### Security

- penetration testing;
- threat modelling;
- prompt-injection testing;
- dependency scanning;
- container scanning;
- secret rotation;
- IAM review;
- RLS review;
- privacy review.

### Reliability

- load testing;
- failover;
- provider outage handling;
- checkpoint recovery;
- job replay;
- event deduplication;
- backup restore test;
- disaster recovery.

### Performance

- query optimisation;
- index review;
- materialized views;
- frontend performance;
- AI routing optimisation;
- cache effectiveness;
- data-job tuning.

### Cost

- cost per user;
- cost per AI workflow;
- cost per dataset;
- provider budget alerts;
- Cloud Run scaling;
- storage lifecycle;
- log retention.

### Operations

- runbooks;
- alerts;
- on-call ownership;
- incident process;
- support tooling;
- admin dashboard.

### Compliance and legal

- privacy policy alignment;
- terms alignment;
- data-provider licence review;
- AI disclaimers;
- communication workflow review;
- retention review.

## Exit criteria

- production readiness checklist passes;
- security review passes;
- backups restore successfully;
- alert runbooks exist;
- load tests pass;
- budgets and quotas are active;
- data licences are documented;
- rollback is tested;
- support can trace user-visible outcomes.

---

# 15. MVP definition

The recommended MVP includes Phases 0 to 5, with limited scope from Phase 6.

## MVP must include

### Portfolio management

- user;
- household;
- properties;
- ownership;
- acquisitions;
- loans;
- income;
- expenses;
- leases;
- valuations;
- documents.

### Financials

- cash flow;
- yield;
- equity;
- LVR;
- repayment;
- portfolio summary;
- historical snapshots.

### Data

- basic geography;
- RBA;
- ABS demographics;
- at least one approved market-data source;
- data freshness.

### AI

- Demographics Agent;
- Suburb Agent;
- Finance Agent;
- Property Analysis Agent;
- Prediction Agent;
- Portfolio Performance Agent;
- Risk Agent;
- sell, hold, refinance scenarios.

### UX

- mobile and web;
- dashboard;
- property financial detail;
- AI recommendation display;
- evidence and confidence;
- saved scenarios;
- notifications for report completion.

## MVP should not include

- fully automatic EOI sending;
- broad unauthorised scraping;
- unrestricted agent tools;
- advanced tax advice;
- automatic property purchase decisions;
- community benchmarking without enough data;
- unvalidated image-based building diagnosis;
- large-scale multi-country support.

---

# 16. Post-MVP priorities

Recommended order:

1. listing watchlists;
2. discovery agent;
3. EOI drafting and approval;
4. learning academy;
5. property-management workflows;
6. CIO briefing;
7. advanced document analysis;
8. lender and broker integrations;
9. accounting integrations;
10. community benchmarking;
11. advanced prediction models;
12. professional partner marketplace.

---

# 17. Dependency map

## Frontend depends on

- backend API contracts;
- Supabase Auth;
- storage;
- realtime;
- notification configuration.

## Backend depends on

- database migrations;
- Supabase;
- email provider;
- AI platform internal API;
- curated data APIs or views.

## AI platform depends on

- backend tools;
- curated data;
- model providers;
- checkpoint database;
- prompts and evaluations.

## Data platform depends on

- source access;
- licences;
- storage;
- database;
- Scheduler;
- publishing events.

Build dependencies in that order.

---

# 18. Critical path

The critical path is:

```text
Authentication
    ↓
Households
    ↓
Properties
    ↓
Loans, income, expenses, valuations
    ↓
Financial calculations
    ↓
Market and suburb data
    ↓
AI tools
    ↓
Property and portfolio analysis
    ↓
Scenarios
```

Listing automation and tutors are not on the initial critical path.

---

# 19. Parallel workstreams

After Phase 1, some work can run in parallel.

## Workstream A — Frontend

- portfolio UI;
- financial forms;
- dashboard;
- AI result views.

## Workstream B — Backend

- domain models;
- calculations;
- APIs;
- approvals;
- notifications.

## Workstream C — Data platform

- public datasets;
- canonical schemas;
- quality and lineage.

## Workstream D — AI platform

- registries;
- tools;
- model adapter;
- evaluations;
- agents.

Shared contracts must be agreed before parallel implementation.

---

# 20. Release gates

Every feature must pass gates.

## Gate 1 — Architecture

- correct project;
- correct owner;
- contract defined;
- ADR where required.

## Gate 2 — Security

- permissions;
- RLS;
- secret handling;
- privacy;
- side-effect controls.

## Gate 3 — Correctness

- tests;
- calculations;
- validation;
- migration safety.

## Gate 4 — User experience

- loading;
- empty;
- error;
- stale;
- offline where relevant;
- accessibility.

## Gate 5 — AI quality

- structured output;
- evidence;
- confidence;
- evaluation;
- prompt injection;
- cost and latency.

## Gate 6 — Operations

- logs;
- metrics;
- alerts;
- rollback;
- setup docs.

---

# 21. Definition of feature complete

A feature is complete only when:

- frontend is implemented;
- backend is implemented;
- database migration exists;
- authorisation is enforced;
- tests pass;
- errors are handled;
- loading and empty states exist;
- analytics and logging are added;
- setup variables are documented;
- API contract is documented;
- security is reviewed;
- rollback is possible;
- AI evaluation exists when AI is involved;
- data lineage exists when external data is involved.

---

# 22. Codex build order

Codex should implement in this order.

## Step 1

Create all project structures and shared documentation.

## Step 2

Create database migrations for identity, household, property, ownership, and audit.

## Step 3

Build backend authentication and property CRUD.

## Step 4

Build frontend onboarding and property management.

## Step 5

Build loans, income, expenses, leases, valuations, and calculations.

## Step 6

Build portfolio dashboards.

## Step 7

Build data registries and first public pipelines.

## Step 8

Build curated suburb and market APIs.

## Step 9

Build AI provider abstraction, agents, tools, and execution service.

## Step 10

Build first AI agents.

## Step 11

Build portfolio performance and scenario agents.

## Step 12

Build listing discovery and EOI draft workflow.

## Step 13

Build learning and property-management features.

## Step 14

Build CIO briefing and proactive recommendations.

## Step 15

Harden security, performance, cost, and operations.

Codex must not skip foundational steps because a later AI feature appears more interesting.

---

# 23. Suggested milestone releases

## Release 0.1 — Foundation

- project structure;
- auth;
- health;
- CI;
- development deployment.

## Release 0.2 — Property tracker

- property CRUD;
- household;
- ownership;
- acquisition.

## Release 0.3 — Financial tracker

- loans;
- income;
- expenses;
- valuations;
- cash flow;
- equity;
- LVR.

## Release 0.4 — Portfolio dashboard

- portfolio totals;
- charts;
- history;
- basic alerts.

## Release 0.5 — Suburb data

- geography;
- demographics;
- economic indicators;
- market metrics.

## Release 0.6 — Property AI

- suburb;
- finance;
- property analysis;
- prediction.

## Release 0.7 — Portfolio AI

- performance;
- risk;
- strategy;
- scenarios.

## Release 0.8 — Discovery

- watchlists;
- listing matches;
- opportunities.

## Release 0.9 — Communications and learning

- EOI drafts;
- negotiation drafts;
- academy;
- property-management tutor.

## Release 1.0 — Production launch

- CIO briefing;
- hardened security;
- support tools;
- disaster recovery;
- production readiness.

---

# 24. Metrics by phase

## Portfolio core

- property creation completion rate;
- number of properties per household;
- onboarding completion;
- data completeness.

## Financial engine

- loan completion rate;
- expense completion rate;
- calculation error rate;
- dashboard engagement.

## Data foundation

- dataset freshness;
- quality score;
- job success;
- coverage.

## AI

- execution success;
- output validation;
- recommendation usefulness;
- cache hit;
- cost;
- latency;
- user decision rate.

## Discovery

- match open rate;
- shortlist rate;
- EOI draft rate;
- EOI approval rate.

## Learning

- lesson completion;
- quiz improvement;
- return rate;
- concept mastery.

## CIO

- briefing open rate;
- action rate;
- dismissal rate;
- notification opt-out;
- duplicate alert rate.

---

# 25. Risk register

## Risk: insufficient property data access

Mitigation:

- start with public datasets;
- define provider abstraction;
- avoid building around guessed access;
- document licensed-provider requirements.

## Risk: AI costs

Mitigation:

- model routing;
- caching;
- quotas;
- usage tracking;
- smaller models for simple tasks.

## Risk: inaccurate recommendations

Mitigation:

- deterministic calculations;
- evidence;
- confidence;
- evaluation;
- professional boundaries;
- user approval.

## Risk: user data sensitivity

Mitigation:

- RLS;
- service isolation;
- minimal logging;
- encryption;
- deletion;
- audit.

## Risk: scope expansion

Mitigation:

- phase gates;
- MVP discipline;
- feature flags;
- release criteria.

## Risk: legal or regulatory issues

Mitigation:

- educational positioning;
- current source retrieval;
- legal review;
- contextual disclaimers;
- no autonomous consequential actions.

## Risk: data licence breach

Mitigation:

- source and licence registry;
- publishing controls;
- blocked status for unclear rights.

---

# 26. Deferred features

Defer until core product quality is proven:

- automatic offer submission;
- fully autonomous negotiations;
- bank account scraping without approved integration;
- tax return preparation;
- legal contract approval;
- automated tenant selection;
- community comparison using insufficient sample sizes;
- multi-country regulation support;
- complex marketplace features;
- proprietary valuation claims without validated models.

---

# 27. Documentation deliverables by phase

## Phase 0

- architecture;
- coding standards;
- database;
- deployment;
- roadmap;
- setup.

## Phase 1

- API docs;
- auth guide;
- RLS guide;
- property model.

## Phase 2

- calculation formulas;
- financial assumptions;
- data dictionary.

## Phase 3

- source catalogue;
- dataset catalogue;
- lineage;
- licence documentation.

## Phase 4

- agent catalogue;
- prompt registry;
- tool catalogue;
- evaluation guide.

## Phase 5 onward

- scenario guide;
- communications approval guide;
- tutor guide;
- operations runbooks.

---

# 28. Final configuration handover

At the end of implementation, Codex must produce a complete handover.

Required:

```text
SETUP.md
ENVIRONMENT_VARIABLES.md
CONNECTIONS.md
DEPLOYMENT_CHECKLIST.md
PRODUCTION_READINESS.md
```

The handover must list:

- every environment variable;
- every connection string;
- every API key;
- every provider account;
- every service account;
- every IAM permission;
- every Supabase setting;
- every storage bucket;
- every domain;
- every redirect URL;
- every webhook;
- every Scheduler job;
- every Cloud Run service and job;
- every database role;
- every required manual configuration step.

Values must be placeholders, never invented secrets.

---

# 29. Roadmap completion criteria

The roadmap is considered successfully executed when:

- users can manage all core property financial information;
- calculations are reliable;
- trusted external data is integrated;
- AI recommendations are evidence based;
- portfolio comparisons are useful;
- scenario modelling is transparent;
- communication drafts remain user controlled;
- learning adapts to the user;
- proactive alerts are material and non-spammy;
- production deployment is secure and reversible;
- every configuration dependency is documented.

---

# 30. Final roadmap principle

TrackMyProps should be built in this order:

```text
Trustworthy records
    ↓
Correct calculations
    ↓
Reliable data
    ↓
Explainable AI
    ↓
Useful recommendations
    ↓
Safe automation
```

Do not reverse this order.

The product’s long-term value depends on the quality of its records, calculations, data, and user trust—not merely on the number of AI features.
