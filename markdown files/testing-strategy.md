# TrackMyProps Testing Strategy

## 1. Purpose

This document defines the mandatory testing strategy for TrackMyProps across:

```text
TrackMyProps/
├── frontend/
├── backend/
├── ai-platform/
└── data-platform/
```

It covers:

- unit testing;
- integration testing;
- contract testing;
- end-to-end testing;
- AI evaluation;
- data-quality testing;
- security testing;
- migration testing;
- performance testing;
- resilience testing;
- test environments;
- fixtures;
- CI quality gates;
- release acceptance.

The objective is to ensure TrackMyProps is correct, secure, explainable, reproducible, and safe to operate.

---

# 2. Testing principles

1. Test behaviour, not implementation details.
2. Critical business rules require deterministic tests.
3. Financial calculations require strong boundary coverage.
4. Security controls require negative tests.
5. AI output requires structured validation and evaluation.
6. Data pipelines require idempotency and lineage tests.
7. Production APIs must have contract tests.
8. External providers must be isolated behind fakes or mocks.
9. Tests must be deterministic.
10. Every production defect should lead to a regression test.
11. Test data must be synthetic or legally distributable.
12. Live paid-provider tests must be opt-in.
13. Release gates must be automated where practical.
14. A passing happy path is not enough.
15. Failure, recovery, cancellation, and rollback must be tested.

---

# 3. Testing pyramid

Use the following balance:

```text
                End-to-end
              /            \
        Contract and integration
      /                        \
            Unit tests
```

Recommended emphasis:

- many unit tests;
- focused integration tests;
- strong contract tests;
- a smaller number of end-to-end tests;
- targeted manual exploratory testing;
- dedicated AI and data evaluation suites.

Do not rely primarily on end-to-end tests.

---

# 4. Test categories

Required categories:

```text
unit
component
integration
contract
end_to_end
migration
security
performance
resilience
accessibility
ai_evaluation
data_quality
regression
smoke
```

Each test file should clearly belong to one category.

---

# 5. Test environments

Use:

```text
local
ci
development
staging
production-smoke
```

## 5.1 Local

Purpose:

- fast developer feedback;
- unit tests;
- mocked provider tests;
- selected integration tests;
- local database tests.

## 5.2 CI

Purpose:

- clean reproducible validation;
- migration-from-zero tests;
- contract tests;
- security scans;
- deterministic AI tests;
- data-quality tests.

CI must not depend on a developer machine.

## 5.3 Development

Purpose:

- shared integration;
- feature testing;
- optional live-provider smoke tests;
- mobile preview validation.

## 5.4 Staging

Purpose:

- production-like end-to-end testing;
- migration rehearsal;
- release acceptance;
- provider and webhook validation;
- performance baselines.

## 5.5 Production smoke

Purpose:

- verify deployment health;
- use non-destructive checks;
- avoid creating real user data unless isolated test accounts are approved.

---

# 6. Test data strategy

Test data must be:

- synthetic;
- minimal;
- deterministic;
- readable;
- representative;
- free of secrets;
- legally distributable;
- isolated by test.

Do not use real production property, financial, user, tenant, document, or licensed-provider data in source-controlled fixtures.

Use factories for:

- users;
- households;
- properties;
- loans;
- leases;
- expenses;
- income;
- valuations;
- recommendations;
- AI executions;
- datasets;
- listings.

---

# 7. Time and randomness

Tests must not depend on real current time.

Use time freezing.

Seed randomness.

Explicitly test:

- daylight-saving transitions;
- leap years;
- month-end;
- financial year boundaries;
- loan fixed-rate expiry;
- lease expiry;
- stale-data thresholds.

Default user timezone:

```text
Australia/Sydney
```

Store application timestamps in UTC.

---

# 8. Frontend testing

## 8.1 Tools

Use the approved Expo and React Native testing stack, such as:

- Jest;
- React Native Testing Library;
- Expo-compatible mocks;
- Playwright for web where applicable;
- Maestro or approved mobile end-to-end tooling.

## 8.2 Component tests

Test:

- loading;
- empty;
- success;
- recoverable error;
- non-recoverable error;
- stale data;
- offline state;
- disabled actions;
- accessibility labels;
- user interaction.

## 8.3 Form tests

Test:

- required fields;
- numeric ranges;
- decimal handling;
- invalid dates;
- currency;
- units;
- cross-field validation;
- submission;
- server errors;
- duplicate submission prevention.

## 8.4 Zustand tests

Test:

- initial state;
- actions;
- reset;
- persistence where enabled;
- no server-state duplication;
- no cross-user retained state after logout.

