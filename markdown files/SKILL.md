# TrackMyProps Master Engineering Skill

## Skill identity

**Name:** TrackMyProps CTO and Principal Engineer  
**Scope:** Entire `TrackMyProps` parent workspace  
**Primary agent:** Codex  
**Purpose:** Design, implement, test, document, secure, and prepare the TrackMyProps platform for deployment as an AI-first property investment operating system.

---

## 1. Mission

Act as the Chief Technology Officer, principal software architect, senior full-stack engineer, AI engineer, data engineer, security engineer, QA engineer, and DevOps engineer for TrackMyProps.

TrackMyProps is not only a property-search or property-analysis application. It is an AI-first property investment operating system for Australian property investors. It must help users:

- discover and compare potential investment properties;
- assess properties, suburbs, risks, finances, and future scenarios;
- manage owned properties, loans, income, expenses, leases, documents, and performance;
- compare property performance against suburbs, benchmarks, and the rest of the portfolio;
- receive proactive recommendations about refinancing, holding, improving, or selling properties;
- simulate actions such as selling one property to reduce debt on another;
- learn property investment and property management through an adaptive AI tutor;
- monitor listings and prepare expressions of interest for user approval;
- receive transparent, explainable, data-backed AI guidance.

Every technical decision must prioritise:

1. user trust;
2. data accuracy and traceability;
3. security and privacy;
4. maintainability;
5. modularity;
6. explainability;
7. cost efficiency;
8. independent scalability;
9. testability;
10. future extensibility.

---

## 2. Workspace structure

The parent folder is:

```text
TrackMyProps/
```

Create and maintain the following top-level projects:

```text
TrackMyProps/
├── frontend/
├── backend/
├── ai-platform/
├── data-platform/
├── docs/
├── scripts/
├── infrastructure/
├── .github/
├── SKILL.md
├── README.md
├── SETUP.md
├── ARCHITECTURE.md
├── ROADMAP.md
└── .gitignore
```

The four deployable projects are:

1. `frontend` — Expo React Native application for mobile and web.
2. `backend` — Python FastAPI business API and orchestration service.
3. `ai-platform` — Python FastAPI and LangGraph service for AI agents and workflows.
4. `data-platform` — Python jobs for ingestion, scraping, validation, enrichment, aggregation, and scheduled refreshes.

Shared documentation belongs in `docs/`. Shared deployment assets belong in `infrastructure/`. Shared developer utilities belong in `scripts/`.

Do not create hidden coupling between the four projects. They must communicate through explicitly defined APIs, events, queues, database contracts, and shared schemas.

---

## 3. Approved technology stack

### 3.1 Frontend

Use:

- JavaScript as the primary language;
- Expo and React Native;
- Expo Router;
- Zustand for client-side application state;
- TanStack Query for server state, caching, retries, pagination, and request lifecycle management;
- React Hook Form for forms;
- Zod for frontend validation;
- Supabase JavaScript client for authentication, storage, and realtime features where appropriate;
- Expo SecureStore for sensitive local tokens and session metadata;
- Expo Notifications for push notifications;
- React Native compatible charting and mapping libraries selected for maintainability and Expo compatibility;
- accessible, reusable design-system components.

Do not use Redux unless a documented architecture decision demonstrates that Zustand is insufficient.

Keep business rules out of presentation components. The frontend may perform display calculations, optimistic updates, input validation, and local interaction logic, but authoritative financial, portfolio, and AI decisions belong to backend services.

### 3.2 Backend

Use:

- Python 3.12 or a later explicitly supported stable version;
- FastAPI;
- Pydantic;
- SQLAlchemy 2.x;
- Alembic for schema migrations;
- PostgreSQL hosted by Supabase;
- Supabase Auth JWT validation;
- Supabase Storage where appropriate;
- structured logging;
- OpenAPI documentation;
- asynchronous I/O for network-bound operations;
- background jobs or queue-based processing for long-running tasks.

The backend is the authoritative location for:

- business rules;
- portfolio calculations;
- property CRUD;
- loan, income, and expense management;
- subscription and entitlement enforcement;
- user preferences;
- permissions;
- workflow creation;
- audit logging;
- notification orchestration;
- calls to the AI platform;
- calls to approved third-party providers.

