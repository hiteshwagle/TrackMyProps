# TrackMyProps Codex Agent Instructions

## 1. Mission

Build TrackMyProps as a simple, readable, auditable, secure, and maintainable property-investment platform.

The repository contains a folder named:

```text
markdown files/
```

This folder contains the product, architecture, database, API, AI, security, privacy, deployment, testing, and operational documentation for the project.

Treat those Markdown files as the primary source of truth.

Do not attempt to build the entire application in one task.

Work in small, complete, reviewable vertical slices.

---

## 1.1 Current MVP scope override

The accepted MVP is an owner-only property portfolio application.

Treat “single end-user” as one private portfolio per authenticated account, not one hardcoded global user. Multiple accounts may exist, but they cannot share or access each other's data.

For the MVP:

* the only application role is owner;
* do not implement households, memberships, invitations, role management, or shared portfolios;
* every owner-scoped row requires backend ownership checks, simple RLS, and cross-account denial tests;
* property income and expenses are named child line items, not dynamic columns or executable expressions;
* use the approved remote Supabase development environment; do not require a local Supabase runtime;
* keep all development credentials and generated project-link state outside source control;
* do not start frontend feature coding until the relevant contracts, migration, RLS policies, and backend boundaries are approved.

The detailed source of truth is:

```text
markdown files/mvp-owner-portfolio-scope.md
```

Broader household and collaboration requirements are deferred post-MVP.

---

# 2. Core engineering philosophy

The project must remain:

* simple;
* readable;
* auditable;
* minimal;
* robust;
* secure;
* easy to test;
* easy to operate;
* easy for another developer to understand.

Prefer the smallest correct solution.

Do not create abstraction merely because it may be useful later.

Do not create code for hypothetical future features.

Do not add an extra framework, service, repository, package, interface, base class, helper, queue, cache, factory, event, or configuration layer unless the current requirement clearly needs it.

Every new component must justify its existence.

---

# 3. Mandatory simplicity rules

Follow these rules throughout the project:

1. Write only code required by the current accepted feature.
2. Prefer plain functions over unnecessary classes.
3. Prefer explicit code over metaprogramming.
4. Prefer direct dependencies over service-locator patterns.
5. Prefer small modules with one clear responsibility.
6. Avoid deep inheritance.
7. Avoid generic repository frameworks.
8. Avoid speculative abstractions.
9. Avoid duplicated business logic.
10. Avoid premature microservices.
11. Avoid hidden side effects.
12. Avoid global mutable state.
13. Avoid magic values.
14. Avoid dynamic imports unless required.
15. Avoid clever code that reduces readability.
16. Keep configuration explicit.
17. Keep control flow easy to follow.
18. Use descriptive names.
19. Write short functions.
20. Delete unused code immediately.

Before adding code, ask:

```text
Is this needed now?
Can this be implemented more simply?
Can an existing function safely handle it?
Will another developer understand it quickly?
Can it be tested independently?
```

---

# 4. Source-of-truth documents

Before making changes, inspect the relevant files inside:

```text
markdown files/
```

At the beginning of the project, read at minimum:

```text
markdown files/README.md
markdown files/architecture.md
markdown files/connections.md
markdown files/coding-standards.md
markdown files/database.md
markdown files/contracts.md
markdown files/api-design.md
markdown files/security.md
markdown files/privacy-and-retention.md
markdown files/testing-strategy.md
markdown files/deployment-and-devops.md
markdown files/PROJECT_ROADMAP.md
markdown files/feature-specifications.md
markdown files/permissions-matrix.md
markdown files/calculation-specification.md
```

Also inspect the project-specific guidance where relevant:

```text
markdown files/frontend_SKILL.md
markdown files/backend_SKILL.md
markdown files/ai-platform_SKILL.md
markdown files/data-platform_SKILL.md
```

Do not silently override or reinterpret these documents.

When documents conflict:

1. identify the conflict;
2. do not guess;
3. record the conflict;
4. select the safest minimal temporary assumption only when implementation cannot proceed otherwise;
5. clearly document that assumption.

Do not invent provider access, API agreements, legal rights, licensing rights, pricing, credentials, or production infrastructure.

---

# 5. Target repository structure

Create and maintain this monorepo structure:

```text
trackmyprops/
├── AGENTS.md
├── README.md
├── markdown files/
├── frontend/
├── backend/
├── ai-platform/
├── data-platform/
├── contracts/
├── supabase/
├── infrastructure/
├── scripts/
├── tests/
└── .github/
```

Do not split the project into multiple Git repositories unless an approved architecture decision explicitly requires it.

The four application projects remain independently deployable:

```text
frontend
backend
ai-platform
data-platform
```

---

# 6. Technology decisions

Use the following approved technologies unless the documentation explicitly changes them.

## Frontend

```text
TypeScript
Expo React Native
TanStack Query
Zustand
Expo EAS
```

Use TypeScript rather than plain JavaScript unless an existing implementation already establishes otherwise.

## Backend

```text
Python
FastAPI
Pydantic
SQLAlchemy
Alembic
PostgreSQL
Supabase Auth
Supabase Storage
Supabase Realtime
```

## AI platform

```text
Python
FastAPI
LangGraph
Pydantic
approved AI-provider SDKs
```

## Data platform

```text
Python
Cloud Run Jobs
Cloud Scheduler
PostgreSQL
approved public or licensed data sources
```

## Supabase

```text
PostgreSQL SQL
PL/pgSQL where genuinely required
TypeScript/Deno only for optional Edge Functions
```

Supabase Edge Functions are not the main backend.

## Infrastructure

```text
Terraform
Google Cloud Run
Google Cloud Run Jobs
Google Artifact Registry
Google Secret Manager
Google Cloud Logging
Google Cloud Monitoring
```

## CI/CD

```text
GitHub Actions
YAML
```

---

# 7. Architecture boundaries

These boundaries are mandatory.

## Frontend

The frontend may:

* authenticate through approved Supabase client functionality;
* call the public backend API;
* upload using backend-approved signed URLs;
* subscribe to approved realtime updates.

The frontend must not:

* call the AI platform directly;
* contain service-role keys;
* contain database credentials;
* contain AI-provider secrets;
* implement authoritative financial calculations;
* decide permissions;
* send EOI or external communication directly;
* call commercial property providers directly.

## Backend

The backend is the authoritative business layer.

It owns:

* authentication validation;
* authorisation;
* household access;
* property records;
* loans;
* income;
* expenses;
* leases;
* valuations;
* deterministic calculations;
* scenarios;
* approvals;
* notifications;
* billing entitlements;
* communication sending;
* audit events;
* data export;
* account deletion.

## AI platform

The AI platform owns:

* AI execution;
* LangGraph orchestration;
* agents;
* prompts;
* model-provider abstraction;
* structured output validation;
* checkpoints;
* AI caching;
* evaluations;
* AI cost tracking.

It must not directly:

* modify core property records;
* modify loans;
* send email;
* charge users;
* change permissions;
* delete user data;
* run arbitrary SQL;
* call arbitrary URLs.

It must use narrowly scoped backend tools.

## Data platform

The data platform owns:

* ingestion;
* raw artefacts;
* staging;
* canonical models;
* curated datasets;
* quality checks;
* lineage;
* publication;
* source and licence metadata.

The backend and AI platform should consume approved curated data, not uncontrolled raw provider payloads.

---

# 8. Supabase Edge Function rules

Do not introduce Supabase Edge Functions by default.

Use them only for a concrete, small, Supabase-specific requirement such as:

* Auth hook;
* lightweight Storage event;
* simple webhook adapter;
* small Supabase-specific bridge.

Core business logic remains in the Python FastAPI backend on Cloud Run.