## 8.5 TanStack Query tests

Test:

- query keys;
- loading;
- retry;
- invalidation;
- optimistic update;
- rollback;
- stale-time behaviour;
- cache clearing on logout.

## 8.6 Navigation tests

Test:

- unauthenticated routes;
- onboarding;
- household selection;
- deep links;
- invalid resource IDs;
- permission-denied routes;
- back navigation;
- modal dismissal.

## 8.7 Accessibility

Test:

- labels;
- roles;
- focus;
- keyboard navigation on web;
- scalable text;
- non-colour-only indicators;
- touch target size through review.

## 8.8 Frontend end-to-end journeys

Required journeys:

1. Register and create household.
2. Add property.
3. Add loan, income, expense, lease, and valuation.
4. View portfolio dashboard.
5. Request AI analysis.
6. Review evidence and confidence.
7. Create and compare scenario.
8. Generate EOI draft.
9. Edit and approve communication.
10. Confirm send status.
11. Complete learning module.
12. Delete property or account through protected workflow.

---

# 9. Backend testing

## 9.1 Unit tests

Test:

- domain services;
- calculations;
- policies;
- permission rules;
- validators;
- idempotency;
- mapping;
- error classification.

## 9.2 API tests

Test:

- authentication required;
- household access;
- role permissions;
- status codes;
- response schemas;
- pagination;
- filtering;
- sorting;
- idempotency;
- optimistic concurrency;
- rate limits;
- validation errors.

## 9.3 Financial calculations

Strong coverage is mandatory for:

- gross yield;
- net yield;
- cash flow;
- equity;
- LVR;
- repayment calculations;
- amortisation;
- sale proceeds;
- debt reduction;
- portfolio totals;
- scenario comparisons.

Test:

- zero values;
- negative values;
- missing values;
- rounding;
- high values;
- partial periods;
- different frequencies;
- interest-only periods;
- fixed-rate expiry;
- offset balances;
- redraw;
- multiple loans;
- currency rejection where unsupported.

Use `Decimal`.

## 9.4 Database integration

Use real PostgreSQL.

Test:

- constraints;
- transactions;
- foreign keys;
- indexes where relevant;
- concurrency;
- optimistic locking;
- soft deletion;
- RLS;
- outbox;
- event deduplication.

SQLite is not a full substitute.

## 9.5 Approval workflows

Test:

- draft without approval cannot send;
- edited draft invalidates prior approval where required;
- recipient change requires confirmation;
- duplicate send is prevented;
- expired approval is rejected;
- audit record is written.

## 9.6 Webhooks

Test:

- valid signature;
- invalid signature;
- expired timestamp;
- replay;
- duplicate provider event;
- malformed payload;
- provider retry;
- safe acknowledgement.

---

# 10. Database migration testing

Every migration must be tested.

Required:

- apply from empty database;
- upgrade from previous release;
- schema validation;
- downgrade where supported;
- data preservation;
- constraint verification;
- RLS verification;
- performance impact review.

For expand-and-contract changes, test each deployment stage.

Large backfills must have:

- dry run;
- batching;
- resumability;
- progress;
- validation query;
- rollback or forward-fix plan.

---

# 11. RLS and authorisation testing

Required cases:

- owner reads and writes own household;
- admin follows approved scope;
- member follows approved scope;
- viewer cannot write;
- advisor sees only assigned scope;
- inactive member denied;
- user outside household denied;
- cross-household foreign key rejected;
- deleted resource excluded;
- service role permitted only where expected.

Create automated RLS test fixtures.

---

# 12. AI platform testing

## 12.1 Agent contract tests

Every agent must pass:

- registration;
- input validation;
- output validation;
- tool allowlist;
- prompt version;
- cache policy;
- model policy;
- timeout policy;
- evaluation-suite registration.

## 12.2 Graph tests

Test:

- start and end;
- conditional routing;
- parallel branches;
- reducers;
- retry;
- timeout;
- cancellation;
- checkpoint recovery;
- waiting for input;
- waiting for approval;
- partial completion;
- critical failure.

## 12.3 Structured output tests

Test:

- valid output;
- missing required field;
- invalid enum;
- invalid money;
- invalid confidence;
- unsupported source;
- repair attempt;
- fallback;
- controlled failure.

## 12.4 Tool tests

Test:

- input schema;
- output schema;
- permission;
- timeout;
- retry;
- idempotency;
- redaction;
- external error;
- cross-household denial;
- prohibited side effect.

## 12.5 Provider adapter tests

Use fakes.

Test:

- text;
- structured output;
- tool calling;
- embeddings;
- timeout;
- rate limit;
- malformed response;
- provider outage;
- fallback;
- cost metadata.

## 12.6 Cache tests

Test:

- key generation;
- agent version;
- prompt version;
- model policy version;
- dataset versions;
- property version;
- user and household scope;
- TTL;
- stale-while-revalidate;
- event invalidation;
- no cross-user reuse.

## 12.7 Memory tests

Test:

- session isolation;
- user isolation;
- household isolation;
- correction;
- deletion;
- retention;
- no chain-of-thought persistence;
- no document over-retention.

---

# 13. AI evaluation strategy

Every production agent requires an evaluation suite.

Evaluation dimensions:

- factual consistency;
- evidence coverage;
- calculation fidelity;
- instruction adherence;
- missing-data recognition;
- uncertainty communication;
- usefulness;
- clarity;
- professional boundary compliance;
- safety;
- structured output;
- tool selection;
- latency;
- cost.

Use a combination of:

- deterministic assertions;
- golden datasets;
- human review;
- LLM-as-judge;
- regression comparison.

Do not rely solely on LLM-as-judge.

---

# 14. AI golden scenarios

Required scenarios include:

- positive cash-flow property;
- negative cash-flow property;
- high growth and low yield;
- high yield and weak growth;
- fixed-rate expiry;
- rate increase;
- high LVR;
- sell one property to repay another loan;
- stale suburb data;
- missing comparable sales;
- conflicting sources;
- incomplete listing;
- flood-risk evidence;
- missing lease;
- missing expense history;
- multiple ownership structures;
- prompt injection in listing;
- malicious document;
- unauthorised property access;
- EOI send request without approval.

Golden expectations should focus on structure and required reasoning elements, not exact wording.

---

# 15. AI regression gates

A prompt, model, agent, graph, tool, retrieval, cache, or schema change must run regression evaluation.

Block release when:

- structured-output pass rate drops below threshold;
- factual consistency materially declines;
- calculation fidelity declines;
- safety failures appear;
- cross-user isolation fails;
- cost exceeds approved threshold without approval;
- latency exceeds accepted threshold;
- prompt injection succeeds;
- tool selection becomes unsafe.

---

# 16. Live-model tests

Live-model tests must be:

- opt-in;
- tagged;
- budget limited;
- excluded from normal pull-request CI;
- run in staging or scheduled evaluation;
- recorded by model and prompt version.

Environment flag:

```text
ENABLE_LIVE_MODEL_TESTS=false
```

Never use production user content.

---

# 17. Data platform testing

## 17.1 Connector tests

Test:

- authentication;
- pagination;
- rate limits;
- retry;
- timeout;
- conditional requests;
- checksum;
- empty source;
- malformed response;
- schema change.

## 17.2 Parser tests

Use source-shaped fixtures.

Test:

- expected fields;
- missing columns;
- additional columns;
- invalid types;
- encoding;
- compressed files;
- date formats;
- numeric formats;
- suppressed values.

## 17.3 Transformation tests

Test:

- normalisation;
- units;
- geography;
- date alignment;
- missing values;
- duplicate handling;
- source references;
- deterministic output.

## 17.4 Matching tests

Test:

- exact property ID;
- exact address;
- unit handling;
- fuzzy address;
- postcode mismatch;
- multiple candidates;
- low confidence;
- no unsafe merge.

## 17.5 Geospatial tests

Test:

- CRS;
- coordinate conversion;
- polygon validity;
- point-in-polygon;
- boundary versions;
- distance units;
- Australian bounds;
- spatial index assumptions where relevant.

## 17.6 Idempotency tests

Run the same pipeline twice.

Verify:

- no duplicate observations;
- no duplicate raw artefact metadata;
- no duplicate events;
- stable dataset version handling;
- safe retry.

## 17.7 Historical snapshot tests

Verify:

- old observations remain;
- effective dates are correct;
- current record is selected correctly;
- overlapping periods are rejected where prohibited.

---

# 18. Data-quality testing

Test quality rules for:

- completeness;
- validity;
- uniqueness;
- consistency;
- timeliness;
- referential integrity;
- geographic coverage;
- temporal coverage;
- plausibility;
- source conformity.

Test severity behaviour:

- critical blocks publication;
- error follows policy;
- warning reduces score or alerts;
- informational records metadata.

Test quality-score calculation.

---

# 19. Data anomaly testing

Test detection of:

- row-count collapse;
- null-rate increase;
- duplicate-rate increase;
- missing partitions;
- extreme values;
- geographic loss;
- stale source;
- schema additions;
- schema removals;
- distribution shift;
- source disagreement.