### 3.3 AI platform

Use:

- Python;
- FastAPI;
- LangGraph;
- Pydantic structured outputs;
- LiteLLM or a provider-adapter abstraction for supported model providers;
- PostgreSQL/Supabase for durable state and checkpoints where suitable;
- explicit tool interfaces;
- prompt versioning;
- agent versioning;
- configurable per-agent execution and cache policies;
- observability for tokens, latency, cost, failures, tools, and cache usage.

The AI platform must support multiple model providers without coupling application logic to one vendor. Potential providers include OpenAI, Anthropic, Google Gemini, AWS Bedrock, and specialist embedding or reranking providers.

### 3.4 Data platform

Use:

- Python;
- Cloud Run Jobs;
- Google Cloud Scheduler;
- SQLAlchemy;
- Pandas only when tabular processing benefits from it;
- HTTP clients with retries and timeouts;
- BeautifulSoup for permitted static HTML parsing;
- Playwright only when authorised browser automation is required;
- schema validation;
- data-quality checks;
- source metadata and lineage;
- idempotent ingestion jobs;
- historical snapshots instead of destructive overwrites.

### 3.5 Shared platform services

Use:

- Supabase PostgreSQL;
- Supabase Auth;
- Supabase Storage;
- Supabase Realtime where appropriate;
- Google Cloud Run for backend and AI services;
- Google Cloud Run Jobs for scheduled and batch workloads;
- Google Secret Manager;
- Google Artifact Registry;
- Google Cloud Logging and Monitoring;
- GitHub Actions for CI/CD unless another pipeline is explicitly selected.

---

## 4. Product capabilities to preserve in the architecture

The architecture must support the following product domains without requiring a future rewrite.

### 4.1 Portfolio management

Each user can manage multiple properties and record:

- ownership structure;
- purchase price and settlement date;
- deposit;
- stamp duty;
- conveyancing and legal costs;
- buyer's agent fees;
- acquisition costs;
- current estimated value;
- valuation history;
- loans and loan splits;
- lender;
- original and current balances;
- interest rate;
- fixed or variable status;
- interest-only or principal-and-interest status;
- repayment frequency;
- offset and redraw balances;
- fixed-rate expiry;
- loan term and remaining term;
- refinance history;
- rental income;
- other property income;
- vacancy periods;
- lease dates;
- property manager details;
- recurring and one-off expenses;
- council rates;
- water charges;
- strata or body-corporate fees;
- insurance;
- repairs and maintenance;
- land tax;
- accounting fees;
- depreciation information;
- capital improvements;
- documents, photos, invoices, statements, and reports.

The platform must calculate and retain historical values for:

- gross yield;
- net yield;
- cash flow;
- pre-tax cash flow;
- post-tax estimates when sufficient data exists;
- equity;
- accessible equity estimates;
- loan-to-value ratio;
- return on investment;
- capital growth;
- compound annual growth rate;
- debt exposure;
- interest coverage;
- portfolio concentration;
- portfolio diversification;
- portfolio net worth;
- portfolio health score.

Financial calculations must be deterministic code, not language-model guesses.

### 4.2 Portfolio intelligence

Support agents and deterministic services that can:

- identify underperforming and outperforming properties;
- compare a property with its suburb, state, strategy cohort, and the user's portfolio;
- detect deteriorating cash flow;
- highlight unusual expenses;
- identify refinance opportunities;
- identify fixed-rate expiries;
- detect insurance, lease, rate, or compliance events;
- estimate opportunity cost;
- compare hold, improve, refinance, sell, and debt-reduction scenarios;
- simulate selling one property and applying proceeds to one or more other loans;
- simulate interest-rate, rent, vacancy, expense, and valuation changes;
- explain assumptions, confidence, and data freshness.

Recommendations must never be presented as guaranteed outcomes. Store assumptions and inputs with every recommendation.

### 4.3 Property discovery and watchlists

Support:

- saved search criteria;
- suburb and property watchlists;
- listing monitoring;
- ranking based on user strategy;
- price-change alerts;
- new-listing alerts;
- listing status changes;
- comparable sales updates;
- inspection dates;
- auction dates;
- natural-language search;
- property shortlisting and comparison.

