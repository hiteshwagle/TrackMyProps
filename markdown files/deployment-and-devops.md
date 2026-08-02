# TrackMyProps Deployment and DevOps

## 1. Purpose

This document defines the operational deployment and DevOps standards for TrackMyProps.

It applies to:

```text
TrackMyProps/
├── frontend/
├── backend/
├── ai-platform/
└── data-platform/
```

It covers:

- environments;
- Git strategy;
- branch protection;
- CI/CD;
- artifact creation;
- container deployment;
- Expo EAS;
- Cloud Run;
- Cloud Run Jobs;
- Supabase migrations;
- secrets;
- feature flags;
- rollout strategies;
- rollback;
- backups;
- disaster recovery integration;
- release governance;
- production operations;
- infrastructure ownership.

This document complements:

```text
deployment.md
security.md
observability.md
testing-strategy.md
incident-response.md
```

---

# 2. DevOps principles

1. Every production change is version controlled.
2. Every deployment is reproducible.
3. Infrastructure changes are reviewed.
4. Secrets are never committed.
5. Production deployment requires automated validation.
6. Database migrations are treated as production code.
7. Rollback or forward-fix must be planned before release.
8. Environments must be isolated.
9. Service accounts follow least privilege.
10. Builds are immutable.
11. Production artifacts are promoted, not rebuilt.
12. Every release is observable.
13. High-risk features use feature flags.
14. Deployments must fail safely.
15. Manual production access is exceptional and audited.

---

# 3. Project deployment model

## Frontend

```text
Expo React Native
Expo Application Services
iOS
Android
Web
```

## Backend

```text
FastAPI
Docker
Google Cloud Run
```

## AI platform

```text
FastAPI
LangGraph
Docker
Google Cloud Run
```

## Data platform

```text
Python jobs
Docker
Google Cloud Run Jobs
Google Cloud Scheduler
```

## Shared platform

```text
Supabase PostgreSQL
Supabase Auth
Supabase Storage
Supabase Realtime
Google Secret Manager
Google Artifact Registry
Google Cloud Logging
Google Cloud Monitoring
```

---

# 4. Environment strategy

Required environments:

```text
local
ci
development
staging
production
```

Optional:

```text
preview
sandbox
performance
disaster-recovery
```

---

# 5. Environment isolation

Each environment must use separate:

- Supabase project or isolated database;
- storage buckets;
- Cloud Run services;
- Cloud Run Jobs;
- secrets;
- service accounts;
- provider credentials;
- email domains or sandbox mode;
- billing configuration;
- monitoring labels;
- event topics;
- analytics environment.

Production credentials must never be reused outside production.

---

# 6. Recommended environment mapping

| Environment | Purpose | Data |
|---|---|---|
| Local | Developer workflow | Synthetic |
| CI | Automated validation | Ephemeral synthetic |
| Development | Shared integration | Synthetic or approved test |
| Staging | Production-like acceptance | Synthetic and de-identified |
| Production | Live service | Real user data |

Staging must not silently use production data.

---

# 7. Git repository model

Recommended repository structure:

```text
trackmyprops/
├── frontend/
├── backend/
├── ai-platform/
├── data-platform/
├── contracts/
├── infrastructure/
├── docs/
└── .github/
```

A monorepo is recommended initially because it simplifies:

- contract coordination;
- atomic changes;
- shared CI;
- documentation;
- dependency visibility;
- release traceability.

Separate repositories may be introduced later if ownership or scale requires them.

---

# 8. Branch strategy

Recommended:

```text
main
feature/*
fix/*
hotfix/*
release/*
```

Rules:

- `main` is always releasable;
- direct pushes to `main` are blocked;
- all changes use pull requests;
- production releases come from tagged commits;
- hotfixes still require review;
- long-lived environment branches should be avoided.

---

# 9. Pull request requirements

Every pull request must include:

- summary;
- scope;
- screenshots where relevant;
- migration impact;
- security impact;
- privacy impact;
- API or contract changes;
- test evidence;
- rollout plan;
- rollback plan;
- documentation updates.

