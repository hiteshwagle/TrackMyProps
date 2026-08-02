# TrackMyProps Consolidated Setup Guide

## 1. Purpose

This document is the master setup and handover guide for TrackMyProps.

It must be completed after Codex generates the four projects:

```text
TrackMyProps/
├── frontend/
├── backend/
├── ai-platform/
└── data-platform/
```

This guide lists every external account, credential, connection string, environment variable, service, permission, domain, bucket, redirect URL, webhook, provider configuration, and manual step required to run TrackMyProps locally, in development, staging, and production.

This file must contain placeholders only.

Never commit real secrets.

---

# 2. Environment matrix

TrackMyProps uses four environments:

```text
local
development
staging
production
```

Complete this table:

| Setting | Local | Development | Staging | Production |
|---|---|---|---|---|
| Frontend URL |  |  |  |  |
| Backend API URL |  |  |  |  |
| AI platform URL |  |  |  |  |
| Supabase project URL |  |  |  |  |
| Google Cloud project ID |  |  |  |  |
| Google Cloud region |  |  |  |  |
| App environment name | local | development | staging | production |

Recommended production region:

```text
australia-southeast1
```

Confirm actual service availability before finalising.

---

# 3. Required accounts

Create or confirm access to the following accounts.

## 3.1 Source control

Required:

```text
GitHub organisation or account
```

Populate:

```text
GITHUB_ORG=
GITHUB_REPOSITORY_FRONTEND=
GITHUB_REPOSITORY_BACKEND=
GITHUB_REPOSITORY_AI_PLATFORM=
GITHUB_REPOSITORY_DATA_PLATFORM=
```

Required settings:

- protected production branch;
- pull-request approval;
- GitHub Actions enabled;
- secret scanning;
- dependency alerts;
- environment protection rules;
- staging and production environments;
- required reviewers.

---

## 3.2 Google Cloud

Create separate Google Cloud projects where possible.

Populate:

```text
GCP_PROJECT_ID_DEVELOPMENT=
GCP_PROJECT_ID_STAGING=
GCP_PROJECT_ID_PRODUCTION=
GCP_REGION=australia-southeast1
```

Enable billing.

Configure budget alerts.

Required APIs may include:

```text
run.googleapis.com
artifactregistry.googleapis.com
secretmanager.googleapis.com
cloudscheduler.googleapis.com
cloudbuild.googleapis.com
iamcredentials.googleapis.com
logging.googleapis.com
monitoring.googleapis.com
storage.googleapis.com
```

Optional:

```text
pubsub.googleapis.com
eventarc.googleapis.com
cloudtrace.googleapis.com
cloudkms.googleapis.com
```

---

## 3.3 Supabase

Create separate Supabase projects for:

```text
development
staging
production
```

Populate:

```text
SUPABASE_PROJECT_REF_DEVELOPMENT=
SUPABASE_PROJECT_REF_STAGING=
SUPABASE_PROJECT_REF_PRODUCTION=
```

Required Supabase features:

- PostgreSQL;
- Auth;
- Storage;
- Realtime;
- Row Level Security;
- backups;
- database extensions;
- connection pooler.

---

## 3.4 Expo

Create or confirm an Expo account.

Populate:

```text
EXPO_ACCOUNT=
EXPO_PROJECT_ID=
EXPO_OWNER=
```

Required:

- EAS Build;
- EAS Submit;
- EAS Update if used;
- development builds;
- preview builds;
- production builds.

---

## 3.5 Apple

Required for iOS release:

```text
APPLE_DEVELOPER_TEAM_ID=
APPLE_BUNDLE_IDENTIFIER=
APP_STORE_CONNECT_APP_ID=
APPLE_KEY_ID=
APPLE_ISSUER_ID=
```

Manual configuration:

- Apple Developer membership;
- App Store Connect app;
- signing certificates;
- provisioning profiles;
- Sign in with Apple;
- APNs;
- privacy disclosures;
- associated domains if required.

Do not commit Apple private keys.

---

## 3.6 Google Play and Firebase

Required for Android release and push notifications:

```text
ANDROID_APPLICATION_ID=
GOOGLE_PLAY_APP_ID=
FIREBASE_PROJECT_ID=
FIREBASE_ANDROID_APP_ID=
FIREBASE_IOS_APP_ID=
```

Manual configuration:

- Google Play Console app;
- Android signing;
- Firebase project;
- Android and iOS Firebase apps;
- FCM configuration;
- service account for Play submission where required.

---

# 4. Parent folder configuration

Recommended parent structure:

```text
TrackMyProps/
├── SKILL.md
├── architecture.md
├── coding-standards.md
├── database.md
├── ai-guidelines.md
├── deployment.md
├── roadmap.md
├── security.md
├── SETUP.md
├── frontend/
├── backend/
├── ai-platform/
└── data-platform/
```

