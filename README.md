# TrackMyProps

TrackMyProps is an Australia-focused property-investment platform. This repository contains the Phase 0 scaffold, owner-only identity integration, the first property create/list vertical slice, and a development-only authenticated address lookup adapter.

Property editing, lifecycle management, income, expenses, portfolio analytics, billing, AI agents, and production provider integrations are not implemented yet.

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

The user-facing Expo React Native application, written in strict TypeScript. It authenticates users through Supabase and will call the backend API for portfolio workflows. It must not contain authoritative financial calculations, permission decisions, database credentials, service-role keys, AI-provider secrets, or direct commercial-provider integrations.

The current web-first slice contains email/password authentication against local Supabase, protected bottom navigation, linked Terms acceptance, a manual deletion-request email action, an authenticated current-user call, and a two-step property create/list experience. The property form can call the authenticated address Edge Function after a 1.5-second debounce and prefill only provider-supported address fields. Financial totals and lifecycle actions remain deferred.

Frontend non-secret application behaviour is centralized in `frontend/src/config/app-settings.ts`; environment-specific public values are loaded in `frontend/src/config/public-config.ts`.

### `backend`

The Python FastAPI service that will be the authoritative application and business layer. It will eventually own authentication validation, owner authorisation, property and financial records, deterministic calculations, audit events, exports, and deletion workflows. Household access and collaboration remain post-MVP.

The backend exposes health/readiness, authenticated identity, and authenticated property create/list endpoints. It validates bearer tokens through Supabase Auth and uses the caller's JWT for RLS-protected property persistence. It accepts an optional canonical provider address ID but has no service-role key, privileged database credential, analytics calculations, or direct commercial-provider integration.

FastAPI environment configuration is centralized in `backend/src/trackmyprops_backend/config.py`. The separately deployed address Edge Function has its own `supabase/functions/address-lookup/app-settings.ts` because Deno cannot import the Python service's runtime configuration.

### `ai-platform`

An internal Python FastAPI service reserved for controlled AI execution. It will eventually own agent orchestration, prompts, structured-output validation, evaluations, caching, and AI cost tracking. It must use narrowly scoped backend tools and must not directly modify core records, change permissions, charge users, or send communications.

Phase 0 exposes only `GET /internal/v1/health` and `GET /internal/v1/ready`. There are no agents, prompts, models, tools, embeddings, or provider SDKs.

### `data-platform`

A Python project reserved for ingestion jobs, raw and staged artefacts, canonical models, curated datasets, data-quality checks, lineage, and publication. Future sources must be official, explicitly approved, or contractually licensed before integration.

Phase 0 contains one deterministic example job and its tests. It has no source connector, database, scheduler, cloud SDK, or external integration.

### `contracts`

The executable source of truth for versioned OpenAPI definitions, JSON Schemas, event contracts, and synthetic examples. Keeping contracts independent allows the four projects to agree on interfaces without importing another project's implementation.

The shared foundation defines health, API-version metadata, errors, money, rates, pagination, idempotency, and the common event envelope. Backend OpenAPI now also defines the first owner-property create/list contract.

### `supabase`

The migration and Edge Function boundary for Supabase. Migrations create owner-scoped properties and a server-only normalized provider-address table with RLS.

The property migration grants authenticated owners only the required select, insert, and update access to their own non-deleted rows. The authenticated address lookup function holds no committed credential and is not approved for production until provider rights are verified. Storage, Realtime, project links, and credentials remain absent. Generated Supabase temporary state is ignored by Git.

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
- Supabase CLI 2.111 or later for migrations and Edge Functions

## Commands

```bash
make install
make check
make test-address-function
make test-database
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

Run development with the development environment files in separate terminals:

```bash
make dev-backend
make dev-address-function
make dev-frontend
```

Run a local production-mode preview with the production environment files in separate terminals:

```bash
make prod-backend
make prod-frontend
```

The development frontend normally uses `http://localhost:8081`. The production frontend preview builds the static web application and serves it on `http://localhost:4173`.

`make format` rewrites supported source files. The other validation targets do not intentionally modify source files.

Each project README documents its native commands.

## Configuration

Development commands load only `frontend/.env.development` and `backend/.env.development`. These ignored files currently target the local Supabase API at `http://127.0.0.1:54321` and use the same development publishable key.

Production commands load only `frontend/.env.production` and `backend/.env.production`. These ignored files contain placeholders until production URLs and a production Supabase publishable key are approved. Production configuration rejects loopback Supabase URLs.

Development and production start commands validate their selected files before starting. Production commands fail safely while any URL, publishable key, Terms URL, or deletion email remains a placeholder.

Committed templates are provided as `.env.development.example` and `.env.production.example` in each project. Do not use `NEXT_PUBLIC_*`; Expo variables must use the `EXPO_PUBLIC_*` prefix.

The publishable key is suitable for frontend use; secret and service-role keys are not. Never commit `.env` files, Supabase-generated temporary secrets, provider credentials, or production identifiers.

## Next phase

The next small property slice should add retrieve/edit behaviour, followed separately by archive/sold/remove lifecycle actions. See `markdown files/mvp-owner-portfolio-scope.md`.
