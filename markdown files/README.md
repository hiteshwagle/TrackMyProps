# TrackMyProps

TrackMyProps is an AI-first property investment operating system for Australian property investors.

It is designed to help users:

- manage properties and portfolios;
- track loans, income, expenses, leases, valuations, inspections, and maintenance;
- understand property and suburb performance;
- compare investment opportunities;
- model sell, hold, refinance, debt-paydown, and purchase scenarios;
- receive evidence-backed AI recommendations;
- learn property-investment and property-management concepts;
- discover suitable listings;
- create expressions of interest that remain subject to explicit user review and approval.

TrackMyProps is not intended to replace licensed legal, tax, financial, lending, valuation, building, pest, or property-management professionals.

---

## 1. Repository structure

```text
TrackMyProps/
├── frontend/          Expo React Native application
├── backend/           FastAPI domain and public API service
├── ai-platform/       FastAPI + LangGraph multi-agent platform
├── data-platform/     Scheduled ingestion, transformation, and publication jobs
├── contracts/         OpenAPI, JSON Schema, event, and shared contracts
├── infrastructure/    Infrastructure as code and deployment configuration
├── docs/              Product, architecture, security, and operational documentation
└── README.md          Repository entry point
```

The projects are independently deployable but share versioned contracts.

---

## 2. Technology stack

### Frontend

- Expo React Native
- JavaScript
- Zustand
- TanStack Query
- Expo EAS

### Backend

- Python
- FastAPI
- SQLAlchemy
- Alembic
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Realtime

### AI platform

- Python
- FastAPI
- LangGraph
- provider abstraction
- structured agent outputs
- per-agent caching
- deterministic backend calculation tools

### Data platform

- Python
- Cloud Run Jobs
- Cloud Scheduler
- raw, canonical, and curated data layers
- source, lineage, quality, and licence registries

### Cloud and operations

- Google Cloud Run
- Google Cloud Run Jobs
- Google Artifact Registry
- Google Secret Manager
- Google Cloud Logging and Monitoring
- Australian regions preferred where available and appropriate

---

## 3. System architecture

```text
┌────────────────────────────────────────────┐
│                Frontend                    │
│       Expo mobile and web clients          │
└─────────────────────┬──────────────────────┘
                      │ HTTPS / JSON
                      ▼
┌────────────────────────────────────────────┐
│                 Backend                    │
│ Authentication, authorisation, domain API, │
│ calculations, approvals, notifications     │
└───────┬─────────────────┬──────────────────┘
        │                 │
        │ internal API    │ SQL / Auth / Storage / Realtime
        ▼                 ▼
┌─────────────────┐   ┌──────────────────────┐
│   AI Platform   │   │      Supabase        │
│ LangGraph agents│   │ PostgreSQL/Auth/etc. │
└────────┬────────┘   └──────────────────────┘
         │ approved tools and curated context
         ▼
┌────────────────────────────────────────────┐
│               Data Platform                │
│ Sources → raw → canonical → curated        │
└─────────────────────┬──────────────────────┘
                      │
                      ▼
       Official and licensed external sources
```

Detailed architecture is defined in [`architecture.md`](./architecture.md).

---

## 4. Service responsibilities

### `frontend`

Owns:

- navigation;
- forms;
- display;
- local client state;
- server-state caching;
- upload orchestration;
- realtime UI updates;
- accessibility;
- mobile release behaviour.

It must not:

- contain service-role secrets;
- perform authoritative calculations;
- authorise actions;
- call the AI platform directly.

### `backend`

Owns:

- public API;
- user and household authorisation;
- property and portfolio domain logic;
- deterministic calculations;
- scenarios;
- document metadata;
- recommendations;
- communication approval and sending;
- billing entitlements;
- audit events.

### `ai-platform`

Owns:

- agent registry;
- orchestration;
- prompt and model versions;
- AI execution state;
- output validation;
- agent-specific caching;
- evidence-based synthesis.

It must not:

- directly mutate property, finance, billing, or approval records;
- send communications;
- access arbitrary SQL or unrestricted HTTP.

### `data-platform`

Owns:

- source ingestion;
- raw artefacts;
- canonical models;
- curated datasets;
- data quality;
- lineage;
- dataset publication;
- licence-aware retention.

---

## 5. Key product rules

1. Financial calculations are deterministic and versioned.
2. AI outputs must show evidence, confidence, freshness, and missing information.
3. Property-analysis synthesis is generated fresh even when specialist inputs are cached.
4. Prediction outputs use bounded models and a six-hour cache.
5. Communications created by AI remain drafts.
6. EOI sending requires explicit user approval of the exact content and recipient.
7. Household and resource isolation are enforced by backend policy and database RLS.
8. Provider licences may further restrict storage, display, caching, export, and AI use.
9. User data is not used to train general models by default.
10. Unknown or missing values are not represented as zero.

---

## 6. Getting started

Start with:

1. [`SETUP.md`](./SETUP.md)
2. [`environment-variables.md`](./environment-variables.md)
3. the project-specific skill file:
   - [`frontend_SKILL.md`](./frontend_SKILL.md)
   - [`backend_SKILL.md`](./backend_SKILL.md)
   - [`ai-platform_SKILL.md`](./ai-platform_SKILL.md)
   - [`data-platform_SKILL.md`](./data-platform_SKILL.md)
4. [`coding-standards.md`](./coding-standards.md)
5. [`testing-strategy.md`](./testing-strategy.md)

No production credentials should be required for the default local developer workflow.

---

## 7. Documentation map

### Product and planning

- [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md) — master delivery plan
- [`roadmap.md`](./roadmap.md) — detailed implementation roadmap
- [`feature-specifications.md`](./feature-specifications.md) — detailed feature requirements
- [`user-journeys.md`](./user-journeys.md) — end-to-end user flows