Optional shared contracts:

```text
TrackMyProps/contracts/
├── openapi/
├── events/
├── json-schema/
├── enums/
└── examples/
```

---

# 5. Supabase configuration

## 5.1 Project values

For each environment, populate:

```text
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_ISSUER=
SUPABASE_JWT_AUDIENCE=
SUPABASE_PROJECT_REF=
```

The service-role key must never be exposed to the frontend.

---

## 5.2 PostgreSQL connection strings

Populate:

```text
DATABASE_URL=
DATABASE_DIRECT_URL=
DATABASE_POOLER_URL=
DATABASE_HOST=
DATABASE_PORT=5432
DATABASE_NAME=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_SSL_MODE=require
```

Use:

- pooler connection for normal application traffic where appropriate;
- direct connection for migrations;
- separate database roles per service.

Recommended service roles:

```text
trackmyprops_backend_app
trackmyprops_ai_app
trackmyprops_data_ingest
trackmyprops_data_publish
trackmyprops_readonly
trackmyprops_migration
```

Record the actual username for each environment.

---

## 5.3 Database extensions

Enable:

```sql
create extension if not exists pgcrypto;
create extension if not exists postgis;
create extension if not exists vector;
create extension if not exists citext;
```

Only retain extensions used by the implementation.

---

## 5.4 Supabase Auth

Configure:

```text
SUPABASE_SITE_URL=
SUPABASE_REDIRECT_URLS=
SUPABASE_EMAIL_CONFIRMATION_ENABLED=
SUPABASE_PASSWORD_RESET_URL=
SUPABASE_SESSION_DURATION=
```

OAuth providers:

### Google

```text
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
```

### Apple

```text
APPLE_SERVICE_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY_SECRET_NAME=
```

Add environment-specific redirect URLs.

Example placeholders:

```text
trackmyprops://auth/callback
https://app.example.com/auth/callback
```

---

## 5.5 Supabase Storage

Create private buckets.

Suggested:

```text
property-documents
inspection-media
generated-reports
raw-data
processed-data
```

Populate:

```text
SUPABASE_STORAGE_PROPERTY_DOCUMENTS_BUCKET=
SUPABASE_STORAGE_INSPECTION_MEDIA_BUCKET=
SUPABASE_STORAGE_GENERATED_REPORTS_BUCKET=
SUPABASE_STORAGE_RAW_DATA_BUCKET=
SUPABASE_STORAGE_PROCESSED_DATA_BUCKET=
```

Configure:

- file-size limits;
- allowed MIME types;
- RLS;
- signed URL duration;
- retention;
- deletion behaviour.

---

## 5.6 Supabase Realtime

Enable only the required tables.

Potential channels:

```text
ai_execution_events
recommendations
notifications
communication_drafts
portfolio_updates
```

Populate:

```text
SUPABASE_REALTIME_ENABLED=true
```

Do not enable realtime on raw or staging data tables.

---

# 6. Google Cloud resource setup

## 6.1 Artifact Registry

Create a Docker repository.

Populate:

```text
ARTIFACT_REGISTRY_REPOSITORY=
ARTIFACT_REGISTRY_LOCATION=australia-southeast1
```

Image names:

```text
backend
ai-platform
data-platform
```

Use immutable image digests in production.

---

## 6.2 Cloud Run services

Create:

```text
CLOUD_RUN_BACKEND_SERVICE=
CLOUD_RUN_AI_SERVICE=
```

Populate:

```text
BACKEND_CLOUD_RUN_URL=
AI_PLATFORM_CLOUD_RUN_URL=
```

Recommended names:

```text
tmp-{env}-backend
tmp-{env}-ai-platform
```

Configure:

- service account;
- CPU;
- memory;
- timeout;
- concurrency;
- minimum instances;
- maximum instances;
- ingress;
- authentication;
- secrets;
- custom domains.

---

## 6.3 Cloud Run Jobs

Create jobs:

```text
CLOUD_RUN_JOB_DATA_REFRESH=
CLOUD_RUN_JOB_DATA_BACKFILL=
CLOUD_RUN_JOB_DATA_VERIFY=
CLOUD_RUN_JOB_DATA_RECONCILE=
CLOUD_RUN_JOB_DATA_CLEANUP=
```

Recommended names:

```text
tmp-{env}-data-refresh
tmp-{env}-data-backfill
tmp-{env}-data-verify
tmp-{env}-data-reconcile
tmp-{env}-data-cleanup
```

Configure:

- service account;
- timeout;
- retries;
- CPU;
- memory;
- task count;
- parallelism;
- secrets;
- environment variables.

---

## 6.4 Cloud Scheduler

Create Scheduler jobs for:

```text
data refresh
data verification
stale dataset checks
daily CIO briefing
retention cleanup
notification digest
```

Populate:

```text
SCHEDULER_DATA_REFRESH_JOB=
SCHEDULER_DATA_VERIFY_JOB=
SCHEDULER_DATA_STALE_CHECK_JOB=
SCHEDULER_CIO_BRIEFING_JOB=
SCHEDULER_RETENTION_CLEANUP_JOB=
```

For each job record:

```text
schedule
timezone
target
service account
retry policy
```

Recommended timezone:

```text
Australia/Sydney
```

---

## 6.5 Google Cloud Storage

If GCS is used for data-platform files, create:

```text
GCS_RAW_DATA_BUCKET=
GCS_PROCESSED_DATA_BUCKET=
GCS_TEMPORARY_BUCKET=
```

Configure:

- region;
- lifecycle;
- versioning;
- service access;
- encryption;
- retention;
- logging.

---

# 7. Service accounts and IAM

Create:

```text
BACKEND_SERVICE_ACCOUNT=
AI_SERVICE_ACCOUNT=
DATA_INGEST_SERVICE_ACCOUNT=
DATA_PUBLISH_SERVICE_ACCOUNT=
DEPLOYER_SERVICE_ACCOUNT=
SCHEDULER_SERVICE_ACCOUNT=
```

Recommended:

```text
tmp-{env}-backend-sa
tmp-{env}-ai-sa
tmp-{env}-data-ingest-sa
tmp-{env}-data-publish-sa
tmp-{env}-deployer-sa
tmp-{env}-scheduler-sa
```

Document IAM roles for each.

## Backend service account

Possible permissions:

- selected Secret Manager secrets;
- Cloud Logging;
- Cloud Monitoring;
- invoke AI Cloud Run service;
- selected storage buckets;
- selected event publishing.

## AI service account

Possible permissions:

- model provider secrets;
- backend internal invocation;
- checkpoint database secret;
- logging;
- monitoring;
- temporary document access.

## Data ingest service account

Possible permissions:

- source credentials;
- raw storage;
- staging database;
- logging.

## Data publish service account

Possible permissions:

- canonical and curated database;
- quality and lineage;
- event publishing.

## Deployer service account

Possible permissions:

- push Artifact Registry;
- deploy Cloud Run;
- update Cloud Run Jobs;
- use runtime service accounts.

Do not grant Owner or Editor.

---

# 8. Secret Manager inventory

Create separate secrets by environment.

Required secret names may include:

```text
DATABASE_URL
DATABASE_DIRECT_URL
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
ANTHROPIC_API_KEY
GOOGLE_API_KEY
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_SESSION_TOKEN
VOYAGE_API_KEY
SENDGRID_API_KEY
EMAIL_WEBHOOK_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
REVENUECAT_SECRET_KEY
REVENUECAT_WEBHOOK_SECRET
SENTRY_DSN
GOOGLE_OAUTH_CLIENT_SECRET
APPLE_PRIVATE_KEY
```

Populate actual Secret Manager names:

```text
SECRET_DATABASE_URL=
SECRET_SUPABASE_SERVICE_ROLE_KEY=
SECRET_OPENAI_API_KEY=
SECRET_ANTHROPIC_API_KEY=
SECRET_SENDGRID_API_KEY=
```

Only create secrets for implemented integrations.

---

# 9. Frontend environment variables

Create:

```text
frontend/.env.example
```

Allowed public variables:

```text
EXPO_PUBLIC_APP_ENV=
EXPO_PUBLIC_API_BASE_URL=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_GOOGLE_MAPS_KEY=
EXPO_PUBLIC_SUPPORT_EMAIL=
EXPO_PUBLIC_TERMS_URL=
EXPO_PUBLIC_PRIVACY_URL=
EXPO_PUBLIC_FEATURE_FLAG_SOURCE=
```

Do not include:

```text
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
OPENAI_API_KEY
ANTHROPIC_API_KEY
SENDGRID_API_KEY
STRIPE_SECRET_KEY
PRIVATE_KEYS
```

---

# 10. Frontend application identifiers

Populate:

```text
EXPO_SLUG=
EXPO_PROJECT_ID=
IOS_BUNDLE_IDENTIFIER=
ANDROID_PACKAGE_NAME=
WEB_APP_URL=
APP_SCHEME=trackmyprops
```

Configure deep links:

```text
trackmyprops://
```

Add OAuth callbacks.

---

# 11. Backend environment variables

Create:

```text
backend/.env.example
```

## Application

```text
APP_ENV=
APP_NAME=TrackMyProps Backend
APP_VERSION=
LOG_LEVEL=
API_PREFIX=/api/v1
TIMEZONE=Australia/Sydney
CORS_ALLOWED_ORIGINS=
```

## Database

```text
DATABASE_URL=
DATABASE_DIRECT_URL=
DATABASE_POOL_SIZE=
DATABASE_MAX_OVERFLOW=
DATABASE_STATEMENT_TIMEOUT_SECONDS=
```

