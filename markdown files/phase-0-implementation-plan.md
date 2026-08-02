# TrackMyProps Phase 0 Implementation Plan

**Status:** Proposed for review  
**Plan date:** 2 August 2026  
**Prerequisite:** Review and approval of `implementation-findings.md` and this plan.

## 1. Goal

Create the smallest secure, readable, testable monorepo scaffold that proves the four TrackMyProps projects can build, import, or start independently.

Phase 0 establishes project boundaries and engineering feedback loops. It does not implement a product feature, production integration, database domain, AI agent, or data connector.

## 2. Acceptance of scaffold-level decisions

Approval of this plan accepts the following temporary scaffold decisions. They may later be superseded by an ADR, but the scaffold must not mix alternatives.

| Decision | Phase 0 choice | Reason |
|---|---|---|
| Repository | One monorepo | Required by `AGENTS.md` and accepted ADR-016. |
| Frontend language | Strict TypeScript | Required by `AGENTS.md`; resolves JavaScript documentation drift. |
| Frontend package manager | npm with committed `package-lock.json` | Matches documented CI commands and provides one conventional locked workflow. |
| Python version | Python 3.12 | Repeatedly specified by coding and project guidance. |
| Python dependency workflow | `uv` with committed lockfiles | Used by the setup and deployment guidance; one workflow avoids per-project drift. |
| Python lint/format | Ruff | Smallest single tool for both linting and formatting. |
| Python type checking | MyPy | Matches the documented required backend command. |
| Python tests | Pytest | Required consistently across Python projects. |
| Frontend lint/format/type | ESLint, Prettier, `tsc` | Matches the frontend and coding guidance. |
| Frontend tests | Jest with React Native Testing Library | Matches the approved Expo testing guidance. |
| CI | GitHub Actions | Accepted repository default; deployment remains out of scope. |
| Root commands | A small `Makefile` delegating to project-native commands | Avoids a new task-runner dependency and provides one discoverable interface. |
| Initial progress mechanism | None in the scaffold; later status polling first | Avoids selecting Realtime, SSE, WebSocket, or Pub/Sub without a user need. |
| Supabase Edge Functions | None | No current Supabase-specific requirement justifies one. |

Tool and dependency versions must be current, mutually compatible, licence reviewed, pinned or locked, and documented when the scaffold is implemented. Do not guess versions in advance of that implementation review.

## 3. Scope

Create the following root structure:

```text
TrackMyProps/
├── AGENTS.md
├── README.md
├── Makefile
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

Only the files required to build, validate, explain, or safely ignore generated local state should be added.

## 4. Explicitly out of scope

Do not add:

- user, household, property, loan, income, expense, lease, valuation, document, scenario, recommendation, billing, or communication code;
- database tables, product migrations, seed data, RLS policies, triggers, functions, views, or Edge Functions;
- Supabase Auth, Storage, Realtime, or database connections;
- deployed Supabase or Google Cloud projects;
- Terraform-managed resources;
- AI agents, LangGraph graphs, prompts, provider adapters, live model calls, embeddings, vector databases, or caches;
- data-source connectors, browser automation, raw datasets, schedules, Pub/Sub, or provider SDKs;
- email, notification, maps, analytics, monitoring, billing, or commercial-property integrations;
- production credentials, identifiers, endpoints, domains, secrets, or realistic secret-like example values;
- generic repositories, CRUD frameworks, dependency-injection frameworks, queues, background workers, or speculative abstractions.

## 5. Project scaffold

### 5.1 Frontend

Create a minimal Expo React Native TypeScript project that:

- uses strict TypeScript;
- renders one neutral application-shell screen identifying TrackMyProps and the scaffold status;
- contains no navigation hierarchy, authentication, API client, TanStack Query, Zustand, forms, design system, or product screen yet;
- includes ESLint, Prettier, type checking, Jest, and React Native Testing Library;
- has one render smoke test;
- builds or exports through a documented non-interactive command;
- includes `README.md` and a placeholder-only `.env.example` limited to settings actually read by the scaffold.

Do not add TanStack Query or Zustand until a current slice needs server state or cross-screen client state. Their architectural approval does not justify unused dependencies.

### 5.2 Backend

Create a minimal Python 3.12 FastAPI project with:

- one application module;
- typed settings only if a setting is actually required by the shell;
- process-level health and readiness routes;
- safe default structured logging without request-body logging;
- Ruff, MyPy, and Pytest configuration;
- tests for health, readiness, import, and response content type;
- `README.md`, `pyproject.toml`, lockfile, and placeholder-only `.env.example`.

Do not add SQLAlchemy, Alembic, Supabase clients, authentication dependencies, or database sessions until the stage that requires them. The later backend technology decision remains accepted, but Phase 0 should not install unused dependencies.

### 5.3 AI platform

Create a separate minimal Python 3.12 FastAPI project with the same engineering baseline as the backend and no LangGraph or model dependency yet.

It contains only:

- application identity;
- internal health and readiness routes;
- safe logging;
- Ruff, MyPy, and Pytest configuration;
- import and endpoint tests;
- `README.md`, `pyproject.toml`, lockfile, and placeholder-only `.env.example`.

LangGraph remains the approved future orchestration technology, but it is not needed for a service shell.

### 5.4 Data platform

Create a minimal Python 3.12 project without FastAPI. It contains:

- a typed importable package;
- one small CLI entry point such as `python -m app --version` or its package-equivalent;
- safe logging only if required by that command;
- Ruff, MyPy, and Pytest configuration;
- import and CLI smoke tests;
- `README.md`, `pyproject.toml`, lockfile, and placeholder-only `.env.example`.

Do not add SQLAlchemy, Alembic, dataframe libraries, HTTP clients, cloud SDKs, or source abstractions until a current data slice requires them.

## 6. Health and readiness interface

The documented routes conflict. Phase 0 should use the following minimal convention unless review explicitly changes it before implementation:

```text
Backend:
GET /health
GET /ready

