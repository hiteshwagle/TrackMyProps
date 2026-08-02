# TrackMyProps Deployment Guide

## 1. Purpose

This document defines how TrackMyProps is deployed, configured, promoted, monitored, and rolled back across all environments.

It covers:

- frontend deployment with Expo EAS;
- backend deployment to Google Cloud Run;
- AI platform deployment to Google Cloud Run;
- data platform deployment with Google Cloud Run Jobs;
- scheduled execution with Google Cloud Scheduler;
- Supabase configuration;
- Artifact Registry;
- Secret Manager;
- service accounts and IAM;
- domains and TLS;
- CI/CD;
- environment promotion;
- database migrations;
- observability;
- rollback and disaster recovery.

The deployment model must remain:

- repeatable;
- automated;
- environment-isolated;
- least-privilege;
- observable;
- reversible;
- documented;
- safe for incremental delivery.

---

# 2. Projects and deployment targets

TrackMyProps contains four independently deployable projects:

```text
TrackMyProps/
├── frontend/
├── backend/
├── ai-platform/
└── data-platform/
```

Deployment targets:

| Project | Runtime | Deployment target |
|---|---|---|
| Frontend | Expo React Native / Web | Expo EAS and optional web hosting |
| Backend | Python FastAPI | Google Cloud Run |
| AI Platform | Python FastAPI + LangGraph | Google Cloud Run |
| Data Platform | Python jobs | Google Cloud Run Jobs |
| Scheduler | Managed scheduler | Google Cloud Scheduler |
| Database/Auth/Storage | Managed Supabase | Supabase |
| Images | Docker | Google Artifact Registry |
| Secrets | Managed secrets | Google Secret Manager |
| Monitoring | Managed observability | Cloud Logging, Cloud Monitoring, Sentry where configured |

---

# 3. Environment strategy

Use four environments:

```text
local
development
staging
production
```

## 3.1 Local

Purpose:

- developer coding;
- unit and integration testing;
- local Docker execution;
- local database testing;
- mock model and provider testing.

May use:

- Supabase local development;
- local PostgreSQL;
- mock AI providers;
- Mailpit or local email testing;
- local filesystem or emulator storage;
- test datasets.

## 3.2 Development

Purpose:

- shared integration;
- feature branch validation;
- early testing;
- non-production provider access.

Requirements:

- separate Supabase project or isolated non-production environment;
- separate Google Cloud resources;
- non-production secrets;
- low model and email quotas;
- no real customer financial data;
- synthetic or approved test data.

## 3.3 Staging

Purpose:

- release-candidate validation;
- migration testing;
- end-to-end testing;
- production-like smoke testing;
- stakeholder acceptance.

Requirements:

- infrastructure configuration close to production;
- separate Supabase project;
- separate Cloud Run services;
- separate service accounts;
- separate provider credentials where possible;
- restricted access;
- masked or synthetic data;
- production-like alerting.

## 3.4 Production

Purpose:

- customer workloads;
- live property records;
- live AI workflows;
- scheduled data refresh;
- real notifications and communications.

Requirements:

- protected deployment;
- approval gates;
- least-privilege IAM;
- production Secret Manager;
- production database and storage;
- monitoring and alerts;
- backup and restore;
- rollback procedure;
- budget alerts;
- incident runbooks.

---

# 4. Recommended Google Cloud layout

Prefer separate Google Cloud projects for staging and production.

Example:

```text
trackmyprops-dev
trackmyprops-staging
trackmyprops-prod
```

At minimum, staging and production must be separate.

Recommended region for Australia:

```text
australia-southeast1
```

Use another region only after checking service availability, latency, data residency, price, and provider integration requirements.

Record selected values in architecture and setup documentation.

---

# 5. Resource naming conventions

Use predictable names.

Example:

```text
tmp-dev-backend
tmp-dev-ai-platform
tmp-dev-data-refresh
tmp-dev-data-backfill
tmp-dev-artifacts
tmp-dev-raw-data
tmp-dev-processed-data
```

Production:

```text
tmp-prod-backend
tmp-prod-ai-platform
tmp-prod-data-refresh
tmp-prod-data-backfill
tmp-prod-artifacts
tmp-prod-raw-data
tmp-prod-processed-data
```

Suggested pattern:

```text
tmp-{environment}-{resource}
```

Secret names:

```text
tmp-prod-supabase-service-role-key
tmp-prod-database-url
tmp-prod-openai-api-key
tmp-prod-sendgrid-api-key
```

Service accounts:

```text
tmp-prod-backend-sa
tmp-prod-ai-sa
tmp-prod-data-ingest-sa
tmp-prod-data-publish-sa
tmp-prod-deployer-sa
```

---

# 6. Required Google Cloud APIs

Enable only required services.

Potential APIs:

```text
run.googleapis.com
artifactregistry.googleapis.com
secretmanager.googleapis.com
cloudbuild.googleapis.com
cloudscheduler.googleapis.com
iamcredentials.googleapis.com
logging.googleapis.com
monitoring.googleapis.com
cloudtrace.googleapis.com
storage.googleapis.com
```

Optional:

```text
pubsub.googleapis.com
eventarc.googleapis.com
cloudkms.googleapis.com
```

Do not enable unused APIs without reason.

---

# 7. Artifact Registry

Create a Docker repository per environment or use one repository with controlled image tags.

Example:

```text
australia-southeast1-docker.pkg.dev/trackmyprops-prod/tmp-prod-artifacts
```

Images:

```text
backend
ai-platform
data-platform
```

Tag strategy:

```text
git-{short_sha}
release-{version}
staging
production
```

Do not deploy only with mutable `latest`.

Each deployed revision must be traceable to:

- commit SHA;
- build ID;
- image digest;
- release version;
- deployment timestamp.

Recommended production deployment uses immutable image digest.

---

# 8. Service accounts and IAM

Use separate service accounts.

## 8.1 Backend service account

Example:

```text
tmp-prod-backend-sa
```

May require:

- access to backend secrets;
- logging;
- monitoring;
- authenticated invocation of AI platform;
- optional storage access;
- optional event publishing.

Must not have:

- project Owner;
- broad Secret Manager access;
- unnecessary data-ingestion permissions;
- unrestricted service-account impersonation.

## 8.2 AI platform service account

Example:

```text
tmp-prod-ai-sa
```

May require:

- access to AI provider secrets;
- access to AI database secret;
- logging and monitoring;
- authenticated backend internal API calls;
- checkpoint storage;
- optional document object access through short-lived URLs.

Must not have direct write permission to backend property and loan tables.

## 8.3 Data ingestion service account

Example:

```text
tmp-prod-data-ingest-sa
```

May require:

- source secrets;
- raw object storage;
- staging database access;
- logging;
- Cloud Run Job execution.

## 8.4 Data publishing service account

Example:

```text
tmp-prod-data-publish-sa
```

May require:

- canonical and curated database write access;
- quality and lineage access;
- downstream event publishing.

## 8.5 Deployment service account

Example:

```text
tmp-prod-deployer-sa
```

May require:

- deploy Cloud Run;
- update Cloud Run Jobs;
- push images;
- use service accounts;
- read deployment secrets only when needed.

Production deployment permissions should be limited to protected CI/CD identities.

---

# 9. Secret Manager

All production secrets must be stored in Google Secret Manager.

Examples:

```text
DATABASE_URL
DATABASE_DIRECT_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
ANTHROPIC_API_KEY
GOOGLE_API_KEY
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
VOYAGE_API_KEY
SENDGRID_API_KEY
EMAIL_WEBHOOK_SECRET
SENTRY_DSN
```

Rules:

- never commit secrets;
- never put real values in `.env.example`;
- grant access per secret;
- rotate keys;
- use secret versions;
- disable old versions after validation;
- avoid sharing one secret across environments;
- never expose service-role or provider secrets to frontend builds.

Cloud Run should reference secrets directly.

---

# 10. Supabase deployment

Use separate Supabase projects for:

```text
development
staging
production
```

Required Supabase components:

- PostgreSQL;
- Auth;
- Storage;
- Realtime;
- row-level security;
- database extensions;
- migration process;
- backups.

## 10.1 Supabase project values