## Supabase

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_ISSUER=
SUPABASE_JWT_AUDIENCE=
```

## AI platform

```text
AI_PLATFORM_BASE_URL=
AI_PLATFORM_SERVICE_AUDIENCE=
AI_PLATFORM_TIMEOUT_SECONDS=
```

## Email

```text
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=
EMAIL_FROM_ADDRESS=
EMAIL_FROM_NAME=TrackMyProps
EMAIL_REPLY_TO=
SENDGRID_WEBHOOK_SECRET=
EMAIL_SANDBOX_MODE=
```

## Notifications

```text
EXPO_ACCESS_TOKEN=
FCM_PROJECT_ID=
APNS_CONFIGURATION_REFERENCE=
```

## Storage

```text
PROPERTY_DOCUMENTS_BUCKET=
INSPECTION_MEDIA_BUCKET=
GENERATED_REPORTS_BUCKET=
SIGNED_URL_EXPIRY_SECONDS=
```

## Billing

```text
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
REVENUECAT_PUBLIC_API_KEY=
REVENUECAT_SECRET_API_KEY=
REVENUECAT_WEBHOOK_SECRET=
```

Only include billing providers actually used.

## Observability

```text
SENTRY_DSN=
OTEL_EXPORTER_OTLP_ENDPOINT=
OTEL_SERVICE_NAME=trackmyprops-backend
TRACE_SAMPLE_RATE=
```

## Security and limits

```text
RATE_LIMIT_ENABLED=
MAX_UPLOAD_SIZE_BYTES=
MAX_DOCUMENTS_PER_PROPERTY=
IDEMPOTENCY_TTL_SECONDS=
```

---

# 12. AI platform environment variables

Create:

```text
ai-platform/.env.example
```

## Application

```text
APP_ENV=
APP_NAME=TrackMyProps AI Platform
APP_VERSION=
LOG_LEVEL=
API_PREFIX=/api/v1
```

## Backend integration

```text
BACKEND_BASE_URL=
BACKEND_SERVICE_AUDIENCE=
AI_PLATFORM_SERVICE_AUDIENCE=
SERVICE_AUTH_MODE=
```

## Database and checkpoints

```text
DATABASE_URL=
LANGGRAPH_CHECKPOINT_DATABASE_URL=
DATABASE_POOL_SIZE=
DATABASE_MAX_OVERFLOW=
```

## Cache

```text
CACHE_BACKEND=postgres
CACHE_DATABASE_URL=
REDIS_URL=
DEFAULT_CACHE_NAMESPACE=
```

## Model providers

```text
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
GOOGLE_VERTEX_PROJECT=
GOOGLE_VERTEX_LOCATION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SESSION_TOKEN=
AWS_REGION=
AWS_BEDROCK_REGION=
VOYAGE_API_KEY=
LITELLM_PROXY_URL=
LITELLM_MASTER_KEY=
```

Only retain configured providers.

## Model routing

```text
DEFAULT_ECONOMY_MODEL=
DEFAULT_BALANCED_MODEL=
DEFAULT_REASONING_MODEL=
DEFAULT_VISION_MODEL=
DEFAULT_EMBEDDING_MODEL=
DEFAULT_RERANK_MODEL=
MODEL_COST_CONFIG_PATH=
```

## Execution limits

```text
MAX_EXECUTION_SECONDS=
MAX_GRAPH_STEPS=
MAX_TOOL_CALLS=
MAX_INPUT_TOKENS=
MAX_OUTPUT_TOKENS=
```

## Observability

```text
SENTRY_DSN=
OTEL_EXPORTER_OTLP_ENDPOINT=
OTEL_SERVICE_NAME=trackmyprops-ai-platform
TRACE_SAMPLE_RATE=
```

## Testing

```text
ENABLE_LIVE_MODEL_TESTS=false
```

---

# 13. Data platform environment variables

Create:

```text
data-platform/.env.example
```

## Application

```text
APP_ENV=
APP_NAME=TrackMyProps Data Platform
APP_VERSION=
LOG_LEVEL=
TIMEZONE=Australia/Sydney
```

## Google Cloud

```text
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_REGION=
ARTIFACT_REGISTRY_REPOSITORY=
RAW_DATA_BUCKET=
PROCESSED_DATA_BUCKET=
TEMP_DATA_BUCKET=
```

## Database

```text
DATABASE_URL=
DATABASE_POOL_SIZE=
DATABASE_MAX_OVERFLOW=
DATABASE_STATEMENT_TIMEOUT_SECONDS=
```

## Supabase Storage, if used

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_RAW_BUCKET=
SUPABASE_STORAGE_PROCESSED_BUCKET=
```

## Job configuration