Before adding an Edge Function, document:

```text
Why Cloud Run is not sufficient
Why the function must run near Supabase
Inputs
Outputs
Authentication
Timeout
Retry behaviour
Failure behaviour
Owner
Tests
```

If these cannot be explained clearly, do not create the Edge Function.

---

# 9. Coding standards

## General

* Keep modules focused.
* Keep public interfaces small.
* Use explicit types.
* Use clear domain names.
* Use dependency injection only where it improves testability or separation.
* Avoid a dependency-injection framework unless required.
* Use comments only when the reason is not clear from the code.
* Do not comment obvious code.
* Remove dead code.
* Do not leave commented-out code.
* Do not leave unfinished TODOs without an issue or documented reason.

## Python

* Use current supported Python version approved by the repository.
* Use type hints.
* Use Pydantic at API boundaries.
* Use SQLAlchemy for persistence.
* Use `Decimal` for financial values.
* Never use binary floating-point values for money.
* Keep FastAPI route handlers thin.
* Put business logic in small domain or service functions.
* Keep transactions explicit.
* Avoid generic CRUD frameworks.
* Avoid a repository class for every table unless it adds real value.
* Prefer clear SQLAlchemy queries over complex ORM magic.
* Validate all external provider responses.

## TypeScript

* Enable strict TypeScript settings.
* Avoid `any`.
* Use generated or shared API types where practical.
* Keep business logic out of presentation components.
* Use TanStack Query for server state.
* Use Zustand only for genuine local or cross-screen client state.
* Do not mirror all server data into Zustand.
* Keep components small and accessible.
* Avoid one giant global store.
* Avoid unnecessary custom hooks.

## SQL

* Use migrations for every database change.
* Use constraints.
* Use foreign keys.
* Use indexes based on actual query patterns.
* Use row-level security.
* Add cross-account denial tests for the owner-only MVP and cross-household denial tests if collaboration is later approved.
* Keep database functions small.
* Avoid business logic duplication between SQL and Python.
* Never disable RLS as a shortcut.

---

# 10. Financial calculation rules

Financial calculations must be:

* deterministic;
* versioned;
* testable;
* reproducible;
* performed by backend code;
* based on explicit inputs;
* clear about missing information.

Use:

```text
Decimal
```

Do not use:

```text
float
```

for money, percentages, rates, loan balances, property values, sale proceeds, or financial results.

Do not convert:

```text
missing
unknown
not supplied
not applicable
```

into:

```text
0
```

Calculations must identify:

* formula version;
* inputs;
* assumptions;
* result;
* excluded costs;
* missing inputs.

AI agents may explain calculation results, but they must not independently calculate authoritative values.

---

# 11. Security rules

Every owner-scoped MVP resource and every future household-scoped resource must be protected by:

* backend authorisation;
* database row-level security;
* automated negative tests.

For every owner-scoped MVP resource, test at least:

```text
owner access
different authenticated user denial
unauthenticated denial
owner identifier reassignment denial
```

Post-MVP household resources additionally require member, viewer, inactive-member, and cross-household tests.

Do not trust:

* frontend-supplied roles;
* frontend feature flags;
* user-supplied household IDs;
* client-calculated entitlements.

Do not log:

* access tokens;
* service keys;
* complete documents;
* full EOI bodies;
* passwords;
* raw secrets;
* unnecessary personal information.

All internal service calls must be authenticated.

---

# 12. Privacy rules

Apply:

* data minimisation;
* purpose limitation;
* retention rules;
* deletion support;
* export support;
* user correction;
* consent versioning where needed;
* auditability.

Production user data must not be used for general model training by default.

Derived data must be included in deletion design:

* AI cache;
* embeddings;
* AI memory;
* exports;
* generated documents;
* provider copies where applicable.

---

# 13. AI rules

Every production agent must define:

```text
agent_id
agent_version
prompt_version
model
provider
input_schema
output_schema
tool_versions
cache_policy
evaluation_suite
owner
```

AI outputs must be structured and validated.

Where appropriate, include:

```text
summary
facts
assumptions
evidence
confidence
freshness
missing_information
risks
limitations
suggested_next_steps
```

Do not expose hidden chain-of-thought.

Do not claim certainty where evidence is incomplete.

Do not create unrestricted AI tools.

Do not let AI send email.

For EOI or similar communication:

```text
AI creates draft
User reviews exact draft
Authorised user approves exact draft and recipient
Backend sends
```

Editing the draft must invalidate prior approval.

---

# 14. Data-source rules

Use only:

* official public sources;
* explicitly approved APIs;
* contractually licensed feeds;
* approved test fixtures.

Do not implement unauthorised scraping.

For every external source, record:

```text
source
owner
licence
allowed use
storage rights
display rights
cache rights
AI-processing rights
attribution
refresh frequency
retention
```

Keep provider-specific formats behind adapters.

---

# 15. API rules

Public API prefix:

```text
/api/v1
```

Internal API prefix:

```text
/internal/v1
```

Use:

* stable error codes;
* explicit schemas;
* pagination;
* idempotency for consequential writes;
* request IDs;
* trace IDs;
* timeouts;
* bounded retries.

Long-running work must return an operation or execution ID rather than keeping one request open indefinitely.

Do not make breaking changes inside an existing supported major version.

---

# 16. Testing rules

No feature is complete without tests.

Use the appropriate combination of:

* unit tests;
* integration tests;
* API contract tests;
* database tests;
* RLS tests;
* migration tests;
* event tests;
* frontend component tests;
* end-to-end tests;
* AI evaluation tests;
* prompt-injection tests;
* provider-adapter tests;
* performance tests.

Tests should verify observable behaviour, not internal implementation unnecessarily.

Every bug fix requires a regression test where practical.

---

# 17. Observability rules

Every production service must provide:

* health endpoint;
* readiness endpoint;
* structured logs;
* request or execution ID;
* trace propagation;
* error metrics;
* latency metrics;
* version metadata.

Do not add excessive logging.

Prefer one useful structured log event over several low-value debug messages.

---

# 18. Dependency rules

Before adding a dependency:

1. confirm existing standard-library or project code is insufficient;
2. inspect maintenance and licence;
3. confirm the dependency materially reduces complexity;
4. document why it is needed;
5. pin or lock it.

Do not add a package for a trivial helper function.

Do not add two packages for the same purpose.

Prefer established libraries over obscure ones.

---

# 19. File and module size

Keep files understandable.

Guidance:

* functions should usually perform one operation;
* avoid functions with many branches;
* avoid modules that combine unrelated domains;
* split only when there is a clear responsibility boundary.

Do not split files merely to meet an arbitrary line count.

Readability is more important than artificial file-size limits.

---

# 20. Initial project workflow

Do not immediately implement application features.

Follow these stages.

## Stage 1 — Documentation audit

Read the Markdown files.

Create:

```text
markdown files/implementation-findings.md
markdown files/phase-0-implementation-plan.md
```

The findings must include:

* architecture summary;
* unresolved decisions;
* document conflicts;
* missing provider decisions;
* missing environment decisions;
* MVP boundaries;
* highest security risks;
* proposed minimal repository scaffold.

Do not write product code in this stage.

## Stage 2 — Repository scaffold

Create only:

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

Add:

* project-level README files;
* package/dependency files;
* linting;
* formatting;
* type checking;
* minimal health endpoints;
* minimal tests;
* `.env.example` files;
* root development commands.

Do not implement property features yet.

## Stage 3 — CI foundation

Add path-aware CI for:

* frontend;
* backend;
* AI platform;
* data platform;
* contracts;
* security scanning.

Do not deploy production resources yet.

## Stage 4 — Shared contracts