Record:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
DATABASE_DIRECT_URL
DATABASE_POOLER_URL
JWT settings
storage bucket names
redirect URLs
```

## 10.2 Connection strategy

Use:

- pooler URL for regular application traffic where appropriate;
- direct connection for migrations and selected long-running operations;
- SSL required;
- separate database users or roles per service.

Do not run Alembic migrations through a connection mode incompatible with migration operations.

## 10.3 Auth configuration

Configure:

- site URL;
- allowed redirect URLs;
- email templates;
- Google OAuth;
- Apple Sign In;
- email confirmation;
- password policy;
- session duration;
- MFA later if required.

Each environment requires its own redirect URLs and credentials.

## 10.4 Storage buckets

Possible buckets:

```text
property-documents
inspection-media
generated-reports
raw-data
processed-data
```

Separate user documents from data-platform raw files if possible.

Use private buckets by default.

Access must use:

- RLS;
- backend-authorised operations;
- signed URLs;
- expiry;
- content-type validation.

## 10.5 Realtime

Enable only required tables and events.

Potential uses:

- AI progress;
- report completion;
- recommendations;
- portfolio recalculation;
- communication draft readiness.

Avoid enabling realtime on high-volume internal or raw-data tables.

---

# 11. Local development deployment

Recommended local layout:

```text
Docker Compose
├── PostgreSQL or Supabase local
├── backend
├── ai-platform
├── optional Redis
├── optional Mailpit
└── optional mock services
```

Frontend runs through Expo.

Suggested commands:

```bash
cd frontend
npm install
npx expo start
```

Backend:

```bash
cd backend
uv sync
alembic upgrade head
uvicorn app.main:app --reload
```

AI platform:

```bash
cd ai-platform
uv sync
alembic upgrade head
uvicorn app.main:app --reload --port 8001
```

Data platform:

```bash
cd data-platform
uv sync
python -m app.cli run-pipeline --pipeline-id <pipeline>
```

Actual package manager and commands must match each repository.

Local `.env` files must be gitignored.

---

# 12. Backend Cloud Run deployment

Service name example:

```text
tmp-prod-backend
```

Deployment requirements:

- Docker image;
- non-root user;
- health endpoint;
- readiness endpoint;
- environment validation;
- graceful shutdown;
- structured logging;
- request timeout;
- concurrency setting;
- service account;
- Secret Manager references;
- CPU and memory limits;
- min and max instances;
- VPC access only if required.

Example conceptual deployment:

```bash
gcloud run deploy tmp-prod-backend \
  --image <backend-image-digest> \
  --region australia-southeast1 \
  --service-account tmp-prod-backend-sa@<project>.iam.gserviceaccount.com \
  --no-allow-unauthenticated
```

Public user traffic may be allowed through a gateway or authenticated endpoint design, but internal endpoints must remain protected.

---

# 13. AI platform Cloud Run deployment

Service name:

```text
tmp-prod-ai-platform
```

Requirements:

- separate service from backend;
- authenticated service-to-service invocation;
- longer timeout where appropriate;
- checkpoint persistence;
- bounded concurrency;
- provider secrets;
- model budgets;
- cancellation support;
- structured progress events;
- health and readiness endpoints.

Do not hold a frontend request open for long AI workflows.

Pattern:

```text
Frontend
  ↓
Backend creates execution
  ↓
AI platform runs asynchronously
  ↓
Progress/result stored or emitted
  ↓