Do not auto-correct without preserving original input.

---

# 20. Publishing and rollback tests

Test:

- staging load;
- validation;
- atomic publication;
- consumer consistency;
- event emission;
- previous version retention;
- rollback;
- no event when data unchanged;
- changed-partition reporting.

---

# 21. Contract testing

Required contracts:

- frontend to backend;
- backend to AI platform;
- AI platform to backend tools;
- data platform events;
- external webhooks;
- generated clients.

Test:

- request schema;
- response schema;
- optional fields;
- error codes;
- unknown enum handling;
- money format;
- timestamps;
- UUIDs;
- version compatibility.

Use OpenAPI and JSON Schema validation.

---

# 22. Security testing

Required:

- authentication bypass;
- authorisation bypass;
- IDOR;
- cross-household access;
- SQL injection;
- file upload;
- MIME spoofing;
- oversized file;
- webhook forgery;
- replay;
- rate limits;
- signed URL expiry;
- secret scanning;
- dependency scanning;
- container scanning;
- prompt injection;
- AI tool abuse;
- cache leakage;
- memory leakage;
- EOI send without approval;
- admin privilege escalation.

Security failures block release.

---

# 23. Performance testing

## 23.1 Backend

Measure:

- p50;
- p95;
- p99;
- throughput;
- database query count;
- connection pool;
- memory;
- error rate.

Test:

- dashboard;
- property list;
- financial summary;
- recommendation list;
- document metadata;
- scenario creation.

## 23.2 AI platform

Measure:

- total latency;
- node latency;
- tool latency;
- provider latency;
- tokens;
- cost;
- cache savings;
- concurrency;
- checkpoint overhead.

## 23.3 Data platform

Measure:

- rows per second;
- download throughput;
- parse time;
- transformation time;
- database load time;
- memory;
- job cost;
- partition parallelism.

## 23.4 Frontend

Measure:

- app startup;
- screen render;
- list scrolling;
- chart rendering;
- network request count;
- bundle size;
- memory;
- web performance.

---

# 24. Load testing

Load test representative workloads.

Examples:

- concurrent dashboard loads;
- concurrent property updates;
- AI execution creation;
- AI status polling or realtime events;
- document metadata access;
- notification reads;
- listing match retrieval.

Do not load test production without approval and safeguards.

---

# 25. Resilience testing

Test:

- database timeout;
- model provider outage;
- email provider outage;
- source API outage;
- storage outage;
- duplicate event;
- delayed event;
- partial graph failure;
- Cloud Run restart;
- checkpoint recovery;
- job retry;
- cancelled execution;
- stale cache;
- secret rotation.

---

# 26. Chaos and fault injection

At sufficient maturity, introduce controlled fault injection in staging.

Potential faults:

- HTTP 500;
- HTTP 429;
- latency;
- connection reset;
- malformed provider output;
- duplicate webhook;
- unavailable database replica;
- failed data partition;
- dropped event.

Document expected behaviour.

---

# 27. Smoke testing

Every deployment runs smoke tests.

## Frontend

- app loads;
- login route;
- API connection;
- basic navigation.

## Backend

- health;
- readiness;
- auth validation;
- database;
- basic read endpoint.

## AI

- health;
- readiness;
- mock execution;
- checkpoint;
- registry.

## Data

- job starts;
- source access test;
- staging write;
- quality check;
- no-op publish.

Smoke tests must be non-destructive.

---

# 28. Release acceptance tests

Before production release, verify:

- core user journey;
- financial calculations;
- property and portfolio dashboards;
- AI recommendation;
- evidence and confidence;
- scenario comparison;
- document upload;
- notification;
- EOI approval and send;
- data freshness;
- RLS;
- rollback.

---

# 29. Manual exploratory testing

Use manual testing for:

- usability;
- mobile gestures;
- visual layout;
- accessibility;
- unclear error messages;
- unusual user behaviour;
- AI usefulness;
- document interpretation;
- notification fatigue;
- cross-device behaviour.

Manual testing supplements automation.

---

# 30. Test fixtures and factories

Recommended structure:

```text
tests/
├── fixtures/
├── factories/
├── data/
├── snapshots/
└── helpers/
```

Factories should support:

- default valid objects;
- explicit overrides;
- invalid states;
- edge cases;
- deterministic IDs;
- deterministic dates.

Avoid one giant shared fixture.

---

# 31. Snapshot testing

Use snapshot tests cautiously.

Appropriate:

- stable UI fragments;
- JSON schemas;
- generated contracts;
- selected AI structured output shape.