AI platform:
GET /internal/v1/health
GET /internal/v1/ready
```

Both route pairs return JSON and HTTP 200 while the dependency-free scaffold is available.

Provisional response:

```json
{
  "status": "ok",
  "service": "backend",
  "version": "0.0.0"
}
```

Readiness may use `"status": "ready"`. The AI service uses `"service": "ai-platform"`.

Rules:

- liveness checks only the process;
- readiness checks only dependencies that the current implementation genuinely requires;
- optional providers never make core readiness fail;
- responses expose no credentials, internal topology, exception text, or provider payload;
- the formal shared health contract is created in the later shared-contract stage;
- changing the provisional shape after client consumption requires compatibility review.

This documentation task itself changes no runtime API, schema, event, or shared type.

## 7. Shared and platform directories

### 7.1 Contracts

Create directory structure and a `README.md` only:

```text
contracts/
├── README.md
├── openapi/
├── events/
├── json-schema/
└── examples/
```

Use small placeholder README files if necessary to retain empty directories. Do not create product schemas, generated clients, speculative enums, or copied models. Health, error, money, rate, pagination, idempotency, event, and version contracts belong to the next separately approved stage.

### 7.2 Supabase

Create:

```text
supabase/
├── README.md
└── migrations/
```

Document migration ownership and local generated-file exclusions. Do not initialise a remote project, link a project, start local services, create a migration, create an Edge Function, or generate credentials during scaffold creation.

The repository ignore rules must cover local Supabase state and temporary secrets without relying on broad patterns that would hide committed migrations.

### 7.3 Infrastructure

Create a Terraform-oriented directory and README that describes the future ownership boundary. It may include a formatter-valid empty Terraform root only if needed to prove tool validation.

Do not configure a provider, backend state, project, region, service account, API, network, bucket, database, Cloud Run service, job, scheduler, registry, monitoring resource, or secret.

### 7.4 Scripts and cross-project tests

Create scripts only when they remove duplication from root validation commands. Shell scripts must be small, fail on errors, avoid secret output, and work from the repository root.

The root `tests/` directory remains for future cross-project contract and integration tests. Phase 0 may include a repository-layout or secret-path regression check, but no product fixture or external service test.

## 8. Root developer commands

The root `Makefile` should expose clear delegating targets:

```text
make format
make format-check
make lint
make typecheck
make test
make build
make check
```

`make check` runs non-mutating validation in a documented order. `make format` is the only target that rewrites source files. Project READMEs must also document native commands so the Makefile is not a hidden abstraction.

Commands must avoid live providers, production resources, and developer-global configuration.

## 9. CI foundation

Add path-aware GitHub Actions for:

- frontend formatting, linting, type checking, tests, and build/export;
- backend formatting check, linting, type checking, tests, and import/start smoke check;
- AI-platform equivalent checks;
- data-platform formatting check, linting, type checking, tests, and CLI smoke check;
- contracts structure or schema validation when contract files later exist;
- repository secret scanning and dependency review.

CI requirements:

- pin action versions to immutable revisions or an approved version policy;
- install dependencies only from committed manifests and lockfiles;
- use synthetic local inputs;
- require no provider key, Supabase project, Google Cloud project, production credential, or paid service;
- avoid deployment permissions;
- expose useful pass/fail output without secrets;
- use built-in path filters or similarly simple behaviour rather than an unnecessary orchestration framework.

Branch protection and organisation-level security settings must be documented as manual follow-up because they cannot be established by repository files alone.

## 10. Environment and secret handling

Each project has a `.env.example` only when the scaffold reads configuration. Every entry must be:

- a placeholder or safe non-secret default;
- documented as secret or non-secret;
- scoped to one project;
- validated at startup if required;
- absent when the feature is not implemented.

Do not list every future provider variable in project `.env.example` files. The consolidated setup documentation may retain a future register, but runnable examples must contain only current settings.

Repository ignore rules must exclude:

- `.env` and environment-specific local variants while preserving `.env.example`;
- Python virtual environments and caches;
- Node dependencies and build output;
- Expo local output;
- test and coverage output;
- Terraform working state and local plans;
- Supabase local state and temporary secrets;
- editor and operating-system metadata.

Secret scanning must inspect tracked source and examples without printing suspected secret values into normal logs.

## 11. Implementation order

1. **Reconfirm scope and current state.** Read `AGENTS.md`, this plan, the four project skill files, architecture, coding, testing, deployment, and security guidance. Confirm no user files would be overwritten.
2. **Resolve scaffold decisions.** Record approval of the table in section 2 and the health convention in section 6. Do not resolve commercial or feature-level decisions.
3. **Create root structure.** Add root README updates, ignore rules, Makefile, and empty ownership directories.
4. **Create project shells.** Frontend, backend, AI platform, and data platform, each with the minimum native tooling and smoke test.
5. **Create shared/platform placeholders.** Contracts, Supabase migration structure, Terraform structure, scripts, and root tests without product implementation.
6. **Add path-aware CI.** Run project-native checks plus secret and dependency scanning; do not add deployment jobs.
7. **Validate locally.** Run format checks, lint, type checks, tests, build/export, import/start checks, configuration checks, and a secret scan.
8. **Review for scope and security.** Remove unused dependencies, speculative layers, hidden side effects, credentials, generated secret state, and product logic.
9. **Report.** List files, dependencies with reasons, commands and exact results, assumptions, unresolved issues, risks, and the next separately approved task.

## 12. Validation and test scenarios

### 12.1 Repository validation

- all required directories exist;
- no unrelated documentation is altered;
- no product feature, product migration, provider adapter, or cloud resource exists;
- ignore rules preserve `.env.example` and Supabase migrations while excluding local secrets and generated state;
- every dependency is used and documented;
- all lockfiles are present and reproducible.

### 12.2 Frontend

- strict TypeScript passes;
- lint and format checks pass;
- the application shell renders in a component test;
- a non-interactive build or Expo export succeeds;
- the bundle contains no secret or server-only configuration.

### 12.3 Backend and AI platform

- packages import in a clean environment;
- `/health` and the selected readiness paths return HTTP 200, JSON content type, exact service name, status, and version;
- health routes expose no configuration or dependency details;
- Ruff, MyPy, and Pytest pass;
- the application starts and stops cleanly.

### 12.4 Data platform

- package imports in a clean environment;
- the version/help CLI exits successfully and produces deterministic non-sensitive output;
- Ruff, MyPy, and Pytest pass.

### 12.5 Platform and CI

- Terraform formatting/validation runs only if a real empty root is created and requires no credentials;
- CI path filters select the relevant project and shared changes select all affected checks;
- CI requires no live external service;
- secret and dependency checks run;
- root `make check` succeeds from a documented clean setup.

## 13. Definition of done

Phase 0 scaffold implementation is complete only when:

- all four projects independently build, import, or start;
- health and readiness behaviour is tested;
- formatting, linting, type checking, tests, and build validation pass;
- CI mirrors the documented local checks;
- dependencies are minimal, locked, and justified;
- environment examples contain placeholders only;
- no secret, credential, production identifier, or generated local secret state is committed;
- no product business logic, provider integration, schema, migration, agent, connector, or cloud resource has been added;
- project and root READMEs accurately describe setup and commands;
- validation results and remaining decisions are reported honestly.

## 14. Remaining decisions after Phase 0

Phase 0 does not resolve:

- final public response-envelope and error-correlation contracts;
- collection pagination policy;
- database migration ownership and schema deployment order;
- initial household roles and RLS policy design;
- direct versus signed Supabase Storage upload mechanics;
- Supabase project topology for non-local environments;
- realtime, event transport, background execution, or cache technology;
- any commercial, public-data, model, email, billing, notification, maps, analytics, monitoring, or OAuth provider;
- production region, budget, SLO, RPO, RTO, subscription model, legal position, or privacy approval.

The recommended next task after scaffold approval is the shared-contract foundation. Identity and household security, including RLS and cross-household denial tests, follows before any property feature.