Frontend receives updates
```

Cloud Run timeout and concurrency must be tested with representative workflows.

---

# 14. Data platform Cloud Run Jobs

Recommended jobs:

```text
tmp-prod-data-refresh
tmp-prod-data-backfill
tmp-prod-data-verify
tmp-prod-data-reconcile
tmp-prod-data-cleanup
```

Each job should run a specific command.

Examples:

```bash
python -m app.cli run-pipeline --pipeline-id abs-demographics
python -m app.cli backfill --pipeline-id market-sales --start 2025-01-01 --end 2025-12-31
python -m app.cli verify-dataset --dataset-id suburb-market-metrics
```

Cloud Run Job configuration:

- image digest;
- service account;
- timeout;
- retry count;
- CPU;
- memory;
- task count;
- parallelism;
- secrets;
- environment variables.

Do not create one job that refreshes all sources without source-level control.

---

# 15. Cloud Scheduler

Use Cloud Scheduler for:

- source refresh;
- data verification;
- stale-dataset checks;
- daily CIO briefing trigger;
- recommendation monitoring;
- cleanup tasks;
- retention jobs.

Scheduler should invoke:

- Cloud Run Jobs;
- authenticated backend endpoints;
- Pub/Sub or Eventarc later if introduced.

All invocations must be authenticated.

Examples:

```text
RBA rate check: on known publication schedule
Market refresh: provider cadence
Data health check: daily
CIO briefing: configured morning schedule
Retention cleanup: weekly
```

Do not schedule more frequently than source terms and practical freshness require.

---

# 16. Frontend deployment with Expo EAS

Use Expo EAS.

Required files may include:

```text
app.json or app.config.js
eas.json
.env.example
```

Environments:

```text
development
preview
production
```

Example EAS profiles:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

Actual values must match project requirements.

## 16.1 Frontend environment variables

Only public values may be bundled.

Examples:

```text
EXPO_PUBLIC_APP_ENV
EXPO_PUBLIC_API_BASE_URL
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_SENTRY_DSN
EXPO_PUBLIC_GOOGLE_MAPS_KEY
```

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
AI provider API keys
email provider keys
webhook secrets
private signing keys
```

## 16.2 iOS

Required:

- Apple Developer account;
- bundle identifier;
- App Store Connect app;
- signing certificates;
- provisioning;
- privacy disclosures;
- Sign in with Apple configuration if used;
- push notification credentials.

## 16.3 Android

Required:

- application ID;
- Google Play Console app;
- signing key;
- service account for submission;
- Firebase configuration where used;
- privacy declarations.

## 16.4 Web

Possible targets:

- Expo web output;
- Vercel;
- Cloudflare Pages;
- Firebase Hosting;
- Google Cloud hosting option.

The selected web target must be documented through an ADR.

---

# 17. Domains and TLS

Suggested domains:

```text
app.trackmyprops.com.au
api.trackmyprops.com.au
ai-internal.trackmyprops.com.au
```

The AI platform should preferably remain internal and not directly exposed to end users.

Use managed TLS.

Configure:

- DNS;
- custom domain mapping;
- certificate;
- redirect from HTTP to HTTPS;
- CORS;
- Supabase redirect URLs;
- email authentication;
- webhook URLs.

Do not use temporary Cloud Run URLs in production frontend configuration once custom domains are active, unless explicitly accepted.

---

# 18. Email deployment

Email is sent by backend only.

Potential provider:

```text
SendGrid
```

Required values:

```text
SENDGRID_API_KEY
EMAIL_FROM_ADDRESS
EMAIL_FROM_NAME
EMAIL_REPLY_TO
SENDGRID_WEBHOOK_SECRET
```

Production requirements:

- verified sending domain;
- SPF;
- DKIM;
- DMARC;
- bounce handling;
- complaint handling;
- unsubscribe handling where required;
- audit;
- rate limiting.

Development and staging should use sandbox mode or restricted recipients.

AI platform generates drafts only.

---

# 19. Push notification deployment

Potential stack:

- Expo Notifications;
- APNs;
- FCM.

Required:

```text
EXPO_ACCESS_TOKEN
APNS credentials
FCM service configuration
```

Backend owns delivery.

Frontend owns device registration.

Store device tokens securely.

Test:

- foreground;
- background;
- terminated state;
- invalid token cleanup;
- user opt-out;
- quiet hours.

---

# 20. Maps and geocoding deployment

Potential services:

- Google Maps Platform;
- approved geocoding provider.

Required keys must be restricted by:

- application;
- bundle identifier;
- package name;
- domain;
- API;
- IP or service identity where possible.

Do not use one unrestricted maps key for frontend and backend.

Track costs and quotas.

---

# 21. AI provider deployment

Supported providers may include:

- OpenAI;
- Anthropic;
- Google;
- AWS Bedrock;
- embedding and reranking providers.

For each provider document:

```text
credential
project/account
region
enabled models
data handling
quota
budget
fallback
health check
```

Production model identifiers must be configuration values.

Use separate provider credentials per environment where possible.

Set budget alerts.

Do not run live paid model tests in normal CI.

---

# 22. CI/CD strategy

Use GitHub Actions or Cloud Build.

Recommended GitHub Actions flow.

## 22.1 Frontend pipeline

```text
checkout
install
lint
test
build validation
EAS preview build
manual production approval
EAS production build
submit
```