Implement only the first shared contracts:

* health response;
* error response;
* money;
* rate or percentage;
* pagination;
* idempotency;
* event envelope;
* API version metadata.

## Stage 5 — Owner identity and isolation foundation

Implement:

* profile;
* RLS;
* audit event;
* outbox event.

Do not implement properties before owner isolation is tested.

## Stage 6 — First vertical slice

Implement:

```text
sign in
create property
view property
```

Include:

* database;
* migration;
* RLS;
* backend;
* contracts;
* frontend;
* tests;
* observability;
* documentation.

## Stage 7 — Financial foundation

Implement:

```text
purchase date and price
user-provided current value
simple loan summary
principal paid
equity
```

Use deterministic calculations. For the owner-only MVP, do not implement multiple loans, loan splits, redraw, refinancing, offsets, amortisation schedules, or repayment history. Broader acquisition, ownership, valuation, and LVR modelling remains post-MVP.

## Stage 8 — Income and expenses

Implement:

```text
rental income
expenses
cash flow
yield
property dashboard
portfolio dashboard
```

## Stage 9 — AI foundation

Only after the portfolio foundation is stable, implement:

* AI execution;
* agent registry;
* one Finance Agent;
* backend calculation tools;
* structured validation;
* progress;
* evaluation;
* cost tracking.

Do not initially create every planned agent.

## Stage 10 — Data platform foundation

Start with:

* source registry;
* licence registry;
* one official public source;
* raw;
* canonical;
* curated;
* quality check;
* publication event.

Do not integrate every provider at once.

---

# 21. Vertical-slice rule

Implement one complete user journey at a time.

A feature slice should contain only what is necessary across:

```text
contracts
database
backend
frontend
tests
security
observability
documentation
```

Do not build all database tables first.

Do not build the full backend before the frontend.

Do not build all UI screens before working APIs exist.

Do not build every AI agent before one complete execution path is validated.

---

# 22. Task execution process

For every task:

## Step 1 — Read

Read the relevant Markdown documents and existing code.

## Step 2 — Inspect

Inspect current implementation before creating new code.

## Step 3 — Plan

Provide a short implementation plan.

The plan should include:

* files to change;
* tests to add;
* assumptions;
* risks;
* out-of-scope items.

## Step 4 — Implement

Implement the smallest complete solution.

## Step 5 — Validate

Run relevant:

* formatting;
* linting;
* type checking;
* tests;
* migration checks;
* contract checks;
* build.

## Step 6 — Review

Review the change for:

* unnecessary complexity;
* duplicate code;
* security;
* permissions;
* financial accuracy;
* missing tests;
* hidden side effects.

## Step 7 — Report

Return:

```text
summary
files changed
commands run
test results
assumptions
risks
remaining work
```

---

# 23. Change-size rules

Keep changes small.

Do not modify unrelated files.

Do not refactor unrelated code during feature work.

Do not rename broad directory structures without approval.

Do not reformat the entire repository as part of a small change.

If a task becomes too large:

1. stop;
2. divide it into smaller phases;
3. document the split;
4. implement only the first safe phase.

---

# 24. Auditability requirements

Every important operation must be explainable.

Code should make it easy to determine:

* who performed an action;
* which household was affected;
* which record changed;
* which calculation version was used;
* which AI agent and prompt version ran;
* which provider and dataset version supplied data;
* which communication version was approved;
* which release introduced behaviour.

Avoid hidden processing and silent mutations.

---

# 25. Error handling

Errors must be:

* explicit;
* typed or classified;
* safe for users;
* useful for operations;
* linked to trace IDs.

Do not catch broad exceptions merely to suppress them.

Do not expose stack traces or secrets to clients.

Do not silently continue after data-integrity or authorisation failures.

---

# 26. Configuration

Every new environment variable must be:

* documented;
* included in `.env.example`;
* validated at startup;
* marked secret or non-secret;
* scoped to the correct project.