### Architecture and contracts

- [`architecture.md`](./architecture.md) — system architecture and service boundaries
- [`connections.md`](./connections.md) — communication and integration map
- [`contracts.md`](./contracts.md) — shared contract conventions
- [`api-design.md`](./api-design.md) — API catalogue and conventions
- [`api-versioning-and-backward-compatibility.md`](./api-versioning-and-backward-compatibility.md)
- [`event-catalogue.md`](./event-catalogue.md)
- [`decision-log.md`](./decision-log.md) — architecture decision register

### Data and calculations

- [`database.md`](./database.md)
- [`data-dictionary.md`](./data-dictionary.md)
- [`data-sources.md`](./data-sources.md)
- [`calculation-specification.md`](./calculation-specification.md)

### AI

- [`ai-guidelines.md`](./ai-guidelines.md)
- [`agent-catalogue.md`](./agent-catalogue.md)
- [`ai-platform_SKILL.md`](./ai-platform_SKILL.md)

### Security, privacy, and access

- [`security.md`](./security.md)
- [`permissions-matrix.md`](./permissions-matrix.md)
- [`privacy-and-retention.md`](./privacy-and-retention.md)

### Engineering quality

- [`coding-standards.md`](./coding-standards.md)
- [`testing-strategy.md`](./testing-strategy.md)
- [`performance-and-scalability.md`](./performance-and-scalability.md)
- [`observability.md`](./observability.md)

### Deployment and operations

- [`deployment.md`](./deployment.md)
- [`deployment-and-devops.md`](./deployment-and-devops.md)
- [`environment-variables.md`](./environment-variables.md)
- [`incident-response.md`](./incident-response.md)
- [`disaster-recovery.md`](./disaster-recovery.md)

---

## 8. API boundaries

Public API:

```text
/api/v1
```

Internal AI and tool APIs:

```text
/internal/v1
```

Frontend clients call the backend only.

The backend calls:

- AI platform;
- Supabase;
- approved notification, email, billing, mapping, and property-data providers.

The AI platform uses narrowly scoped backend tools and approved model providers.

The data platform publishes approved canonical and curated datasets.

---

## 9. Security model

TrackMyProps uses:

- Supabase Auth for user identity;
- household and resource policy enforcement;
- PostgreSQL row-level security;
- service identities for internal calls;
- least-privilege IAM;
- signed storage URLs;
- explicit approval for consequential communication;
- append-only audit events for sensitive operations;
- Secret Manager for server-side credentials.

See:

- [`security.md`](./security.md)
- [`permissions-matrix.md`](./permissions-matrix.md)
- [`privacy-and-retention.md`](./privacy-and-retention.md)

---

## 10. Development workflow

Recommended workflow:

```text
Create feature branch
    ↓
Implement with tests
    ↓
Update contracts and documentation
    ↓
Open pull request
    ↓
Run lint, type checks, tests, schema checks, and security scans
    ↓
Review and approve
    ↓
Merge to main
    ↓
Build immutable artefact
    ↓
Deploy through development, staging, and production
```

Direct pushes to `main` should be blocked.

---

## 11. Testing expectations

Each change should include the relevant:

- unit tests;
- integration tests;
- API contract tests;
- RLS and authorisation tests;
- event compatibility tests;
- AI schema and evaluation tests;
- end-to-end journey tests;
- migration tests;
- security tests;
- performance tests.

Cross-household denial tests are mandatory for protected data.

---

## 12. Deployment model

- Frontend: Expo EAS and approved web deployment
- Backend: Docker image to Cloud Run
- AI platform: private Docker service on Cloud Run
- Data platform: Cloud Run Jobs and Cloud Scheduler
- Database and storage: Supabase
- Secrets: Google Secret Manager
- Logs and metrics: Google Cloud observability stack

Australian hosting is preferred where service availability, resilience, latency, and cost are suitable.

---

## 13. Release and compatibility

The public API begins at:

```text
/api/v1
```

Supported mobile clients must continue to operate after backend releases.

Contract changes use:

```text
expand
migrate
deprecate
contract
```

Breaking changes require a new major contract version and an approved migration plan.

---

## 14. Architecture decisions

Architecture decisions are recorded in [`decision-log.md`](./decision-log.md).

Major decisions include:

- Expo React Native for frontend;
- FastAPI for backend and AI services;
- Supabase for PostgreSQL, Auth, Storage, and Realtime;
- LangGraph for stateful AI orchestration;
- Cloud Run for container workloads;
- Cloud Run Jobs for data processing;
- deterministic backend calculations;
- explicit approval for external communications;
- licensed APIs and official datasets rather than unauthorised scraping.

---

## 15. Known constraints

- Australian property-provider access requires commercial confirmation.
- Data availability, licence rights, and refresh periods vary by jurisdiction.
- Mobile app releases may remain active for months, so backward compatibility is required.
- Tax, legal, valuation, lending, and inspection outputs require careful disclaimers and professional escalation.
- AI quality depends on data quality, source freshness, model behaviour, and output validation.
- Disaster-recovery targets must be validated against final provider capabilities and budget.

---

## 16. Contributing

Before contributing:

1. read this file;
2. read the relevant project skill file;
3. inspect architecture and contracts;
4. follow coding standards;
5. add tests;
6. update documentation;
7. document architectural changes in the decision log.

A feature is not complete until its acceptance criteria, security requirements, observability, and documentation are complete.

---

## 17. Project status

The documentation establishes the intended architecture and operating model.

Implementation status must be tracked in:

- [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md)
- the issue tracker;
- release records;
- accepted ADRs.

Documentation must not be interpreted as proof that every feature or control has already been implemented.