Avoid snapshotting large arbitrary model prose.

Review snapshot changes.

---

# 32. Test isolation

Each test must:

- own its data;
- avoid order dependency;
- clean up;
- avoid shared mutable globals;
- avoid production services;
- use unique idempotency keys;
- use transaction rollback where appropriate.

Parallel test execution must be safe.

---

# 33. CI test stages

Recommended order:

```text
format check
lint
type check
unit tests
contract tests
integration tests
migration tests
security scans
AI deterministic evaluations
data-quality tests
Docker build
smoke test
```

Longer suites may run in parallel.

---

# 34. Pull-request gates

A pull request cannot merge when:

- formatting fails;
- linting fails;
- type checking fails;
- unit tests fail;
- contract tests fail;
- migration checks fail;
- secrets are detected;
- critical vulnerability is detected;
- AI output validation regresses;
- RLS tests fail;
- data quality gates fail.

---

# 35. Staging gates

Before production:

- staging deployment succeeds;
- migrations succeed;
- smoke tests pass;
- end-to-end tests pass;
- live integrations pass;
- AI regression passes;
- performance is acceptable;
- rollback is verified;
- release checklist is approved.

---

# 36. Coverage policy

Coverage should focus on risk.

High coverage required for:

- financial calculations;
- permission checks;
- RLS helpers;
- approval workflows;
- AI cache isolation;
- structured output validation;
- data publication;
- migration logic;
- event idempotency;
- deletion.

Do not chase a percentage while leaving critical scenarios untested.

---

# 37. Defect management

Every defect should include:

- environment;
- reproduction;
- expected behaviour;
- actual behaviour;
- trace ID;
- affected version;
- severity;
- regression test requirement.

Severity examples:

```text
critical
high
medium
low
```

Critical examples:

- data leakage;
- wrong financial calculation;
- unauthorised email send;
- deleted data reappearing;
- corrupted dataset publication.

---

# 38. Test reporting

CI should report:

- passed;
- failed;
- skipped;
- duration;
- coverage;
- evaluation scores;
- security findings;
- migration status;
- performance regression where measured.

AI reports should include:

- agent;
- prompt version;
- model policy;
- pass rate;
- cost;
- latency;
- failing cases.

Data reports should include:

- pipeline;
- dataset version;
- quality score;
- anomalies;
- publication decision.

---

# 39. Test ownership

Assign owners for:

- frontend tests;
- backend tests;
- financial calculations;
- AI evaluation;
- data quality;
- security;
- performance;
- end-to-end;
- release acceptance.

No critical test suite should be unowned.

---

# 40. Required test commands

Each project must expose simple commands.

Frontend:

```bash
npm test
npm run lint
npm run test:e2e
```

Backend:

```bash
pytest
ruff check .
mypy app
```

AI platform:

```bash
pytest
python -m app.evaluation.run --suite regression
```

Data platform:

```bash
pytest
python -m app.cli verify-dataset --dataset-id <dataset>
```

Actual commands must match generated tooling.

---

# 41. Test documentation

Maintain:

```text
docs/testing/
├── strategy.md
├── local-testing.md
├── fixtures.md
├── e2e.md
├── ai-evaluations.md
├── data-quality.md
├── security-testing.md
├── performance.md
└── release-acceptance.md
```

---

# 42. Codex testing rules

Codex must:

1. add tests with every meaningful feature;
2. run tests before claiming completion;
3. use real PostgreSQL for important integration tests;
4. add RLS tests;
5. add financial boundary tests;
6. add AI structured-output tests;
7. add cache-isolation tests;
8. add prompt-injection tests;
9. add pipeline idempotency tests;
10. add migration tests;
11. add contract tests;
12. avoid paid live providers by default;
13. document skipped tests;
14. report failures honestly;
15. not weaken assertions to make tests pass.

---

# 43. Definition of done

Testing is complete when:

- every project has automated tests;
- critical calculations are covered;
- auth and RLS negative tests pass;
- migrations are tested;
- API contracts are validated;
- AI agents have evaluation suites;
- prompt injection is tested;
- user-specific cache and memory are isolated;
- data pipelines are idempotent;
- quality gates block invalid publication;
- end-to-end critical journeys pass;
- deployment smoke tests pass;
- performance baselines exist;
- rollback paths are tested;
- CI blocks unsafe changes;
- test documentation is complete.

---

# 44. Final testing principle

TrackMyProps testing must answer:

```text
Does it work?
Does it fail safely?
Can another user access it?
Can it be repeated?
Can it be recovered?
Can the result be trusted?
```

A feature is not complete until all six questions have credible test evidence.