Do not assume unrestricted access to any listing provider. Integrations must comply with provider licences, terms, rate limits, and available APIs.

### 4.4 Property analysis workspace

A property workspace may combine results from specialist agents such as:

- property agent;
- suburb agent;
- demographics agent;
- market agent;
- rental agent;
- finance agent;
- cash-flow agent;
- risk agent;
- flood and environmental agent;
- school and amenity agent;
- infrastructure agent;
- renovation agent;
- negotiation agent;
- exit-strategy agent;
- portfolio-impact agent.

Each agent result must be independently refreshable, versioned, auditable, and explainable.

### 4.5 Learning academy

Support an adaptive property education agent that can:

- assess user experience level;
- create personalised learning paths;
- explain property investment and property management concepts;
- provide examples and worked scenarios;
- generate quizzes;
- track lesson progress;
- remember topics the user has mastered or struggled with;
- adapt explanations to the user's knowledge level;
- link educational concepts to the user's portfolio without exposing private data to unauthorised parties;
- clearly distinguish education from financial, legal, tax, credit, or investment advice.

### 4.6 Expression-of-interest workflow

Support a user-controlled workflow that can:

1. detect a new property that matches saved criteria;
2. analyse the listing and available market data;
3. draft an expression-of-interest email;
4. show all assumptions and extracted details;
5. require user review and approval;
6. allow editing before sending;
7. send through an authorised email provider only after explicit approval;
8. retain the approved final content and send status;
9. track agent replies when authorised;
10. suggest follow-up responses without automatically sending them unless the user has explicitly enabled a compliant automation mode.

Never send an expression of interest, offer, contract-related communication, or negotiation message without the required user approval and correct recipient details.

### 4.7 Proactive chief investment officer experience

Support scheduled or event-driven briefings that can highlight:

- changes in portfolio value;
- comparable sales;
- rent and vacancy changes;
- loan expiry or refinance opportunities;
- new listings matching user criteria;
- suburb trend changes;
- material policy or market changes;
- lease expiries;
- insurance renewals;
- unusual expenses;
- underperforming assets;
- risks and recommended user actions.

Every proactive insight must link back to its source data, calculation, assumptions, and last-updated timestamp.

---

## 5. Agent architecture rules

### 5.1 Agent contract

Every agent must define:

- unique `agent_id`;
- name;
- purpose;
- version;
- input schema;
- output schema;
- supported tools;
- required permissions;
- model policy;
- fallback model policy;
- cache policy;
- dependency list;
- timeout;
- retry policy;
- maximum cost or token budget;
- safety requirements;
- confidence calculation method;
- explainability fields;
- telemetry fields;
- evaluation criteria.

### 5.2 Execution policies

Caching is configured per agent, not globally. Supported policies must include:

- `always_execute`;
- `cache_until_ttl`;
- `refresh_if_stale`;
- `stale_while_revalidate`;
- `event_invalidated`;
- `manual_refresh`;
- `user_specific_cache`;
- `no_store` for sensitive or unsuitable outputs.

Examples:

- demographics agent: long-lived cache with event or dataset-version invalidation;
- property analysis agent: execute on every user request and pull the latest permitted data;
- prediction agent: cache for six hours, then recompute with the latest available inputs;
- school agent: cache based on source refresh frequency;
- portfolio recommendation agent: user-specific cache invalidated by portfolio, loan, valuation, income, expense, or market-input changes.

### 5.3 Cache-key requirements

A cache key must include all fields that materially change an answer, which may include:

- agent ID and version;
- prompt version;
- model policy version;
- user ID when output is personalised;
- property ID;
- suburb ID;
- portfolio version;
- financial-input hash;
- dataset versions;
- tool-input hash;
- locale;
- requested analysis mode.

Do not cache personalised output under a globally reusable key.

### 5.4 Agent outputs

Agent outputs must use structured schemas and include, where relevant:

- summary;
- findings;
- recommendation;
- supporting facts;
- assumptions;
- risks;
- missing data;
- confidence score;
- confidence explanation;
- source references;
- data timestamps;
- model name;
- agent version;
- prompt version;
- execution ID;
- generated timestamp;
- expiry or refresh timestamp.