```text
PIPELINE_ID=
PIPELINE_PARTITION=
JOB_RUN_ID=
MAX_RETRIES=
HTTP_TIMEOUT_SECONDS=
DOWNLOAD_CHUNK_SIZE=
DEFAULT_CONCURRENCY=
ENABLE_DRY_RUN=
```

## Event publishing

```text
BACKEND_BASE_URL=
BACKEND_SERVICE_AUDIENCE=
DATASET_EVENT_ENDPOINT=
EVENT_PUBLISHING_ENABLED=
```

## Source credentials

Examples:

```text
PROPERTY_DATA_PROVIDER_API_KEY=
PROPERTY_DATA_PROVIDER_BASE_URL=
SCHOOL_DATA_API_KEY=
CRIME_DATA_API_KEY=
MAPS_API_KEY=
GEOCODING_API_KEY=
```

Only include approved sources.

## Observability

```text
SENTRY_DSN=
OTEL_EXPORTER_OTLP_ENDPOINT=
OTEL_SERVICE_NAME=trackmyprops-data-platform
TRACE_SAMPLE_RATE=
```

---

# 14. AI provider configuration

For each provider complete:

## 14.1 OpenAI

```text
OPENAI_ACCOUNT=
OPENAI_PROJECT_ID=
OPENAI_API_KEY_SECRET_NAME=
OPENAI_ALLOWED_MODELS=
OPENAI_MONTHLY_BUDGET=
```

Document:

- data retention;
- regional requirements;
- usage limits;
- fallback;
- test model;
- production model.

## 14.2 Anthropic

```text
ANTHROPIC_ACCOUNT=
ANTHROPIC_API_KEY_SECRET_NAME=
ANTHROPIC_ALLOWED_MODELS=
ANTHROPIC_MONTHLY_BUDGET=
```

## 14.3 Google Gemini or Vertex AI

```text
GOOGLE_VERTEX_PROJECT=
GOOGLE_VERTEX_LOCATION=
GOOGLE_VERTEX_ALLOWED_MODELS=
```

Document service-account permissions.

## 14.4 AWS Bedrock

```text
AWS_ACCOUNT_ID=
AWS_REGION=
AWS_BEDROCK_REGION=
AWS_ROLE_ARN=
AWS_BEDROCK_ALLOWED_MODELS=
```

Prefer role-based access over long-lived access keys.

## 14.5 Embeddings and reranking

```text
EMBEDDING_PROVIDER=
EMBEDDING_MODEL=
RERANK_PROVIDER=
RERANK_MODEL=
VOYAGE_API_KEY_SECRET_NAME=
```

---

# 15. Email configuration

Recommended provider:

```text
SendGrid
```

Populate:

```text
SENDGRID_ACCOUNT=
SENDGRID_API_KEY_SECRET_NAME=
EMAIL_FROM_ADDRESS=
EMAIL_FROM_NAME=
EMAIL_REPLY_TO=
SENDGRID_WEBHOOK_URL=
SENDGRID_WEBHOOK_SECRET=
```

Manual DNS:

```text
SPF
DKIM
DMARC
```

Complete:

```text
EMAIL_DOMAIN_VERIFIED=
SPF_STATUS=
DKIM_STATUS=
DMARC_STATUS=
```

Staging should use:

- sandbox mode;
- restricted recipients;
- separate sending domain or subdomain.

---

# 16. Expression-of-interest workflow setup

Required configuration:

```text
EOI_FEATURE_ENABLED=
EOI_DRAFT_ONLY=true
EOI_REQUIRE_USER_APPROVAL=true
EOI_MAX_SENDS_PER_DAY=
EOI_ALLOWED_RECIPIENT_DOMAINS=
```

Required backend controls:

- authenticated user;
- household permission;
- approved recipient;
- final subject snapshot;
- final body snapshot;
- idempotency key;
- audit record;
- send status;
- webhook tracking.

Do not enable automatic send in the initial release.

---

# 17. Maps and geocoding

Create separate keys for:

- frontend maps;
- backend geocoding;
- data-platform geospatial processing.

Populate:

```text
GOOGLE_MAPS_FRONTEND_KEY=
GOOGLE_MAPS_BACKEND_KEY=
GEOCODING_API_KEY=
```

Restrictions:

- iOS bundle ID;
- Android package;
- web domain;
- API restriction;
- server IP or identity where possible.

Configure budget and quota alerts.

---

# 18. Property and market data providers

For every source complete:

```text
SOURCE_NAME=
SOURCE_OWNER=
ACCESS_METHOD=
API_BASE_URL=
API_KEY_SECRET_NAME=
LICENCE_REFERENCE=
COMMERCIAL_USE_ALLOWED=
REDISTRIBUTION_ALLOWED=
DERIVED_OUTPUT_ALLOWED=
RAW_RETENTION_ALLOWED=
ATTRIBUTION_TEXT=
REFRESH_CADENCE=
RATE_LIMIT=
CONTRACT_REVIEW_DATE=
```

