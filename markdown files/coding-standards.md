# TrackMyProps Coding Standards

## 1. Purpose

This document defines mandatory coding standards for all TrackMyProps projects:

```text
TrackMyProps/
├── frontend/
├── backend/
├── ai-platform/
└── data-platform/
```

These standards apply to human-written code, Codex-generated code, tests, scripts, database migrations, prompts, agent configurations, CI/CD definitions, infrastructure configuration, and documentation.

The goals are consistency, maintainability, security, correctness, traceability, testability, readability, operational reliability, and safe AI-assisted development.

A pull request is not complete merely because the code runs. It must comply with these standards.

## 2. Core engineering principles

### 2.1 Clarity over cleverness

Prefer code another engineer can understand quickly. Avoid compressed logic, obscure features, unnecessary metaprogramming, deep nesting, unexplained abstractions, and clever one-line implementations.

### 2.2 Explicit boundaries

Every module must have a clear responsibility. Do not mix database access with UI rendering, API routing with business logic, model-provider calls with agent orchestration, or raw ingestion with curated publishing.

### 2.3 Deterministic code for deterministic work

Use code, not an LLM, for financial calculations, validation, permission checks, cache keys, identifiers, date handling, schema transformations, constraints, and approval checks.

### 2.4 Configuration over hardcoding

Environment-specific values must come from environment variables, configuration, feature flags, database configuration, or Secret Manager.

Never hardcode credentials, project IDs, API keys, production URLs, service identifiers, mutable policy values, or model names that should be configurable.

### 2.5 Fail visibly

Do not silently suppress failures. Errors must be classified, use stable codes, include trace IDs, preserve the original exception internally, expose only safe information, and be logged with useful context.

### 2.6 Safe defaults

Default behaviour must be conservative:

- AI-generated email remains a draft.
- Destructive operations are disabled.
- Optional providers are disabled until configured.
- User-specific caching is preferred when scope is uncertain.
- Invalid AI output is rejected.
- Critical data-quality failures block publishing.
- Production debug logging is disabled.

### 2.7 Version important behaviour

Version APIs, events, prompts, agents, calculation engines, schemas, datasets, pipelines, model-routing policies, cache-key strategies, and document parsers.

## 3. Repository-wide requirements

Every project must contain:

```text
README.md
SETUP.md
SKILL.md
.env.example
.gitignore
tests/
docs/
```

Each project must document:

- local setup;
- start command;
- test command;
- lint command;
- formatting command;
- dependency locking;
- deployment process;
- health checks where applicable;
- required environment variables.

No repository may depend on undocumented manual steps.

## 4. Naming conventions

### 4.1 General names

Use descriptive, domain-specific names.

Good:

```text
property_valuation
loan_balance
weekly_rent
portfolio_health_score
agent_execution_id
dataset_version
```

Avoid vague names such as:

```text
data
value
item
thing
obj
temp
result2
misc
helper
```

### 4.2 Boolean names

Use question-like names:

```text
is_active
has_loan
can_send_email
requires_review
was_cache_hit
```

### 4.3 Collections

Use plural nouns:

```text
properties
loans
expenses
recommendations
dataset_versions
```

### 4.4 Identifiers

Use explicit suffixes:

```text
user_id
property_id
household_id
execution_id
source_id
dataset_id
```

### 4.5 Dates and times

Use semantic names:

```text
created_at
updated_at
effective_date
published_at
expires_at
settlement_date
lease_end_date
```

## 5. JavaScript frontend standards

The frontend uses JavaScript with Expo and React Native.

### 5.1 Language rules

Use modern stable JavaScript supported by the selected Expo version.

Use:

- `const` by default;
- `let` only when reassignment is required;
- `async` and `await`;
- optional chaining;
- nullish coalescing;
- named exports for reusable modules.

Avoid:

- `var`;
- implicit globals;
- loose equality;
- callback pyramids;
- prototype modification;
- `eval`;
- unsafe dynamic code.

Always use strict equality.

### 5.2 Formatting

Use Prettier.

Recommended defaults:

```text
semi: true
singleQuote: true
trailingComma: all
printWidth: 100
tabWidth: 2
```

Formatting must be automated.

### 5.3 Linting

Use ESLint with rules for React, React Hooks, imports, unused variables, shadowing, unsafe coercion, accessibility where supported, and production console use.

Any ignored rule must be justified.

### 5.4 Module structure

Use domain-oriented modules:

```text
src/
├── features/
│   ├── properties/
│   ├── loans/
│   ├── portfolio/
│   ├── recommendations/
│   └── learning/
├── components/
├── hooks/
├── services/
├── stores/
├── schemas/
├── utils/
└── constants/
```