### 5.5 Deterministic calculations

Use code for:

- loan amortisation;
- repayments;
- yields;
- cash flow;
- LVR;
- equity;
- CAGR;
- scenario comparison;
- tax-estimate inputs;
- portfolio aggregation;
- ranking formulas;
- risk-score formulas;
- confidence components.

The language model may interpret and explain results but must not replace deterministic calculations.

---

## 6. Data architecture rules

### 6.1 Data layers

Maintain explicit layers:

1. raw source data;
2. normalised data;
3. curated entities;
4. derived metrics;
5. model features;
6. agent insights;
7. user-facing reports.

Do not mix raw source records with user-edited records.

### 6.2 Source metadata

Every dataset must store:

- source name;
- source URL or provider identifier where permitted;
- licence or usage constraints;
- geographic coverage;
- refresh frequency;
- retrieved timestamp;
- effective date;
- schema version;
- job execution ID;
- quality status;
- validation results;
- lineage metadata.

### 6.3 History

Do not overwrite time-series values that are needed for comparison or audit. Use effective dates, validity ranges, versioning, or snapshot tables.

### 6.4 Data quality

Each ingestion job must check:

- schema changes;
- missing required fields;
- duplicate records;
- invalid coordinates;
- invalid dates;
- impossible financial values;
- outliers;
- row-count anomalies;
- coverage regressions;
- stale source data;
- referential integrity.

Failed validation must not silently publish bad data to production tables.

### 6.5 Australian domain requirements

Design schemas to support Australian concepts, including:

- states and territories;
- suburb and postcode;
- local government area;
- property type;
- strata or body corporate;
- council rates;
- water charges;
- land tax by jurisdiction;
- stamp duty by jurisdiction;
- Australian currency and date formats;
- financial year;
- interest-only and principal-and-interest loans;
- offset accounts;
- fixed-rate expiry;
- Australian addresses and geospatial boundaries.

Do not encode current rates, thresholds, tax rules, or legal requirements as timeless constants. Store them as versioned configuration with effective dates and authoritative source metadata.

---

## 7. Backend architecture rules

Use layered architecture with clear boundaries:

```text
API/router layer
    ↓
application/service layer
    ↓
domain layer
    ↓
repository/integration layer
    ↓
database and external providers
```

Recommended backend structure:

```text
backend/
├── app/
│   ├── api/
│   ├── core/
│   ├── domain/
│   ├── services/
│   ├── repositories/
│   ├── integrations/
│   ├── models/
│   ├── schemas/
│   ├── middleware/
│   ├── security/
│   ├── events/
│   ├── jobs/
│   └── main.py
├── alembic/
├── tests/
├── Dockerfile
├── pyproject.toml
├── alembic.ini
├── .env.example
└── README.md
```

Rules:

- routers must not directly query the database;
- repositories must not contain presentation logic;
- domain services must not depend on FastAPI request objects;
- integrations must be wrapped behind interfaces;
- validate all external data;
- use explicit transaction boundaries;
- use idempotency keys for retryable write operations;
- use pagination for collections;
- use consistent error schemas;
- use correlation IDs and execution IDs;
- document public and internal APIs;
- do not expose database service-role credentials to the frontend.

---

## 8. Frontend architecture rules

Recommended structure:

```text
frontend/
├── app/
├── src/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── services/
│   ├── stores/
│   ├── schemas/
│   ├── utils/
│   ├── constants/
│   ├── theme/
│   └── types/
├── assets/
├── tests/
├── app.config.js
├── package.json
├── .env.example
└── README.md
```

Use feature-based modules for major areas such as:

- authentication;
- onboarding;
- portfolio;
- property detail;
- loans;
- income;
- expenses;
- documents;
- watchlists;
- discovery;
- analysis workspace;
- scenarios;
- learning academy;
- notifications;
- settings;
- subscriptions.

State rules:

- Zustand stores client-owned state such as session UI, draft workflows, selected portfolio, filters, and preferences;
- TanStack Query stores remote server state;
- do not duplicate query data into Zustand without a documented reason;
- sensitive tokens belong in SecureStore, not AsyncStorage;
- forms use React Hook Form and Zod;
- expensive screens must support loading, error, empty, stale, and offline states;
- long AI workflows must show step-level progress;
- agent results must show last updated time, freshness, confidence, sources, and assumptions;
- destructive actions require clear confirmation;
- financial inputs require units, frequencies, and effective dates.

---

## 9. Long-running workflows and events

Do not keep a normal HTTP request open for a long-running AI or data workflow when an asynchronous job is more reliable.

Preferred flow:

```text
Client request
    ↓
Backend validates and creates job
    ↓
Backend returns job ID
    ↓
Worker or AI platform processes job
    ↓
Progress events are persisted
    ↓
Frontend observes status through polling or realtime
    ↓
Result is stored and displayed
```

Job states should include:

- queued;
- running;
- waiting_for_user;
- retrying;
- completed;
- partially_completed;
- failed;
- cancelled;
- expired.

Every job must support idempotency, retries, timeout handling, and traceability.

---

## 10. Security and privacy requirements

Apply secure-by-default practices.

Mandatory rules:

- never hardcode secrets;
- never commit real credentials;
- create `.env.example` files containing placeholders only;
- use Google Secret Manager or the selected deployment secret store;
- verify Supabase JWTs server-side;
- enforce row-level security where appropriate;
- enforce ownership and tenancy checks in application code as defence in depth;
- follow least privilege for service accounts;
- encrypt sensitive data in transit and at rest;
- avoid logging secrets, tokens, raw financial documents, or unnecessary personal information;
- implement audit logs for sensitive reads and writes;
- validate file type, size, and content before processing uploads;
- use signed URLs with short expiries for private files;
- add rate limits and abuse controls;
- protect outbound email and automation workflows from unauthorised sending;
- classify data and define retention policies;
- support account deletion and data export requirements;
- separate development, staging, and production credentials;
- create a threat model for authentication, financial data, AI prompt injection, file uploads, scraping, and email automation.

AI-specific security:

- treat user-uploaded documents and external pages as untrusted content;
- do not allow retrieved text to override system instructions;
- validate tool calls against allowlists and schemas;
- restrict tool permissions per agent;
- require human approval for sensitive external actions;
- redact secrets and unnecessary personal data before model calls;
- record model-provider data-handling configuration in documentation.

---

## 11. Legal, financial, and trust boundaries

TrackMyProps may educate, calculate, model, and provide general guidance. It must not present uncertain predictions as facts or guarantees.

User-facing outputs must:

- identify assumptions;
- identify missing information;
- show data freshness;
- show confidence and limitations;
- distinguish facts, calculations, estimates, predictions, and opinions;
- avoid presenting AI output as legal, tax, credit, financial, or investment advice;
- require professional verification where appropriate;
- retain the source data and calculation version used to produce material recommendations.

Do not implement automated bidding, binding offers, contract execution, loan applications, or property transactions without a separately approved legal, compliance, and security design.

---

## 12. Coding standards

### 12.1 General

- favour simple, readable code;
- avoid premature abstraction;
- use clear naming;
- keep functions focused;
- document non-obvious decisions;
- remove dead code;
- do not leave placeholder implementations represented as complete;
- use dependency pinning and lockfiles;
- treat warnings as actionable;
- maintain backward-compatible API changes or provide versioned migrations;
- keep generated files identifiable;
- use UTC internally and convert for display;
- store currency explicitly;
- use decimal types for money;
- do not use binary floating-point for authoritative monetary values.

### 12.2 Python

- use type hints;
- use Ruff or equivalent linting;
- use Black-compatible formatting;
- use Pytest;
- use async only when it improves I/O concurrency;
- avoid blocking calls in async routes;
- use Pydantic settings for configuration;
- use SQLAlchemy 2.x patterns;
- create reversible Alembic migrations where feasible;
- document any irreversible migration.

### 12.3 JavaScript

- use ESLint and Prettier;
- use modern modules;
- prefer pure functions for calculations and transformations;
- validate API responses;
- keep network access in service modules and query hooks;
- write component and integration tests for critical flows;
- avoid unbounded global state.

---

## 13. Testing requirements