Potential categories:

- property listings;
- comparable sales;
- rental data;
- vacancy;
- valuations;
- school data;
- crime data;
- planning;
- infrastructure;
- hazard data;
- ABS;
- RBA.

Do not implement unclear or unauthorised sources.

---

# 19. Public data sources

Document the official access method for:

```text
ABS
RBA
data.gov.au
state open data portals
local government data
official school data
official crime data
official planning data
official hazard data
```

For each:

- source URL;
- licence;
- update cadence;
- attribution;
- schema;
- publication delay;
- API or bulk download;
- pipeline ID.

---

# 20. Billing configuration

Select billing architecture.

Possible providers:

```text
Stripe
RevenueCat
```

Populate:

```text
BILLING_PROVIDER=
STRIPE_ACCOUNT_ID=
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY_SECRET_NAME=
STRIPE_WEBHOOK_URL=
STRIPE_WEBHOOK_SECRET_NAME=
REVENUECAT_PROJECT_ID=
REVENUECAT_PUBLIC_API_KEY=
REVENUECAT_SECRET_API_KEY_SECRET_NAME=
REVENUECAT_WEBHOOK_URL=
REVENUECAT_WEBHOOK_SECRET_NAME=
```

Define:

- plans;
- entitlements;
- usage limits;
- AI quotas;
- trial;
- cancellation;
- refunds;
- invoice handling;
- tax handling.

---

# 21. Push notifications

Populate:

```text
EXPO_ACCESS_TOKEN_SECRET_NAME=
FCM_PROJECT_ID=
FCM_SERVICE_ACCOUNT_SECRET_NAME=
APNS_KEY_ID=
APNS_TEAM_ID=
APNS_PRIVATE_KEY_SECRET_NAME=
```

Configure:

- user preferences;
- quiet hours;
- token invalidation;
- staging test devices;
- production app identifiers.

---

# 22. Monitoring and observability

## 22.1 Sentry

Create separate projects:

```text
frontend
backend
ai-platform
data-platform
```

Populate:

```text
SENTRY_ORG=
SENTRY_PROJECT_FRONTEND=
SENTRY_PROJECT_BACKEND=
SENTRY_PROJECT_AI=
SENTRY_PROJECT_DATA=
```

## 22.2 OpenTelemetry

Populate:

```text
OTEL_EXPORTER_OTLP_ENDPOINT=
OTEL_AUTH_HEADER=
```

## 22.3 Google Cloud Monitoring

Create alerts for:

- backend error rate;
- backend latency;
- AI failure rate;
- AI cost spike;
- model provider outage;
- Cloud Run job failure;
- Scheduler failure;
- stale critical dataset;
- database connection saturation;
- email failure;
- notification failure;
- unusual authentication failure;
- budget threshold.

Assign alert destination:

```text
ALERT_EMAIL=
ALERT_SLACK_WEBHOOK=
ON_CALL_OWNER=
```

---

# 23. Logging retention

Define:

```text
APPLICATION_LOG_RETENTION_DAYS=
SECURITY_LOG_RETENTION_DAYS=
AUDIT_LOG_RETENTION_DAYS=
AI_EXECUTION_LOG_RETENTION_DAYS=
DATA_JOB_LOG_RETENTION_DAYS=
```

Logs must exclude secrets and unnecessary private data.

---

# 24. Domains and DNS

Populate:

```text
ROOT_DOMAIN=
APP_DOMAIN=
API_DOMAIN=
ADMIN_DOMAIN=
```

Suggested:

```text
app.trackmyprops.com.au
api.trackmyprops.com.au
```

AI platform should generally remain internal.

Configure:

- DNS;
- TLS;
- Cloud Run domain mapping;
- CORS;
- OAuth callbacks;
- Supabase redirects;
- email domain;
- webhook endpoints.

---

# 25. OAuth and redirect URLs

Maintain an exact list per environment.

Populate:

```text
OAUTH_REDIRECT_URLS_DEVELOPMENT=
OAUTH_REDIRECT_URLS_STAGING=
OAUTH_REDIRECT_URLS_PRODUCTION=
PASSWORD_RESET_URL=
EMAIL_CONFIRMATION_URL=
APPLE_CALLBACK_URL=
GOOGLE_CALLBACK_URL=
```

Include:

- mobile scheme;
- web URL;
- staging URL;
- production URL.

---

# 26. Webhook URLs

Populate:

```text
SENDGRID_WEBHOOK_URL=
STRIPE_WEBHOOK_URL=
REVENUECAT_WEBHOOK_URL=
PROPERTY_DATA_PROVIDER_WEBHOOK_URL=
AI_CALLBACK_URL=
DATASET_EVENT_URL=
```

For every webhook record:

- provider;
- endpoint;
- signing secret;
- expected events;
- retry policy;
- idempotency field;
- staging test process.