### 5.5 Components

Components must:

- have one primary responsibility;
- accept explicit props;
- avoid direct API calls during rendering;
- expose loading, empty, error, and success states;
- remain understandable and testable.

Components exceeding roughly 250 lines should be reviewed for decomposition.

### 5.6 Hooks

Custom hooks must:

- start with `use`;
- have a single clear responsibility;
- never be called conditionally;
- avoid returning oversized unstructured objects.

### 5.7 Zustand

Use Zustand for client state, such as drafts, wizard state, UI preferences, selected portfolio, offline metadata, and local filters.

Do not use Zustand as a duplicate database.

Each store must be small, explicit, resettable, and free of secrets.

### 5.8 TanStack Query

Use TanStack Query for server state.

Every query must define:

- a stable structured query key;
- query function;
- enabled condition;
- stale time where appropriate;
- retry policy;
- error behaviour;
- invalidation behaviour.

Good keys:

```javascript
['property', propertyId]
['portfolio', householdId, 'summary']
['recommendations', propertyId, filters]
```

Mutations must explicitly invalidate or update relevant query data.

### 5.9 Forms

Use React Hook Form with Zod or the approved validation library.

Frontend validation improves user experience but is not a security boundary.

Financial forms must define currency, units, optionality, ranges, decimals, effective dates, and clear messages.

### 5.10 Screen states

Every data screen must support:

- initial loading;
- refresh loading;
- empty state;
- recoverable error;
- non-recoverable error;
- stale data indication;
- offline state where relevant.

### 5.11 Accessibility

Use accessible labels, roles, state attributes, sufficient touch targets, scalable text, keyboard support on web, and non-colour-only status indicators.

### 5.12 Frontend logging

Do not use raw `console.log` in production code. Use an approved logger that redacts sensitive values and supports levels and trace IDs.

## 6. Python standards

The backend, AI platform, and data platform use Python.

### 6.1 Version

Use Python 3.12 or the approved stable version. Keep `pyproject.toml`, Docker, CI, and documentation aligned.

### 6.2 Formatting and linting

Use Ruff formatting and linting, or Black plus Ruff if explicitly configured.

Recommended line length: 100.

Enable rules covering imports, bugs, modernisation, exceptions, naming, and security-oriented checks.

### 6.3 Type checking

Use MyPy or Pyright in strict or near-strict mode.

Public functions require parameter and return types. Keep `Any` narrowly scoped and validate it at boundaries.

### 6.4 Docstrings

Public modules, classes, and non-obvious functions require useful docstrings explaining purpose, parameters, return values, exceptions, side effects, and assumptions.

### 6.5 Functions

Functions should perform one logical task, avoid excessive branching, use clear return types, and have limited parameters.

Functions larger than roughly 50 lines should be reviewed for decomposition.

### 6.6 Classes

Use classes for stateful services, adapters, repositories, domain entities, policies, and registries. Do not create classes merely to group unrelated static methods.

### 6.7 Pydantic, dataclasses, and ORM models

Use:

- Pydantic for API input, configuration, structured AI output, and external boundaries;
- dataclasses for internal immutable value objects where suitable;
- SQLAlchemy models for persistence.

Do not expose SQLAlchemy models directly as API schemas.

### 6.8 Exceptions

Create explicit domain exceptions with stable error codes. Do not raise generic `Exception` for expected business failures.

Do not broadly catch errors unless context is added and the error is re-raised or safely mapped.

### 6.9 Async code

Use async for external HTTP, async database access, streaming, events, and concurrent independent tools.

Do not run blocking work in async handlers without isolation. Bound concurrency.

### 6.10 Imports

Order imports as standard library, third-party, then application imports. Prefer absolute imports and avoid cycles.

### 6.11 Python logging

Use structured logging with fields such as:

```text
event
trace_id
request_id
user_scope_id
property_id
execution_id
duration_ms
status
error_code
```

Never log secrets, tokens, private documents, service-role keys, or unnecessary personal information.

## 7. FastAPI standards

### 7.1 Routers

Routers must parse requests, call services, map responses, and map domain errors.

Routers must not contain SQL, complex business rules, financial calculations, or direct model-provider calls.

### 7.2 Dependencies

Use FastAPI dependencies for authentication, sessions, service construction, request context, feature flags, and entitlement checks.

Avoid hidden mutable globals.

### 7.3 Schemas

Every endpoint must define request and response schemas where applicable. Do not return arbitrary dictionaries for stable contracts.