## 22.2 Backend pipeline

```text
checkout
install
lint
format check
type check
unit tests
integration tests
migration check
Docker build
secret scan
dependency scan
push image
deploy staging
smoke test
manual production approval
deploy production
verify
```

## 22.3 AI platform pipeline

```text
checkout
install
lint
type check
unit tests
graph tests
agent tests
prompt tests
evaluation regression
Docker build
security scan
push image
deploy staging
smoke test
manual production approval
deploy production
verify
```

## 22.4 Data platform pipeline

```text
checkout
install
lint
type check
unit tests
source contract tests
quality tests
migration check
Docker build
push image
update staging jobs
run sample verification
manual production approval
update production jobs
```

---

# 23. Workload identity federation

Prefer Workload Identity Federation for GitHub Actions rather than storing long-lived Google Cloud service-account keys.

The CI identity should receive only:

- Artifact Registry write;
- Cloud Run deploy;
- Cloud Run Job update;
- selected service-account usage;
- selected Secret Manager access if strictly required.

Avoid JSON service-account keys in repository secrets where federation is available.

---

# 24. Release strategy

Use semantic or date-based releases.

Example:

```text
v0.1.0
v0.2.0
v1.0.0
```

Each release should record:

- commit SHA;
- images;
- database migration revisions;
- frontend build number;
- agent versions;
- prompt versions;
- dataset versions;
- configuration changes;
- feature flags;
- rollback steps.

---

# 25. Deployment sequence

For changes spanning services:

```text
1. Deploy backward-compatible database migration.
2. Deploy data platform changes if required.
3. Deploy backend supporting old and new contracts.
4. Deploy AI platform.
5. Deploy frontend.
6. Enable feature flag.
7. Monitor.
8. Remove deprecated components in a later release.
```

Do not deploy a frontend that requires an API not yet available.

---

# 26. Database migration deployment

Use Alembic.

Migration procedure:

```text
backup or confirm recovery capability
        ↓
run migration validation in staging
        ↓
deploy backward-compatible migration
        ↓
verify schema
        ↓
deploy compatible code
        ↓
run backfill if required
        ↓
verify data
        ↓
switch reads/writes
        ↓
remove old schema later
```

Production migration must use a controlled migration role.

Do not run destructive migrations automatically without approval.

---

# 27. Feature flags

Deploy new high-impact features disabled.

Examples:

```text
enable_prediction_agent_v2
enable_eoi_drafting
enable_cio_briefing
enable_new_portfolio_score
enable_new_market_provider
```

Release flow:

```text
deploy code
test in staging
enable for internal users
enable for beta cohort
monitor
expand rollout
```

Feature flags must not bypass security or approval.

---

# 28. Smoke tests

Every deployment must run smoke tests.

Backend:

```text
health
readiness
authentication
database connectivity
basic property endpoint
```

AI platform:

```text
health
readiness
mock agent execution
checkpoint write/read
provider disabled/enabled state
```

Data platform:

```text
job starts
source access test
staging write
quality validation
no-op publication test
```

Frontend:

```text
app launches
login screen
API connectivity
basic navigation
```

Smoke tests must avoid production data changes unless specifically designed and isolated.

---

# 29. Health and readiness

Backend and AI platform must expose:

```text
/health
/ready
```

`/health` checks process availability.

`/ready` checks required dependencies such as:

- database;
- configuration;
- checkpoint store;
- critical internal services.

Do not make readiness depend on every optional external provider.

Expose optional provider status separately.

---

# 30. Observability deployment

Configure:

- Cloud Logging;
- Cloud Monitoring;
- uptime checks;
- error-rate alerts;
- latency alerts;
- Cloud Run revision metrics;
- job failure alerts;
- Scheduler failure alerts;
- budget alerts;
- Sentry where used;
- OpenTelemetry export where used.

Shared identifiers:

```text
trace_id
request_id
execution_id
job_id
event_id
```

---

# 31. Alerts

Production alerts should include:

- backend error-rate increase;
- AI execution failure increase;
- provider outage;
- data job failure;
- stale critical dataset;
- migration failure;
- email failure increase;
- notification delivery failure;
- database connection saturation;
- Cloud Run instance or latency issue;
- cost anomaly;
- secret expiry or credential failure;
- backup failure.

