# TrackMyProps

TrackMyProps is an Australia-focused property-investment platform. This repository currently contains the Phase 0 engineering scaffold only.

No property, loan, billing, provider, AI-agent, or other product business logic is implemented.

## Repository structure

TrackMyProps is a monorepo. The four application projects are kept separate so they can be tested, released, and deployed independently while sharing contracts and repository tooling.

```text
.
├── frontend/               Expo React Native application
├── backend/                Authoritative public API and business layer
├── ai-platform/            Internal AI execution service
├── data-platform/          Data ingestion and publication jobs
├── contracts/              Shared API, event, and schema contracts
├── supabase/               Database migration boundary
├── infrastructure/         Infrastructure-as-code boundary
├── scripts/                Shared repository scripts
├── tests/                  Cross-project tests
├── .github/                GitHub Actions workflows
└── markdown files/         Source-of-truth project documentation
```

### `frontend`

The user-facing Expo React Native application, written in strict TypeScript. It will authenticate users, call the backend API, and render portfolio workflows. It must not contain authoritative financial calculations, permission decisions, database credentials, service-role keys, AI-provider secrets, or direct commercial-provider integrations.

Phase 0 contains one minimal screen, frontend linting and type checking, a component test, and an Expo web-export smoke build. It does not yet include navigation, authentication, API clients, or product features.

### `backend`

The Python FastAPI service that will be the authoritative application and business layer. It will eventually own authentication validation, authorisation, household access, property and financial records, deterministic calculations, approvals, notifications, billing entitlements, communications, audit events, exports, and deletion workflows.

Phase 0 exposes only `GET /health` and `GET /ready`. There is no database, authentication, provider integration, or business logic.

### `ai-platform`

An internal Python FastAPI service reserved for controlled AI execution. It will eventually own agent orchestration, prompts, structured-output validation, evaluations, caching, and AI cost tracking. It must use narrowly scoped backend tools and must not directly modify core records, change permissions, charge users, or send communications.

Phase 0 exposes only `GET /internal/v1/health` and `GET /internal/v1/ready`. There are no agents, prompts, models, tools, embeddings, or provider SDKs.

### `data-platform`

A Python project reserved for ingestion jobs, raw and staged artefacts, canonical models, curated datasets, data-quality checks, lineage, and publication. Future sources must be official, explicitly approved, or contractually licensed before integration.

Phase 0 contains one deterministic example job and its tests. It has no source connector, database, scheduler, cloud SDK, or external integration.

### `contracts`

The shared boundary for versioned OpenAPI definitions, JSON Schemas, event contracts, and examples. Keeping contracts independent allows the four projects to agree on interfaces without importing another project's implementation.

Phase 0 creates directory ownership only. Domain contracts and generated clients are deferred to the shared-contract stage.

### `supabase`

The migration boundary for the future Supabase PostgreSQL schema and database security policies. Household-scoped tables will require row-level security and automated cross-household denial tests.

Phase 0 contains no SQL migration, product table, Auth configuration, Storage policy, Realtime configuration, Edge Function, project link, or credential. Generated Supabase temporary state is ignored by Git.

### `infrastructure`

The boundary for future infrastructure-as-code. Terraform will eventually describe approved Google Cloud resources and deployment configuration.

Phase 0 contains documentation and the `infrastructure/terraform/` directory only. It does not configure a provider, remote state, cloud project, IAM policy, runtime service, database, storage resource, or deployment credential.

### `scripts`

Reserved for small shared automation that is genuinely needed across projects. No shared script is required in Phase 0; root commands currently delegate directly to each project's native tools through the `Makefile`.

### `tests`

Reserved for future contract and integration tests that span multiple projects. Phase 0 unit and smoke tests remain beside the project behaviour they verify.

### `.github`

Contains path-aware GitHub Actions workflows for frontend, backend, AI-platform, and data-platform validation, plus secret scanning and dependency review. The workflows do not deploy resources or require provider credentials.

### `markdown files`

Contains the source-of-truth product, architecture, security, API, database, AI, data, testing, deployment, and operational documentation. Read the relevant documents before changing implementation. Documentation conflicts must be recorded rather than silently resolved.

## Important root files

- `AGENTS.md` defines the engineering, security, architecture, and task-execution rules.
- `Makefile` provides consistent installation and validation commands.
- `.gitignore` excludes dependencies, build output, local environments, credentials, Supabase-generated state, and Terraform state.

## Prerequisites

- Node.js 22.13 or later in the Node.js 22 release line
- npm 11
- Python 3.12
- `uv` 0.12.1
- Make

## Commands

```bash
make install
make check
```

Individual commands are also available:

```bash
make format
make format-check
make lint
make typecheck
make test
make build
```

`make format` rewrites supported source files. The other validation targets do not intentionally modify source files.

Each project README documents its native commands.

## Configuration

No environment variables, live services, or credentials are required for Phase 0. Project `.env.example` files intentionally contain comments only.

Never commit `.env` files, Supabase-generated temporary secrets, provider credentials, or production identifiers.

## Next phase

The next separately approved task is the shared-contract foundation. Identity, household authorisation, and RLS must be implemented and tested before property features.