### 7.4 Errors

Use a consistent structure:

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

Never expose stack traces to clients.

### 7.5 HTTP status codes

Use correct status codes, including 200, 201, 202, 204, 400, 401, 403, 404, 409, 422, 429, 500, and 503.

### 7.6 Pagination

Use pagination for growing collections. Support page-based or cursor-based designs consistently.

### 7.7 Idempotency

Use idempotency keys for AI execution creation, EOI sending, webhook processing, payment operations, and expensive duplicate-prone jobs.

### 7.8 OpenAPI

OpenAPI documentation must include summaries, descriptions, schemas, authentication, and error responses.

## 8. SQLAlchemy standards

### 8.1 Separation

Keep persistence models, domain models, and API schemas separate.

### 8.2 Naming

Use singular Python class names and plural table names.

### 8.3 Primary keys

Use UUIDs unless an ADR approves another strategy.

### 8.4 Timestamps

Use timezone-aware UTC fields:

```text
created_at
updated_at
deleted_at
```

### 8.5 Soft deletion

Use soft deletion for important records requiring recovery or audit, not automatically for every transient operational table.

### 8.6 Constraints

Enforce uniqueness, referential integrity, required fields, ranges, and valid states at database level.

### 8.7 Transactions

Use short transactions for changes that must succeed together. Never hold a transaction open while calling a slow external provider.

### 8.8 Queries

Avoid N+1 queries, unbounded results, string-built SQL, hidden lazy loads, and unnecessary full-object loading.

### 8.9 Repositories

Repositories own persistence access. They must not contain UI logic, AI calls, email sending, or complex policy decisions.

## 9. Alembic standards

Every schema change requires a version-controlled migration.

Migration names must be descriptive, such as:

```text
add_property_valuation_history
create_ai_execution_events
add_dataset_quality_score
```

Migrations must be deterministic, reviewed, tested, safe for production, and reversible where practical.

Separate large data backfills from schema migrations.

Use expand-and-contract patterns for breaking changes.

Avoid dropping columns immediately, long blocking rewrites, unsafe non-null additions, and large updates in one transaction.

## 10. SQL standards

Raw SQL must be parameterised, explicit, documented, and stored in source control.

Avoid `SELECT *` in production queries.

Use lower snake case for database objects.

Review query plans for expensive queries.

## 11. Financial calculation standards

Authoritative financial calculations must be deterministic and centralised.

Rules:

- use `Decimal` for currency;
- define rounding;
- define currency;
- define period and units;
- define sign convention;
- expose assumptions;
- version calculation logic;
- test boundaries and edge cases.

Never use binary floating point for authoritative totals.

Each calculation must document formula, inputs, units, assumptions, outputs, and limitations.

## 12. AI platform standards

### 12.1 Agent definitions

Every agent requires a stable ID, semantic version, typed input and output, tool allowlist, prompt version, execution policy, cache policy, model policy, and evaluation suite.

### 12.2 Structured output

Use Pydantic models. Do not parse critical values from unstructured prose.

### 12.3 Tools

Tools must have typed input and output, explicit registration, permission checks, timeouts, safe retries, side-effect classification, redaction, and tests.

### 12.4 Prompts

Prompts must be versioned, secret-free, evaluated, documented, and separated by system policy, task template, examples, and output format.

### 12.5 LangGraph nodes

Nodes must be small, typed, cancellable, observable, and explicit about reducers and side effects.

### 12.6 Reasoning visibility

Do not expose private chain-of-thought. Return evidence, assumptions, concise explanations, calculations, uncertainty, and alternatives.

### 12.7 Provider adapters

Keep vendor-specific logic behind adapters. Avoid provider conditionals throughout agents.

### 12.8 AI failures

Reject malformed output. Never invent missing evidence, silently truncate critical fields, or treat provider failures as valid recommendations.

## 13. Data platform standards

### 13.1 Pipeline stages

Keep these stages separate:

```text
extract
stage
normalise
match
validate
publish
```

### 13.2 Idempotency

Every pipeline must be safely rerunnable using source versions, checksums, partitions, cursors, publication IDs, or stable keys.

### 13.3 Raw data

Raw artefacts are immutable.

### 13.4 Transformations

Transformations must be deterministic, versioned, schema-driven, source-traceable, tested, and explicit about missing values.

### 13.5 Quality

Critical failures block publishing. Warnings must be recorded and scored.

### 13.6 Dataframes

Prefer Polars for new large transformations. Use explicit schemas where known.

### 13.7 Browser automation