---

# 27. Database migration setup

Required commands:

```bash
alembic upgrade head
alembic downgrade <revision>
alembic current
alembic history
```

Migration connections:

```text
BACKEND_MIGRATION_DATABASE_URL=
AI_MIGRATION_DATABASE_URL=
DATA_MIGRATION_DATABASE_URL=
```

Rules:

- each service migrates only its own schema;
- staging before production;
- backup or recovery confirmed;
- destructive changes require approval;
- backfills documented.

---

# 28. Local development setup

## 28.1 Required tools

Install:

```text
Git
Node.js
npm or selected package manager
Expo CLI or EAS CLI
Python 3.12
uv or selected Python package manager
Docker
Docker Compose
Supabase CLI
Google Cloud CLI
```

## 28.2 Clone or create repositories

```bash
cd TrackMyProps
```

Ensure folders exist:

```text
frontend
backend
ai-platform
data-platform
```

## 28.3 Local environment files

Create:

```text
frontend/.env
backend/.env
ai-platform/.env
data-platform/.env
```

Never commit them.

## 28.4 Local database

Choose one:

```text
Supabase local
Docker PostgreSQL
development Supabase project
```

Recommended local services may include:

```text
PostgreSQL
Redis
Mailpit
mock AI provider
```

## 28.5 Start commands