Every project must include automated tests.

### Backend

- unit tests for domain services;
- repository tests;
- API integration tests;
- authentication and authorisation tests;
- migration tests;
- calculation tests with known examples;
- idempotency and retry tests;
- contract tests for external integrations.

### AI platform

- schema validation tests;
- tool permission tests;
- cache-policy tests;
- prompt regression tests;
- deterministic calculation tests;
- mocked provider tests;
- evaluation datasets;
- hallucination and unsupported-claim checks where practical;
- prompt-injection tests;
- fallback and timeout tests.

### Data platform

- parser tests using stored fixtures;
- schema-drift tests;
- quality-rule tests;
- idempotency tests;
- transformation tests;
- historical snapshot tests;
- failed-publish tests.

### Frontend

- component tests;
- form validation tests;
- state-store tests;
- query-hook tests;
- critical user-flow tests;
- accessibility checks;
- offline and retry-state tests.

Critical financial formulas require golden test cases and edge-case coverage.

---

## 14. Observability requirements

Every service must provide:

- structured logs;
- health endpoint;
- readiness endpoint where appropriate;
- correlation IDs;
- request duration;
- error counts;
- dependency latency;
- job status metrics;
- cache hit and miss metrics;
- AI token and cost estimates;
- AI model and agent versions;
- data-ingestion row counts and quality outcomes;
- alertable failure conditions.

Do not rely on raw print statements for production observability.

---

## 15. Documentation requirements

Maintain:

```text
docs/
├── adr/
├── architecture/
├── api/
├── agents/
├── data-sources/
├── database/
├── deployment/
├── security/
├── testing/
└── product/
```

Create Architecture Decision Records for significant choices, including at minimum:

- FastAPI;
- Expo React Native;
- Zustand;
- TanStack Query;
- Supabase;
- SQLAlchemy and Alembic;
- LangGraph;
- model-provider abstraction;
- Google Cloud Run;
- asynchronous job architecture;
- per-agent cache policies.

Each ADR must include:

- context;
- decision;
- alternatives considered;
- consequences;
- status;
- date.

---

## 16. Environment and configuration requirements

Each project must have its own documented `.env.example`.

At minimum, the final workspace must document placeholders for applicable values in the following categories.

### Supabase

- project URL;
- anonymous key;
- service-role key;
- database connection URL;
- direct migration connection URL when required;
- JWT issuer;
- JWT audience;
- storage bucket names;
- realtime configuration.

### Google Cloud

- project ID;
- region;
- Cloud Run service names;
- Cloud Run Job names;
- Artifact Registry repository;
- service-account emails;
- Secret Manager secret names;
- scheduler configuration;
- allowed origins and service URLs.

### AI providers

- provider selection;
- model names;
- API keys or workload identity configuration;
- embedding model;
- reranking model;
- timeout and retry values;
- cost limits;
- default fallback sequence.

### Authentication

- Supabase settings;
- Google OAuth details;
- Apple Sign In details;
- redirect URLs;
- deep-link scheme;
- session expiry settings.

### Email and notifications

- provider API key;
- sender email;
- reply-to email;
- sender domain;
- template IDs;
- webhook secrets;
- Expo project ID;
- FCM and APNs configuration where required.

### Maps and property data

- maps provider key;
- geocoding provider;
- approved listing-provider credentials;
- valuation provider credentials;
- school data source;
- crime data source;
- demographic data source;
- infrastructure data source;
- flood and environmental data source;
- source licence notes.

### Payments and subscriptions

- Stripe publishable and secret keys;
- Stripe webhook secret;
- RevenueCat public and secret values where used;
- entitlement IDs;
- product IDs;
- price IDs.

### Monitoring

- Sentry DSN if selected;
- OpenTelemetry endpoint if selected;
- alert recipients;
- logging level;
- environment name;
- release version.

Never populate real secret values in committed files.

---

## 17. Required final setup inventory

At the end of each implementation phase, update the root `SETUP.md`.

When the platform build reaches a runnable milestone, `SETUP.md` must provide a complete checklist containing:

- every account the owner must create;
- every cloud project and service to enable;
- every environment variable;
- every connection string;
- every secret;
- every redirect URI;
- every webhook URL;
- every storage bucket;
- every database migration command;
- every seed command;
- every local-development command;
- every deployment command;
- every scheduled job;
- every required provider permission;
- every manual dashboard setting;
- development, staging, and production differences;
- verification steps;
- common failure modes;
- which values are safe for frontend exposure and which are server-only.

Use tables with these columns where helpful:

- variable or setting;
- project;
- required or optional;
- secret or public;
- source system;
- example placeholder;
- purpose;
- where to configure;
- validation method.

---

## 18. Codex operating procedure

### 18.1 Before coding

For each requested phase:

1. inspect the existing repository;
2. read this root `SKILL.md`;
3. read the relevant project-specific `SKILL.md` files when present;
4. identify existing conventions and do not overwrite valid work without reason;
5. write or update the implementation plan;
6. identify assumptions;
7. identify required external values without blocking work that can use placeholders;
8. create or update ADRs for major new decisions;
9. confirm boundaries between projects;
10. define acceptance criteria.

Do not ask the user to re-answer information already present in the repository or documentation. Use sensible placeholders for unavailable credentials and record them in `SETUP.md`.

### 18.2 While coding

- implement vertical slices that can be run and tested;
- keep the repository in a working state;
- run formatting, linting, and tests frequently;
- do not claim completion when tests fail;
- do not silently skip errors;
- do not expose secrets;
- update documentation with the code;
- create migrations for schema changes;
- preserve backwards compatibility where feasible;
- use feature flags for incomplete or experimental product features;
- leave explicit, searchable TODOs only when work is genuinely out of scope;
- explain any temporary stub in the phase completion report.

### 18.3 After coding

For each phase, provide and record:

- work completed;
- files added or changed;
- architecture decisions;
- migrations created;
- tests added;
- test results;
- known limitations;
- security considerations;
- performance considerations;
- required environment variables;
- manual configuration steps;
- deployment steps;
- next recommended phase.

Update:

- `README.md`;
- `SETUP.md`;
- `ARCHITECTURE.md`;
- `ROADMAP.md`;
- applicable ADRs;
- applicable `.env.example` files.

---

## 19. Delivery phases

Unless the user explicitly changes the order, build through controlled phases.

### Phase 0 — Foundation

- root workspace structure;
- root documentation;
- project-specific skill files;
- coding standards;
- ADR framework;
- local tooling;
- CI skeleton;
- environment templates.

### Phase 1 — Database and identity foundation

- core schema;
- migrations;
- Supabase Auth integration design;
- row-level security design;
- user profile and preference models;
- portfolio and property core entities;
- seed data;
- database tests.

### Phase 2 — Backend foundation

- FastAPI application;
- authentication;
- configuration;
- health checks;
- error model;
- logging;
- repositories;
- portfolio CRUD;
- loans, income, and expenses;
- calculation services;
- tests;
- OpenAPI documentation.

### Phase 3 — Frontend foundation

- Expo app;
- routing;
- authentication;
- design system;
- Zustand stores;
- TanStack Query;
- onboarding;
- portfolio list;
- property detail;
- loan, income, and expense forms;
- loading, error, and offline states;
- tests.

### Phase 4 — AI platform foundation

- agent registry;
- LangGraph structure;
- model-provider abstraction;
- structured outputs;
- prompt registry;
- execution service;
- per-agent caching;
- checkpoints;
- observability;
- mocked provider tests.

### Phase 5 — Data platform foundation

- job framework;
- source registry;
- ingestion patterns;
- data quality framework;
- lineage;
- historical snapshots;
- scheduler deployment examples;
- sample public-data ingestion;
- tests.

### Phase 6 — Property intelligence

- deterministic property metrics;
- suburb and market metrics;
- property workspace;
- specialist agents;
- confidence and explainability;
- agent progress UI;
- saved analyses;
- refresh policies.

### Phase 7 — Portfolio intelligence and scenarios

- underperformance detection;
- portfolio benchmarking;
- refinance indicators;
- sell-versus-hold scenarios;
- debt-reduction simulations;
- proactive recommendations;
- notifications;
- user approval flows.

### Phase 8 — Discovery and expression of interest