Alerts must route to an owned channel.

Every alert must have a runbook.

---

# 32. Logging configuration

Use structured JSON logs.

Production log level:

```text
INFO
```

Debug may be temporarily enabled through controlled configuration.

Redact:

- access tokens;
- provider keys;
- complete connection strings;
- service-role keys;
- private documents;
- full model prompts with sensitive data;
- unnecessary financial values;
- recipient content where not required.

---

# 33. Cost controls

Configure:

- Google Cloud budgets;
- provider budgets;
- model cost alerts;
- Cloud Run max instances;
- Cloud Run Job task limits;
- Scheduler frequency controls;
- storage lifecycle policies;
- log retention;
- egress monitoring;
- database plan monitoring;
- maps and geocoding quotas;
- email quotas.

Review cost per:

- active user;
- AI execution;
- agent;
- data source;
- report;
- notification;
- environment.

---

# 34. Rollback strategy

## 34.1 Cloud Run rollback

Cloud Run keeps revisions.

Rollback by routing traffic to a prior healthy revision.

Requirements:

- prior image retained;
- prior environment configuration known;
- database compatibility confirmed;
- smoke test after rollback.

## 34.2 Frontend rollback

Options:

- Expo Updates rollback where compatible;
- submit previous app binary where necessary;
- disable feature through feature flag;
- remote configuration fallback.

Do not use an over-the-air update for changes that violate platform restrictions or require native changes.

## 34.3 Database rollback

Prefer forward fixes.

Use Alembic downgrade only when safe.

For destructive or data migrations:

- restore backup;
- reverse backfill;
- deploy compatibility code;
- follow documented runbook.

## 34.4 AI rollback

Rollback may include:

- prior Cloud Run revision;
- prior prompt version;
- prior agent version;
- prior model policy;
- disabling an agent;
- clearing or invalidating affected cache.

## 34.5 Data rollback

Support:

- previous dataset version;
- atomic view or pointer switch;
- invalidation event;
- reprocessing;
- quality incident record.

---

# 35. Disaster recovery

Document:

- recovery-time objective;
- recovery-point objective;
- database restore;
- storage restore;
- secret recovery;
- service redeployment;
- DNS recovery;
- provider credential rotation;
- AI prompt and agent recovery;
- data pipeline replay.

Test restoration periodically.

A backup is not complete until restore has been tested.

---

# 36. Database backups

Use Supabase backup and point-in-time recovery capabilities available under the selected plan.

Document:

- backup frequency;
- retention;
- restoration process;
- restoration environment;
- ownership;
- verification;
- encryption;
- document storage backup.

Do not assume application-level soft deletion replaces backups.

---

# 37. Storage lifecycle

Define policies for:

- uploaded property documents;
- inspection photos;
- generated reports;
- raw datasets;
- processed datasets;
- temporary files;
- failed uploads.

Examples:

```text
temporary uploads: delete after short retention
raw public data: retain according to policy
licensed data: retain according to contract
generated reports: retain while user account is active
```

Never apply lifecycle deletion without respecting legal and contractual retention.

---

# 38. Security deployment checks

Before production:

- HTTPS enforced;
- CORS restricted;
- RLS enabled;
- service roles least-privilege;
- Secret Manager configured;
- no secrets in images;
- no secrets in frontend;
- signed URLs expire;
- upload restrictions active;
- email approval enforced;
- AI tool allowlists active;
- internal services authenticated;
- dependency scan passed;
- container scan passed;
- security headers configured;
- audit logging enabled.

---

# 39. Production readiness checklist

## Infrastructure

- production Google Cloud project;
- production Supabase project;
- Artifact Registry;
- Cloud Run services;
- Cloud Run Jobs;
- Scheduler;
- service accounts;
- Secret Manager;
- DNS and TLS.

## Data

- migrations complete;
- RLS tested;
- seed data loaded;
- backup confirmed;
- restore documented;
- provider licences recorded;
- critical datasets current.

## Backend

- health and readiness;
- rate limiting;
- audit;
- email provider;
- notifications;
- feature flags;
- error handling.

## AI

- production prompts published;
- model providers configured;
- evaluations passed;
- cost limits;
- cache policies;
- prompt injection tests;
- fallback tested.