Required checks:

```text
format
lint
type check
unit tests
integration tests
contract tests
security scans
migration checks
build
```

---

# 10. Branch protection

Protect `main` with:

- pull request required;
- at least one or two approvals;
- required status checks;
- conversation resolution;
- signed commits where adopted;
- no force push;
- no branch deletion;
- CODEOWNERS review for sensitive paths.

Sensitive paths:

```text
infrastructure/
supabase/migrations/
security/
contracts/
.github/workflows/
ai-platform/prompts/
```

---

# 11. Versioning

Use semantic versioning where practical:

```text
MAJOR.MINOR.PATCH
```

Examples:

```text
backend 1.4.2
ai-platform 1.2.0
frontend 1.5.0
data-platform 1.3.1
```

Also record:

```text
commit_sha
image_digest
migration_revision
agent_versions
prompt_versions
dataset_pipeline_versions
```

---

# 12. Release tags

Suggested tags:

```text
frontend-v1.4.0
backend-v1.4.0
ai-platform-v1.3.0
data-platform-v1.2.1
platform-v1.4.0
```

A coordinated platform release may reference component versions.

---

# 13. CI pipeline

Recommended stages:

```text
checkout
dependency install
format check
lint
type check
unit tests
contract tests
integration tests
migration tests
security scans
artifact build
container scan
publish test report
```

CI must use pinned versions for critical tooling.

---

# 14. Dependency management

Use:

- lock files;
- automated dependency updates;
- vulnerability scanning;
- licence review;
- dependency pinning;
- controlled major upgrades.

Required files may include:

```text
package-lock.json
poetry.lock
uv.lock
requirements.lock
```

Only one approved Python dependency workflow should be selected per project.

---

# 15. Frontend CI/CD

Frontend validation:

```text
npm ci
npm run lint
npm run typecheck
npm test
npx expo-doctor
```

Build validation:

```text
eas build --profile development
eas build --profile preview
eas build --profile production
```

Web validation:

```text
npx expo export --platform web
```

---

# 16. Expo EAS profiles

Recommended:

```json
{
  "build": {
    "development": {},
    "preview": {},
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

Profiles must use environment-specific:

- API base URL;
- Supabase public URL;
- Supabase anonymous key;
- Sentry environment;
- release version;
- feature flags.

Never embed service-role credentials.

---

# 17. Mobile release workflow

```text
Merge approved release
    ↓
Create release tag
    ↓
Run production build
    ↓
Internal testing
    ↓
Store submission
    ↓
Review approval
    ↓
Phased release
    ↓
Monitor crashes and API errors
```

For urgent frontend configuration fixes, Expo Updates may be used only where compatible with store policies and native runtime compatibility.

---

# 18. Frontend runtime compatibility

Track:

```text
runtime_version
app_version
build_number
API compatibility
minimum supported version
```

Backend must support a documented mobile compatibility window.

Do not deploy breaking API changes before supported mobile clients are ready.

---

# 19. Container standards

Backend, AI platform, and data jobs must use:

- minimal base images;
- non-root runtime user;
- pinned base image digest where practical;
- multi-stage builds;
- no development tools in runtime image;
- health checks where applicable;
- no secrets baked into image;
- vulnerability scanning;
- reproducible dependency installation.

---

# 20. Artifact Registry

Use separate repositories or naming conventions by project.

Example:

```text
australia-southeast1-docker.pkg.dev/<project>/trackmyprops/backend
australia-southeast1-docker.pkg.dev/<project>/trackmyprops/ai-platform
australia-southeast1-docker.pkg.dev/<project>/trackmyprops/data-platform
```

Images must be tagged with:

```text
version
commit_sha
```

Deployment should use immutable digest where possible.

---

# 21. Cloud Run service configuration

Backend and AI platform should define:

```text
region
service account
CPU
memory
min instances
max instances
concurrency
request timeout
startup probe
readiness
environment variables
secret references
ingress
authentication
VPC settings
```

Preferred region:

```text
australia-southeast1
```

Final selection must consider provider availability, latency, resilience, and cost.

---

# 22. Backend Cloud Run deployment

Suggested command structure:

```bash
gcloud run deploy trackmyprops-backend \
  --image <immutable-image-reference> \
  --region australia-southeast1 \
  --service-account <backend-service-account> \
  --set-env-vars APP_ENV=production \
  --set-secrets DATABASE_URL=database-url:latest \
  --no-allow-unauthenticated