Do not add configuration for hypothetical future features.

Use safe defaults only when the default is genuinely safe.

Required production configuration should fail fast when absent.

---

# 27. Definition of done

A task is complete only when:

* acceptance criteria pass;
* implementation is minimal;
* code is readable;
* tests exist;
* security is enforced;
* documentation is updated;
* configuration is documented;
* logs and errors are sufficient;
* no unused code remains;
* no unsupported assumptions are hidden;
* commands and results are reported.

---

# 28. Initial Codex task

Start with the following task:

```text
Study the TrackMyProps repository before implementing application features.

The folder named "markdown files" contains the source-of-truth product, architecture, security, API, database, AI, data, testing, deployment, and operational documents.

Read the relevant Markdown files, including at minimum:

- README.md
- architecture.md
- connections.md
- coding-standards.md
- database.md
- contracts.md
- api-design.md
- security.md
- privacy-and-retention.md
- testing-strategy.md
- deployment-and-devops.md
- PROJECT_ROADMAP.md
- feature-specifications.md
- permissions-matrix.md
- calculation-specification.md
- frontend_SKILL.md
- backend_SKILL.md
- ai-platform_SKILL.md
- data-platform_SKILL.md

All files are inside the "markdown files" folder.

Do not implement application features yet.

Complete only these tasks:

1. Summarise the intended architecture.
2. Identify contradictions, duplication, unsupported assumptions, and unresolved decisions.
3. Identify the minimum Phase 0 repository scaffold.
4. Propose the smallest implementation sequence.
5. Identify which commercial or external-provider decisions remain unresolved.
6. Identify security, privacy, data, and AI risks that must be addressed before feature development.
7. Create:
   - "markdown files/implementation-findings.md"
   - "markdown files/phase-0-implementation-plan.md"
8. Do not select providers without evidence.
9. Do not add production credentials.
10. Do not write product business logic.

Optimise for:
- minimal code;
- low complexity;
- readability;
- auditability;
- robustness;
- ease of testing;
- ease of future maintenance.

Return:
- documents read;
- architecture summary;
- contradictions;
- assumptions;
- unresolved decisions;
- proposed implementation sequence;
- files created or changed.
```

---

# 29. Second Codex task

After reviewing and approving the Phase 0 plan, use:

```text
Implement only the approved TrackMyProps Phase 0 repository scaffold.

Read:
- AGENTS.md
- "markdown files/phase-0-implementation-plan.md"
- the project-specific SKILL files
- architecture.md
- coding-standards.md
- testing-strategy.md
- deployment-and-devops.md

Create:

- frontend Expo React Native TypeScript project
- backend Python FastAPI project
- ai-platform Python FastAPI project
- data-platform Python project
- contracts structure
- Supabase migration structure
- Terraform structure
- GitHub Actions structure
- root developer commands
- project-level README files
- placeholder-only `.env.example` files
- minimal health and readiness endpoints
- minimal tests proving projects build, import, or start

Constraints:

- Do not implement product features.
- Do not add production integrations.
- Do not add commercial provider SDKs.
- Do not create unnecessary abstractions.
- Do not create generic CRUD frameworks.
- Do not create every future database table.
- Do not use Supabase Edge Functions unless a current requirement clearly requires one.
- Keep dependencies minimal.
- Keep every module simple and readable.
- Preserve all Markdown files.

Run:
- formatting
- linting
- type checks
- tests
- build validation

Return:
- implementation summary
- files created
- dependencies added and why
- commands run
- test and build results
- assumptions
- unresolved issues
- recommended next small task
```

---

# 30. Final rule

Do not optimise TrackMyProps for theoretical scale before it has real users and measured constraints.

Optimise first for:

```text
correctness
security
clarity
auditability
testability
operability
```

Then optimise performance and scale based on evidence.

The best implementation is the simplest implementation that safely satisfies the current documented requirement.