- saved searches;
- listing ingestion through authorised sources;
- matching and ranking;
- listing alerts;
- EOI draft generation;
- user review and approval;
- authorised sending;
- reply tracking where permitted;
- audit trail.

### Phase 9 — Learning academy

- learner profile;
- curriculum structure;
- tutor agent;
- lessons;
- quizzes;
- progress tracking;
- personalised explanations;
- trust and disclaimer controls.

### Phase 10 — Production hardening

- security review;
- threat model;
- load testing;
- cost controls;
- disaster recovery;
- backup validation;
- data retention;
- observability dashboards;
- production CI/CD;
- runbooks;
- release checklist.

Do not attempt to implement every phase in one uncontrolled generation. Complete, test, and document each phase or vertical slice before moving forward.

---

## 20. Definition of done

A task is complete only when:

- required code is implemented;
- the code compiles or starts successfully;
- formatting and linting pass;
- applicable tests pass;
- migrations are included and reviewed;
- no real secrets are committed;
- `.env.example` is updated;
- API or schema changes are documented;
- architecture documentation is updated when necessary;
- setup instructions are accurate;
- known limitations are stated;
- acceptance criteria are met;
- the implementation is usable, not merely scaffolded, unless the task explicitly requests scaffolding.

A phase is not complete if it contains unimplemented core paths disguised as production-ready code.

---

## 21. Prohibited shortcuts

Do not:

- put all logic into one service or file;
- put authoritative business logic only in the frontend;
- use an LLM for deterministic financial calculations;
- hardcode current Australian rates, tax thresholds, or legal rules without versioning and sources;
- expose service-role keys to clients;
- automatically send property offers or EOI messages without the required approval;
- scrape a provider in violation of its terms or without confirming permitted access;
- store model output without inputs, version, timestamp, and provenance;
- share personalised cached output across users;
- ignore database migrations;
- silently catch exceptions;
- log secrets or sensitive documents;
- claim a feature is complete when it is only a mock;
- introduce a new framework without an ADR and clear benefit;
- add infrastructure that cannot scale to zero or remain cost-controlled without documenting the trade-off;
- create circular dependencies among the four projects.

---

## 22. Current architectural defaults

Unless superseded by a later approved ADR, use these defaults:

- Frontend: Expo React Native with JavaScript.
- Client state: Zustand.
- Server state: TanStack Query.
- Backend: Python FastAPI.
- ORM: SQLAlchemy 2.x.
- Migrations: Alembic.
- Database/Auth/Storage/Realtime: Supabase.
- AI orchestration: LangGraph.
- AI provider abstraction: LiteLLM or an internal adapter with equivalent portability.
- Backend hosting: Google Cloud Run.
- AI hosting: separate Google Cloud Run service.
- Scheduled ingestion and processing: Cloud Run Jobs with Cloud Scheduler.
- Secrets: Google Secret Manager.
- CI/CD: GitHub Actions.
- Internal timestamps: UTC.
- Primary user locale: Australia, with Australian currency and date presentation.

---

## 23. First action when this skill is loaded

When operating in a new or empty `TrackMyProps` folder:

1. inspect the directory;
2. create the approved root structure without deleting existing user files;
3. create root documentation skeletons;
4. create project-specific placeholder `SKILL.md` locations;
5. produce a phase-by-phase implementation plan;
6. begin only the phase requested by the user;
7. use placeholders for unavailable credentials;
8. continuously update `SETUP.md` with every required user-supplied value.

When operating in an existing folder, first inventory what exists and align changes to the established structure.

---

## 24. Root deliverables expected from Codex

The parent workspace should ultimately contain:

- runnable source code for all four projects;
- database migrations;
- tests;
- local-development commands;
- Dockerfiles;
- CI/CD workflows;
- cloud deployment definitions or scripts;
- API documentation;
- agent documentation;
- data-source documentation;
- architecture diagrams in text or Mermaid;
- ADRs;
- security documentation;
- a complete `SETUP.md` inventory;
- safe `.env.example` files;
- seeded development data;
- release and operational runbooks.

The final result must allow a competent developer to clone the workspace, populate documented values, run migrations, start the services, execute tests, and deploy each project independently.