```

Actual ingress and authentication design must align with the public API gateway strategy.

---

# 23. AI platform deployment

AI service should be private.

Recommended controls:

- internal or authenticated ingress;
- backend service identity only;
- provider secrets from Secret Manager;
- bounded timeout;
- maximum instances;
- concurrency tuned for model workload;
- execution persistence outside container memory;
- no direct frontend access.

---

# 24. Cloud Run Jobs

Use Cloud Run Jobs for:

- ingestion;
- bulk transformation;
- backfills;
- dataset publication;
- retention cleanup;
- orphan detection;
- export generation;
- deletion workflows;
- scheduled recalculations.

Jobs must be:

- idempotent;
- resumable where needed;
- observable;
- bounded;
- retry safe;
- independently deployable.

---

# 25. Cloud Scheduler

Scheduler should trigger:

- Cloud Run Jobs;
- authenticated backend endpoints;
- approved operational tasks.

Schedules must include:

- timezone;
- owner;
- retry policy;
- alert;
- runbook;
- missed-run handling.

Use:

```text
Australia/Sydney
```

only where the business schedule is local-time dependent.

Use UTC where daylight-saving ambiguity should be avoided.

---

# 26. Supabase migration strategy

All schema changes must use migrations.

Recommended path:

```text
supabase/migrations/
```

Migration requirements:

- timestamped or ordered revision;
- forward migration;
- rollback or forward-fix plan;
- RLS policy updates;
- index review;
- data backfill plan;
- test from empty database;
- test upgrade from previous release.

---

# 27. Migration deployment order

Typical safe order:

```text
1. Expand database schema
2. Deploy backward-compatible backend
3. Backfill data
4. Update consumers
5. Remove deprecated use
6. Contract database schema later
```

Avoid destructive migration and dependent code deployment in one irreversible step.

---

# 28. Database migration gate

Before production:

- staging migration succeeds;
- backup or recovery point exists;
- migration duration is measured;
- locks are understood;
- rollback or forward-fix is documented;
- RLS tests pass;
- data validation query exists.

---

# 29. Large backfills

Large backfills must support:

- batching;
- checkpoints;
- pause/resume;
- retry;
- progress metrics;
- bounded transaction size;
- dry run;
- reconciliation;
- safe restart.

Do not run a large unbounded backfill inside an API deployment.

---

# 30. Secrets management

Use Google Secret Manager and approved Supabase secret facilities.

Potential secrets:

```text
DATABASE_URL
SUPABASE_SERVICE_ROLE_KEY
AI_PROVIDER_API_KEY
EMAIL_PROVIDER_API_KEY
BILLING_WEBHOOK_SECRET
PROPERTY_PROVIDER_SECRET
MAPS_PROVIDER_KEY
```

Rules:

- no plaintext in Git;
- no secrets in images;
- no secrets in frontend;
- no secrets in logs;
- access granted by service identity;
- rotation documented;
- old versions disabled after validation.

---

# 31. Environment variables

Non-secret configuration may use environment variables.

Examples:

```text
APP_ENV
LOG_LEVEL
API_BASE_URL
FEATURE_FLAG_PROVIDER
DEFAULT_TIMEZONE
MAX_UPLOAD_SIZE_MB
```

Maintain a documented environment-variable register.

---

# 32. Service accounts

Recommended service accounts:

```text
backend-runtime
ai-runtime
data-ingest-runtime
data-publish-runtime
scheduler
deployment
notification
email
```

Each service account must have only required permissions.

Deployment identity must not automatically receive runtime database access.

---

# 33. Workload identity

Prefer short-lived workload identity over long-lived service-account keys.

Avoid downloadable JSON service-account keys.

Where unavoidable:

- restrict;
- rotate;
- monitor;
- store in Secret Manager;
- document owner and expiry.

---

# 34. Infrastructure as code

Recommended:

```text
Terraform
```

Infrastructure code should manage:

- Cloud Run services;
- Cloud Run Jobs;
- Scheduler;
- Artifact Registry;
- service accounts;
- IAM;
- Secret Manager references;
- monitoring;
- alerts;
- networking;
- storage lifecycle;
- backups where supported.

Manual console changes must be avoided or reconciled into code.

---

# 35. Infrastructure state

Terraform state must be:

- remote;
- encrypted;
- access controlled;
- versioned;
- backed up;
- environment separated.

Do not store sensitive state in public or developer-local locations.

---

# 36. Feature flags

Use feature flags for:

- new AI agents;
- prediction;
- EOI sending;
- provider integrations;
- new pricing;
- risky migrations;
- new dashboards;
- beta workflows.

Flags should support:

```text
off
internal
percentage
user allowlist
household allowlist
subscription tier
fully on
```

---

# 37. Feature-flag rules

- security controls cannot be disabled by ordinary flags;
- flags have owners;
- flags have expiry dates;
- stale flags are removed;
- flag changes are audited;
- production defaults are safe;
- client flags do not replace backend enforcement.

---

# 38. Deployment strategies

## Rolling deployment

Default for compatible Cloud Run releases.

## Canary release

Use for high-risk changes.

Example:

```text
5% traffic
25% traffic
50% traffic
100% traffic
```

## Blue/green

Use where:

- fast rollback is important;
- migration compatibility is maintained;
- traffic switching is supported.

## Feature-flag rollout

Use when code can deploy disabled and activate gradually.

---

# 39. Canary evaluation

Monitor:

- error rate;
- latency;
- database pressure;
- AI validation;
- cost;
- crash rate;
- business completion;
- security alerts.

Abort rollout when thresholds are breached.

---

# 40. Rollback strategy

Every deployment must define:

```text
application rollback
database strategy
feature-flag rollback
provider rollback
data-pipeline rollback
```

Application rollback:

- route traffic to previous revision;
- restore previous frontend release where possible;
- disable feature flag.

Database rollback:

- prefer forward-fix;
- use backward-compatible migrations;
- restore only when required and approved.

---

# 41. Cloud Run rollback

Keep prior revisions available according to retention policy.

Rollback steps:

```text
identify last known good revision
shift traffic
verify health
monitor
document incident or change
```

Rollback must not use an image rebuilt from source; use the prior immutable artifact.

---

# 42. Data pipeline rollback

Dataset publication must support:

- current version pointer;
- previous version;
- atomic switch;
- rollback event;
- consumer invalidation.

Raw and canonical history should remain intact.

---

# 43. Frontend rollback

Possible approaches:

- phased store release halt;
- store rollback where available;
- Expo Update rollback for compatible JS changes;
- backend feature flag;
- minimum-version controls only when necessary.

Because mobile-store rollback can be slow, backend compatibility and feature flags are critical.

---

# 44. Release workflow

Recommended:

```text
Merge to main
    ↓