Playwright automation must be isolated, rate limited, lawful, monitored for structural change, and protected by a kill switch. Never bypass anti-bot controls.

## 14. API contract standards

Version all contracts using OpenAPI, JSON Schema, Pydantic schemas, event schemas, or generated clients.

Classify changes as backward compatible, conditionally compatible, or breaking.

Breaking changes require a version update, migration plan, consumer review, and deprecation period where practical.

## 15. Event standards

Events must contain:

```text
event_id
event_type
event_version
occurred_at
producer
trace_id
payload
```

Events must be immutable, idempotent, minimal, versioned, retry-safe, and free of unnecessary sensitive data.

## 16. Validation standards

Validate all external boundaries:

- API input;
- webhooks;
- configuration;
- model output;
- external API responses;
- file metadata;
- dataset schemas;
- events;
- cache content;
- database constraints.

Do not trust another TrackMyProps service automatically.

## 17. Error handling standards

Classify errors as:

```text
validation
authentication
authorisation
not_found
conflict
rate_limit
external_provider
timeout
data_quality
model_output
database
configuration
internal
```

Every error log must include category, code, trace ID, safe context, exception type, and retryability.

## 18. Logging standards

Use structured JSON logs.

Good:

```json
{
  "event": "property.created",
  "property_id": "uuid",
  "household_id": "uuid",
  "trace_id": "uuid",
  "duration_ms": 42
}
```

Use levels consistently:

- DEBUG for development diagnostics;
- INFO for normal operations;
- WARNING for degraded operation;
- ERROR for failed operations;
- CRITICAL for major service or security impact.

## 19. Tracing and metrics

Use shared trace IDs across projects.

Track:

- API latency;
- error rate;
- database duration;
- cache hit rate;
- AI token use;
- AI cost;
- agent success rate;
- job duration;
- rows processed;
- data-quality score;
- event delivery;
- notification success.

Avoid high-cardinality metric labels.

## 20. Security standards

Mandatory controls:

- no secrets in code;
- no service-role keys in frontend;
- parameterised SQL;
- dependency scanning;
- secret scanning;
- least privilege;
- authenticated internal APIs;
- signed storage URLs;
- upload validation;
- rate limiting;
- audit logging;
- prompt-injection controls;
- tool allowlists;
- output encoding;
- secure headers;
- controlled CORS.

Security exceptions require an ADR and explicit approval.

## 21. Privacy standards

Code must support data minimisation, user and household isolation, correction, export, deletion, retention, auditability, and de-identification for analytics.

Do not log unnecessary financial data, globally cache user-specific output, mix AI memory across users, use production personal data in tests, or commit restricted datasets.

## 22. Testing standards

Every meaningful feature requires tests.

Use many unit tests, focused integration tests, contract tests, and a smaller number of end-to-end tests.

Test names should describe behaviour.

Use Arrange, Act, Assert.

Tests must not depend on real current time without freezing, production APIs, execution order, unseeded randomness, or developer-machine state.

Fixtures must be minimal, synthetic or legally distributable, and free of secrets.

Mock external boundaries, not internal implementation details.

Critical areas requiring strong coverage:

- financial calculations;
- authorisation;
- approval workflows;
- AI structured output;
- cache isolation;
- data publishing;
- migrations;
- event idempotency.

## 23. Frontend testing

Test component states, forms, navigation decisions, Zustand actions, query invalidation, offline queues, EOI approval, accessibility labels, and error states.

Prefer user-visible behaviour over implementation details.

## 24. Backend testing

Test API contracts, authentication, authorisation, CRUD, calculations, transactions, idempotency, webhooks, approvals, email boundaries, database constraints, and migrations.

Use real PostgreSQL for important integration tests.

## 25. AI testing

Test registration, prompt rendering, tool permissions, output validation, graph routing, checkpoint recovery, cancellation, cache keys, cross-user isolation, fallback, and prompt-injection handling.

Paid live-model tests must be opt-in.

## 26. Data testing

Test source contracts, parsers, schema changes, incremental ingestion, idempotency, deduplication, history, geospatial logic, quality gates, lineage, publishing, rollback, and backfills.

## 27. Git standards

Use short-lived branches.

Examples:

```text
feature/property-expense-tracking
fix/loan-calculation-rounding
chore/update-python
docs/ai-cache-policy
```

Commit messages must be clear and imperative.

Good:

```text
Add portfolio cash-flow calculation
Fix duplicate EOI submission
Document prediction cache invalidation
```

Keep commits logically cohesive.

## 28. Pull request standards

Every pull request must include:

- purpose;
- summary;
- affected projects;
- screenshots for UI changes;
- migration notes;
- API or event changes;
- test evidence;
- security considerations;
- deployment and rollback considerations;
- setup-variable changes;
- documentation changes.

Do not approve when tests fail, secrets exist, migration safety is unclear, business rules are duplicated, API changes are unversioned, AI output is unvalidated, approval is bypassed, or licence rules are ignored.

## 29. Code review checklist

Review correctness, architecture, security, reliability, testing, and documentation.

Questions include:

- Does it satisfy the requirement?
- Are edge cases covered?
- Are boundaries respected?
- Are permissions enforced?
- Could data leak across users?
- Are retries safe?
- Is the operation idempotent?
- Is rollback possible?
- Are tests meaningful?
- Is setup documentation updated?
- Is an ADR required?

## 30. Documentation standards

Documentation must be accurate, executable, maintained with code, explicit about prerequisites, and free of real secrets.

Commands must be copyable.

Every README must include purpose, architecture summary, prerequisites, setup, variables, start, test, lint, deployment, and troubleshooting.

## 31. Comments

Comments should explain why, constraints, non-obvious trade-offs, external requirements, and safety boundaries.

Do not comment obvious syntax.

Remove stale comments.

## 32. TODO standards

TODOs must include a clear task, issue or owner, reason, and impact.

Example:

```python
# TODO(TMP-214): Replace temporary provider mapping after licensed feed v2 is enabled.
```

Critical security, correctness, or integrity TODOs block release.

## 33. Dependencies

Dependencies must be necessary, maintained, licence compatible, locked, and reviewed for security.

Before adding one, consider whether the standard library or an existing dependency is sufficient.

Remove unused dependencies.

## 34. Configuration

Configuration must be typed, validated at startup, environment-specific, documented, and safe by default.

Production services must fail startup when required configuration is missing.

Optional integrations must report disabled status clearly.

## 35. Date and time

Store timestamps in UTC and use timezone-aware values.

Use `Australia/Sydney` only for user-facing display or explicitly local schedules.

Do not perform date arithmetic on formatted strings.

Test daylight-saving transitions.

## 36. Currency and units

Every amount must include or inherit an explicit currency. Initial default is AUD.

Every metric must define units.

Prefer explicit names such as:

```text
weekly_rent_aud
loan_balance_aud
distance_metres
land_area_square_metres
interest_rate_percent
vacancy_rate_percent
```

## 37. Feature flags

Flags must have stable names, owners, defaults, environment awareness, and removal dates when temporary.

Flags must never bypass security, entitlements, approvals, or data integrity.

## 38. Performance

Measure before optimising.

Track endpoint latency, query count, database duration, rendering, model latency, pipeline duration, and memory use.

Expected practices:

- paginate lists;
- index real query patterns;
- virtualise large frontend lists;
- run expensive AI asynchronously;
- use bulk data operations;
- avoid duplicate network calls.

## 39. User experience completion

A feature is incomplete when loading is unclear, errors are unrecoverable, empty states are missing, validation is confusing, stale data appears current, AI uncertainty is hidden, or consequential actions lack confirmation.

## 40. Codex operating rules

Codex must:

1. inspect existing files before creating overlapping code;
2. preserve the architecture;
3. avoid inventing credentials, endpoints, licences, or source semantics;
4. create complete implementations instead of isolated snippets;
5. add tests for meaningful changes;
6. update documentation and `.env.example`;
7. run formatting, linting, type checks, and tests;
8. report failures honestly;
9. avoid unrelated broad refactoring;
10. never weaken security to make tests pass;
11. never bypass user approval;
12. never add third-party data access without documented permission;
13. not claim completion while critical placeholders or TODOs remain undocumented;
14. create ADRs for major deviations;
15. keep changes scoped and reviewable.

## 41. Definition of done

Code is complete only when:

- architecture is respected;
- formatting passes;
- linting passes;
- type checking passes where applicable;
- tests pass;
- new behaviour is tested;
- errors are handled;
- logs are structured;
- security boundaries remain intact;
- environment variables are documented;
- migrations are included where required;
- contracts are updated;
- setup documentation is updated;
- no secrets are committed;
- no critical TODO is hidden;
- user-facing states are complete;
- AI outputs are validated;
- data-quality rules are enforced;
- deployment impact is documented.

## 42. Final standard

The standard is not only:

```text
Does the code work?
```

The standard is:

```text
Is the code correct, secure, understandable, testable, traceable,
maintainable, operationally safe, and consistent with the architecture?
```