## Frontend

- app identifiers;
- store listings;
- privacy text;
- production API URL;
- Sentry;
- push configuration;
- release build tested.

## Operations

- alerts;
- runbooks;
- on-call owner;
- rollback test;
- budget alerts;
- incident process.

---

# 40. Required environment variables

Each project must maintain `.env.example`.

## Frontend

```text
EXPO_PUBLIC_APP_ENV=
EXPO_PUBLIC_API_BASE_URL=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_GOOGLE_MAPS_KEY=
```

## Backend

```text
APP_ENV=
DATABASE_URL=
DATABASE_DIRECT_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
AI_PLATFORM_BASE_URL=
AI_PLATFORM_AUDIENCE=
SENDGRID_API_KEY=
EMAIL_FROM_ADDRESS=
EMAIL_REPLY_TO=
SENTRY_DSN=
```

## AI platform

```text
APP_ENV=
DATABASE_URL=
LANGGRAPH_CHECKPOINT_DATABASE_URL=
BACKEND_BASE_URL=
BACKEND_SERVICE_AUDIENCE=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
AWS_REGION=
VOYAGE_API_KEY=
SENTRY_DSN=
```

## Data platform

```text
APP_ENV=
DATABASE_URL=
GOOGLE_CLOUD_PROJECT=
RAW_DATA_BUCKET=
PROCESSED_DATA_BUCKET=
BACKEND_BASE_URL=
DATASET_EVENT_ENDPOINT=
PROPERTY_DATA_PROVIDER_API_KEY=
MAPS_API_KEY=
SENTRY_DSN=
```

Only include variables for implemented providers.

---

# 41. SETUP.md requirements

Every project’s `SETUP.md` must state:

- variable name;
- purpose;
- required or optional;
- where to obtain it;
- expected format;
- environment scope;
- permissions required;
- test method;
- rotation method;
- production restrictions.

The parent setup guide must also list:

- Google Cloud project IDs;
- regions;
- service names;
- job names;
- Scheduler jobs;
- Artifact Registry;
- service accounts;
- domains;
- Supabase projects;
- storage buckets;
- OAuth redirect URLs;
- webhook URLs;
- email-domain configuration;
- provider accounts;
- monitoring destinations.

---

# 42. Deployment ownership

Assign ownership for:

- frontend release;
- backend release;
- AI release;
- data release;
- database migration;
- provider credentials;
- DNS;
- Supabase;
- Google Cloud;
- monitoring;
- incident response;
- rollback approval.

No production deployment should depend on one person’s undocumented account.

---

# 43. Codex deployment rules

Codex must:

1. create Dockerfiles for backend, AI, and data projects;
2. create reproducible local commands;
3. create `.env.example`;
4. create deployment scripts or CI definitions;
5. use immutable image references;
6. never invent live project IDs or secrets;
7. never place service keys in frontend;
8. create health and readiness endpoints;
9. document IAM roles;
10. document migrations;
11. create rollback instructions;
12. create smoke tests;
13. update deployment docs when variables change;
14. avoid automatically enabling risky features;
15. report blocked external configuration clearly.

---

# 44. Definition of done

Deployment is complete when:

- all four projects have documented deployment paths;
- local development is reproducible;
- development, staging, and production are isolated;
- Cloud Run services deploy successfully;
- Cloud Run Jobs execute successfully;
- Scheduler invokes authenticated targets;
- frontend builds through EAS;
- Supabase Auth, Storage, Realtime, RLS, and database are configured;
- secrets are managed in Secret Manager;
- service accounts use least privilege;
- CI/CD runs tests before deployment;
- migrations are controlled;
- smoke tests pass;
- observability and alerts are active;
- custom domains and TLS work;
- rollback is documented and tested;
- backups and restore are documented;
- all required values are listed in `SETUP.md`;
- no real secrets are committed;
- production release requires approval.

---

# 45. Final deployment principle

TrackMyProps deployment must be:

```text
Repeatable
Traceable
Secure
Environment-isolated
Observable
Reversible
```

A deployment is not successful merely because a service starts.

It is successful when the correct version is running, the correct configuration is applied, dependencies are healthy, migrations are compatible, monitoring is active, rollback is possible, and the user experience remains safe.