CI passes
    ↓
Build immutable artifacts
    ↓
Deploy development
    ↓
Automated smoke tests
    ↓
Deploy staging
    ↓
Acceptance and migration rehearsal
    ↓
Approval
    ↓
Deploy production canary
    ↓
Observe
    ↓
Promote to full traffic
    ↓
Create release record
```

---

# 45. Release approval

Production release approval should consider:

- test results;
- migration risk;
- privacy impact;
- security impact;
- provider changes;
- feature flags;
- rollback;
- support readiness;
- runbooks;
- monitoring.

High-risk releases require an explicit approver.

---

# 46. Change categories

## Standard

Low-risk, repeatable, automated.

## Normal

Requires review and planned deployment.

## Emergency

Required to resolve a critical incident.

Emergency changes must still be documented and reviewed afterward.

---

# 47. Release freeze

A release freeze may apply during:

- major incident;
- unresolved migration risk;
- provider outage;
- critical business period;
- store-review uncertainty;
- backup failure;
- monitoring failure.

Security fixes may override freeze through emergency process.

---

# 48. Smoke testing

After each deployment:

Backend:

```text
health
readiness
authentication
database connectivity
basic authorised request
```

AI:

```text
health
registry
mock execution
persistence
```

Data:

```text
job start
source test
staging write
quality check
```

Frontend:

```text
startup
sign-in
API connectivity
navigation
```

---

# 49. Production verification

Verify:

- correct version;
- correct environment;
- migrations applied;
- logs flowing;
- metrics flowing;
- alerts enabled;
- error rate stable;
- latency stable;
- no permission regressions;
- no cost spike;
- no stale critical jobs.

---

# 50. Backups

Back up:

- PostgreSQL;
- critical configuration;
- infrastructure state;
- source registry;
- prompt and agent versions;
- dataset metadata;
- critical storage metadata.

Use platform-native backups where available.

---

# 51. Backup policy

Define:

```text
frequency
retention
encryption
region
restore process
owner
monitoring
```

Backups are incomplete unless restore is tested.

---

# 52. Restore testing

Test:

- database restore;
- point-in-time recovery;
- storage reconstruction;
- infrastructure recreation;
- secret restoration process;
- deletion-tombstone replay;
- event recovery;
- application compatibility.

Record restore time and data loss.

---

# 53. Recovery objectives

Define:

```text
RTO
RPO
```

Suggested initial targets for legal and operational review:

| Component | RTO | RPO |
|---|---:|---:|
| Public API | 4 hours | 15 minutes |
| Database | 4 hours | 15 minutes |
| AI platform | 8 hours | 1 hour |
| Data platform | 24 hours | Last successful dataset |
| Frontend | 8 hours | Last approved release |

Final targets must reflect cost and user impact.

---

# 54. Disaster recovery integration

A separate `disaster-recovery.md` should define:

- regional outage;
- provider failure;
- database restoration;
- service recreation;
- communication;
- failover;
- recovery testing.

This DevOps document defines the deployment mechanisms that support it.

---

# 55. Production access

Production access must be:

- role based;
- MFA protected;
- time limited where possible;
- approved;
- logged;
- reviewed.

Avoid direct production database access.

Use approved administrative tools and read-only access where possible.

---

# 56. Break-glass operations

Break-glass requires:

- incident reference;
- dedicated identity;
- MFA;
- short duration;
- alert;
- audit;
- post-use review.

Do not use break-glass for routine deployment.

---

# 57. Observability integration

Every deployment must attach:

```text
release_version
commit_sha
image_digest
migration_revision
agent_versions
prompt_versions
deployed_at
deployed_by
```

Dashboards must support release comparison.

---

# 58. Deployment alerts

Alert on:

- deployment failure;
- failed migration;
- readiness failure;
- error-rate increase;
- latency increase;
- container restart;
- job failure;
- cost spike;
- backup failure;
- secret-access failure.

---

# 59. Cost controls

Use:

- budgets;
- billing alerts;
- max Cloud Run instances;
- job resource limits;
- log retention;
- storage lifecycle;
- provider quotas;
- AI execution quotas;
- cache monitoring.

Unexpected cost growth must be treated as an operational incident when material.

---

# 60. Provider deployment configuration

Provider integrations must support:

- environment-specific credentials;
- sandbox;
- production endpoints;
- timeout;
- retry;
- circuit breaker;
- feature flag;
- fallback policy;
- contract restrictions.

Do not deploy a provider integration until production rights are confirmed.

---

# 61. Email safety in non-production

Development and staging must not send to arbitrary real recipients.

Use:

- sandbox provider;
- allowlisted domains;
- mail sink;
- recipient rewrite;
- explicit environment banner.

---

# 62. Billing safety in non-production

Use provider sandbox.

Production billing webhooks must not be accepted in non-production.

Environment and webhook secrets must be separate.

---

# 63. Data-provider safety

Non-production should use:

- sandbox;
- approved samples;
- synthetic fixtures;
- contract-compliant limited data.

Do not copy full production provider datasets into development.

---

# 64. Release records

Every production release record must include:

```text
release_id
component_versions
commit_sha
artifact_digest
migration_revision
deployment_time
approver
rollout strategy
feature flags
verification result
rollback reference
```

---

# 65. Deployment documentation

Maintain:

```text
docs/devops/
├── environments.md
├── ci-cd.md
├── frontend-release.md
├── cloud-run.md
├── cloud-run-jobs.md
├── supabase-migrations.md
├── secrets.md
├── feature-flags.md
├── rollback.md
├── backups.md
├── production-access.md
└── release-process.md
```

---

# 66. Required automation

Automate:

- tests;
- builds;
- scans;
- artifact publishing;
- environment deployment;
- smoke tests;
- migration checks;
- release metadata;
- dependency updates;
- backup monitoring;
- retention jobs;
- expired feature-flag reporting.

---

# 67. Manual steps

Manual steps should be limited to:

- production approval;
- store submission approval;
- high-risk migration approval;
- provider contract activation;
- emergency rollback decision.

Every manual step requires documented owner and evidence.

---

# 68. DevOps testing

Test:

- CI failure behaviour;
- container build;
- deployment;
- rollback;
- migration;
- secret rotation;
- feature-flag activation;
- canary abort;
- backup restore;
- provider sandbox;
- non-production email blocking;
- environment isolation.

---

# 69. Release checklist

```text
[ ] Pull request approved
[ ] CI passed
[ ] Security scans passed
[ ] Migration tested
[ ] Backup healthy
[ ] Rollback documented
[ ] Feature flags configured
[ ] Environment variables verified
[ ] Secrets available
[ ] Staging accepted
[ ] Smoke tests passed
[ ] Monitoring ready
[ ] Support informed
[ ] Release approved
[ ] Production verification complete
```

---

# 70. Emergency release checklist

```text
[ ] Incident or critical defect identified
[ ] Scope minimised
[ ] Reviewer assigned
[ ] Essential tests passed
[ ] Rollback ready
[ ] Incident Commander approves
[ ] Deployment monitored
[ ] Follow-up review scheduled
```

---

# 71. Codex rules

Codex must:

1. create reproducible builds;
2. use immutable artifacts;
3. update CI for new projects and tests;
4. use migrations for schema changes;
5. preserve backward compatibility;
6. document environment variables;
7. never commit secrets;
8. create least-privilege service accounts;
9. add smoke tests;
10. support rollback;
11. add release metadata;
12. use feature flags for high-risk functionality;
13. update infrastructure as code;
14. create operational documentation;
15. report manual or missing infrastructure honestly.

---

# 72. Definition of done

Deployment and DevOps readiness is complete when:

- environments are isolated;
- branch protection is active;
- CI validates all projects;
- artifacts are immutable;
- frontend builds are reproducible;
- Cloud Run services and jobs deploy automatically;
- Supabase migrations are controlled;
- service identities are least privilege;
- secrets are centrally managed;
- feature flags exist;
- canary and rollback work;
- release metadata is recorded;
- backups are monitored;
- restore is tested;
- production access is audited;
- cost controls exist;
- release and emergency processes are documented.

---

# 73. Final DevOps principle

For every TrackMyProps production change, the platform must answer:

```text
What changed?
Who approved it?
Which artifact was deployed?
Which migration ran?
Which configuration and secrets were used?
How was it tested?
How is it monitored?
How can it be rolled back?
Can the environment be rebuilt?
```

If those questions cannot be answered, the change is not ready for production.