Frontend:

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
python -m app.cli run-pipeline --pipeline-id <pipeline-id>
```

Actual commands must match the generated code.

---

# 29. CI/CD setup

Prefer GitHub Actions with Workload Identity Federation.

Populate:

```text
GCP_WORKLOAD_IDENTITY_PROVIDER=
GCP_DEPLOYER_SERVICE_ACCOUNT=
```

GitHub environments:

```text
development
staging
production
```

Required repository variables:

```text
GCP_PROJECT_ID
GCP_REGION
ARTIFACT_REGISTRY_REPOSITORY
CLOUD_RUN_SERVICE_NAME
```

Required protected secrets should be minimal.

Do not store long-lived Google service-account JSON keys when federation is available.

---

# 30. Build and deployment commands

Codex must generate actual scripts.

Expected conceptual commands:

## Backend

```bash
docker build -t backend .
docker push <registry>/backend:<tag>
gcloud run deploy <backend-service> --image <image>
```

## AI platform

```bash
docker build -t ai-platform .
docker push <registry>/ai-platform:<tag>
gcloud run deploy <ai-service> --image <image>
```

## Data platform

```bash
docker build -t data-platform .
docker push <registry>/data-platform:<tag>
gcloud run jobs update <job-name> --image <image>
```

## Frontend

```bash
eas build --profile preview
eas build --profile production
eas submit
```

---

# 31. Feature flags

Populate:

```text
FEATURE_PROPERTY_ANALYSIS=
FEATURE_PREDICTION_AGENT=
FEATURE_PORTFOLIO_PERFORMANCE=
FEATURE_SELL_HOLD_REFINANCE=
FEATURE_LISTING_DISCOVERY=
FEATURE_EOI_DRAFTING=
FEATURE_CIO_BRIEFING=
FEATURE_INVESTMENT_TUTOR=
FEATURE_PROPERTY_MANAGEMENT_TUTOR=
```

Initial production recommendations:

```text
EOI auto-send: disabled
new model versions: disabled until evaluated
new providers: disabled until configured
beta agents: limited cohort
```

---

# 32. Initial agent configuration

Populate agent registry values.

Example:

## Demographics Agent

```text
AGENT_ID=demographics
CACHE_STRATEGY=cache_until_ttl
CACHE_TTL_SECONDS=2592000
```

## Property Analysis Agent

```text
AGENT_ID=property_analysis
CACHE_STRATEGY=always_execute
```

## Prediction Agent

```text
AGENT_ID=prediction
CACHE_STRATEGY=cache_until_ttl
CACHE_TTL_SECONDS=21600
```

## Finance Agent

```text
AGENT_ID=finance
CACHE_STRATEGY=input_fingerprint
```

## EOI Agent

```text
AGENT_ID=expression_of_interest
CACHE_STRATEGY=disabled
REQUIRES_USER_APPROVAL=true
```

---

# 33. Data schedule configuration

For each pipeline populate:

```text
PIPELINE_ID=
SOURCE_ID=
SCHEDULE=
TIMEZONE=
MAX_RETRIES=
TIMEOUT_SECONDS=
QUALITY_PROFILE=
DOWNSTREAM_EVENT=
```

Examples:

```text
RBA rates
ABS demographics
schools
crime
infrastructure
hazards
market sales
rental metrics
listing refresh
```

Do not create a schedule before source access and licence are approved.

---

# 34. Security setup checklist

Complete:

```text
[ ] RLS enabled
[ ] Cross-household tests pass
[ ] Service accounts are separate
[ ] Secret Manager configured
[ ] No service-role key in frontend
[ ] Internal Cloud Run authentication enabled
[ ] Signed URLs configured
[ ] Upload MIME validation configured
[ ] Malware scanning decision documented
[ ] Rate limiting configured
[ ] Webhook signatures configured
[ ] AI tool allowlists configured
[ ] Prompt-injection tests pass
[ ] EOI approval enforced
[ ] Audit logging active
[ ] Security alerts active
[ ] Backup restore tested
```

---

# 35. Production readiness checklist

## Infrastructure

```text
[ ] Production Google Cloud project
[ ] Production Supabase project
[ ] Artifact Registry
[ ] Cloud Run backend
[ ] Cloud Run AI platform
[ ] Cloud Run Jobs
[ ] Cloud Scheduler
[ ] Service accounts
[ ] Secret Manager
[ ] DNS and TLS
```

## Database

```text
[ ] Migrations applied
[ ] RLS tested
[ ] Indexes created
[ ] Backups enabled
[ ] Restore tested
[ ] Service roles created
```

## Frontend

```text
[ ] iOS bundle configured
[ ] Android package configured
[ ] EAS production profile
[ ] Store listings
[ ] Privacy disclosures
[ ] Production URLs
[ ] Push notifications
```

## Backend

```text
[ ] Auth validation
[ ] Rate limits
[ ] Email provider
[ ] Notifications
[ ] Audit
[ ] Feature flags
[ ] Health and readiness
```

## AI

```text
[ ] Production prompts
[ ] Agent versions
[ ] Model routing
[ ] Evaluations passed
[ ] Cache policies
[ ] Cost limits
[ ] Prompt-injection tests
[ ] Fallback tested
```

## Data

```text
[ ] Source licences
[ ] Scheduled pipelines
[ ] Data quality
[ ] Lineage
[ ] Stale alerts
[ ] Publishing events
```

## Operations

```text
[ ] Monitoring
[ ] Alerts
[ ] Runbooks
[ ] Rollback
[ ] Incident owner
[ ] Budget alerts
[ ] Support process
```

---

# 36. Final configuration handover table

Codex must generate a completed placeholder table at the end of the build.

| Category | Name | Required | Environment | Where to obtain | Secret | Status |
|---|---|---:|---|---|---:|---|
| Supabase | SUPABASE_URL | Yes | All | Supabase dashboard | No | |
| Supabase | SUPABASE_ANON_KEY | Yes | Frontend | Supabase dashboard | Public | |
| Supabase | SUPABASE_SERVICE_ROLE_KEY | Yes | Backend | Supabase dashboard | Yes | |
| Database | DATABASE_URL | Yes | Services | Supabase database settings | Yes | |
| Google Cloud | GCP_PROJECT_ID | Yes | Cloud | Google Cloud Console | No | |
| Google Cloud | GCP_REGION | Yes | Cloud | Architecture choice | No | |
| AI | OPENAI_API_KEY | Optional | AI | Provider console | Yes | |
| Email | SENDGRID_API_KEY | Optional | Backend | SendGrid | Yes | |
| Maps | GOOGLE_MAPS_KEY | Optional | Frontend | Google Cloud | Restricted | |
| Monitoring | SENTRY_DSN | Recommended | All | Sentry | Limited | |

Expand this table for every implemented integration.

---

# 37. Values Codex must never invent

Codex must not invent:

- Google Cloud project IDs;
- Supabase URLs;
- database passwords;
- service-role keys;
- provider keys;
- email addresses;
- sending domains;
- OAuth client IDs;
- Apple team IDs;
- package names;
- bundle identifiers;
- legal company details;
- property data endpoints;
- licences;
- webhook secrets;
- production domains;
- tax rates;
- subscription prices.

Use placeholders and mark them clearly.

---

# 38. Setup completion criteria

Setup is complete only when:

- every required account exists;
- all environment variables are documented;
- all secrets exist in Secret Manager;
- all service accounts exist;
- IAM is least-privilege;
- Supabase projects are configured;
- migrations run;
- RLS tests pass;
- storage buckets exist;
- OAuth redirects are configured;
- frontend builds;
- backend deploys;
- AI platform deploys;
- data jobs execute;
- Scheduler runs;
- model providers respond;
- email domain is authenticated;
- notifications work;
- monitoring and alerts are active;
- backups and restore are verified;
- production readiness checklist passes;
- no real secret is stored in source control.

---

# 39. Final handover principle

At the end of implementation, another engineer must be able to deploy TrackMyProps using only:

```text
README.md
SETUP.md
.env.example
deployment.md
security.md
```

No critical configuration may exist only in:

- a developer’s memory;
- a private message;
- an untracked local file;
- a personal cloud account;
- an undocumented dashboard setting.

The setup is complete only when the system is reproducible, secure, and fully documented.
