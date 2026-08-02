# TrackMyProps Observability Architecture

## 1. Purpose

This document defines observability standards for the TrackMyProps frontend, backend, AI platform, and data platform.

It covers structured logging, metrics, distributed tracing, dashboards, alerts, audit correlation, AI cost and quality monitoring, data freshness and quality, incident investigation, and operational runbooks.

## 2. Core principles

1. Every request has a request ID and trace ID.
2. Every AI workflow has an execution ID.
3. Every data job has a job ID.
4. Every event has an event ID.
5. Logs are structured and redacted.
6. Metrics are actionable and low-cardinality.
7. Traces connect services and external calls.
8. Every production alert has an owner and runbook.
9. AI cost, latency, validation, and quality are measured.
10. Data freshness, quality, and lineage are first-class signals.
11. User-visible failures must correlate with internal diagnostics.
12. Observability must not expose secrets or unnecessary personal data.

## 3. Recommended stack

Use:

- Google Cloud Logging
- Google Cloud Monitoring
- OpenTelemetry
- Google Cloud Trace or another OpenTelemetry-compatible backend
- Sentry for frontend and application exceptions
- Supabase logs and database metrics
- PostgreSQL operational tables for AI executions, data jobs, outbox events, and audit records

Optional later additions include Grafana, Prometheus, BigQuery log sinks, Datadog, Honeycomb, and an approved AI tracing platform.

Any new observability vendor requires privacy, security, retention, residency, and cost review.

## 4. Correlation identifiers

Use these identifiers consistently:

```text
request_id
trace_id
execution_id
job_id
event_id
tool_call_id
recommendation_id
message_id
dataset_version
```

### Request ID

Identifies a single API request.

Header:

```text
X-Request-ID
```

### Trace ID

Connects frontend, backend, AI, data, and external calls.

Header:

```text
X-Trace-ID
```

### Support reference

Where helpful, expose a safe support reference to the user. Never expose stack traces, service credentials, or internal security details.

## 5. Correlation flows

AI flow:

```text
Frontend action
    ↓ request_id + trace_id
Backend API
    ↓ execution_id
AI platform
    ↓ tool_call_id
Provider or internal tool
    ↓
Recommendation
    ↓ recommendation_id
Frontend result
```

Data flow:

```text
Cloud Scheduler
    ↓ job_id + trace_id
Cloud Run Job
    ↓ raw_artifact_id
Dataset publication
    ↓ dataset_version + event_id
Backend or AI invalidation
```

## 6. Structured logging

All server-side projects must emit JSON logs.

Example:

```json
{
  "timestamp": "2026-08-02T10:00:00Z",
  "severity": "INFO",
  "service": "backend",
  "environment": "production",
  "event": "property.created",
  "request_id": "uuid",
  "trace_id": "uuid",
  "household_id": "uuid",
  "property_id": "uuid",
  "duration_ms": 42,
  "status": "success"
}
```

Common fields:

```text
timestamp
severity
service
environment
event
trace_id
status
release
```

Add only relevant context.

## 7. Log levels

### DEBUG

Development diagnostics only. Disabled or heavily restricted in production.

### INFO

Normal events such as request completion, property creation, AI execution start, dataset publication, or email queueing.

### WARNING

Degraded but continuing, such as stale data use, provider fallback, retries, or quality warnings.

### ERROR

Failed operations such as database writes, invalid AI output, job failures, or email delivery failures.

### CRITICAL

Major service, security, or data-integrity impact.

## 8. Redaction

Never log:

- passwords
- access or refresh tokens
- service-role keys
- provider API keys
- private keys
- full connection strings
- signed URLs
- complete uploaded documents
- complete financial statements
- full email bodies
- complete sensitive prompts or model responses
- bank or loan account numbers
- raw push tokens
- private chain-of-thought

Use IDs, hashes, masked values, counts, sizes, domains, and safe previews.

## 9. Frontend observability

Track:

- app startup
- screen load duration
- API errors
- crashes and unhandled exceptions
- navigation failures
- offline state
- Expo update failures
- release and build
- platform and operating system
- crash-free sessions

Sentry events should include environment, release, platform, screen, request ID, and trace ID.

Do not transmit sensitive form contents.

## 10. Backend technical metrics

Required metrics:

```text
api_request_count
api_request_duration_ms
api_error_count
api_active_requests
database_query_duration_ms
database_error_count
database_pool_in_use
database_pool_wait_ms
rate_limit_rejection_count
idempotency_replay_count
audit_event_write_failure_count
```

Safe dimensions:

```text
service
environment
route_template
method
status_code
error_code
release
```

Do not use user IDs, property IDs, or trace IDs as metric labels.

## 11. Backend business metrics

Track:

```text
property_created_count
property_updated_count
loan_created_count
expense_created_count
valuation_created_count
scenario_created_count
recommendation_created_count
recommendation_actioned_count
document_uploaded_count
communication_draft_created_count
communication_sent_count
```

Business metrics help detect silent failures even when APIs appear healthy.

## 12. AI platform monitoring

Required metrics:

```text
ai_execution_count
ai_execution_success_count
ai_execution_failure_count
ai_execution_duration_ms
ai_execution_cancelled_count
ai_execution_partial_success_count
ai_cache_hit_count
ai_cache_miss_count
ai_cache_invalidation_count
ai_tool_call_count
ai_tool_call_failure_count
ai_output_validation_failure_count
ai_fallback_count
ai_prompt_injection_detection_count
```

Dimensions:

```text
agent_id
agent_version
provider
model
model_policy
status
cache_strategy
environment
```

## 13. AI cost monitoring

Track per execution:

```text
input_tokens
output_tokens
cached_tokens
embedding_tokens
estimated_cost
currency
provider
model
agent_id
execution_id
```

Aggregate:

```text
cost_per_agent
cost_per_successful_execution
cost_per_report
cost_per_day
cost_per_environment
cost_per_subscription_tier
```

Alert on:

- sudden cost spikes
- unusually high token use
- expensive fallback activation
- cache-hit collapse
- repeated execution loops
- excessive tool calls

## 14. AI quality monitoring

Track:

```text
structured_output_pass_rate
evidence_coverage_rate
calculation_fidelity_rate
missing_data_detection_rate
confidence_calibration_score
user_acceptance_rate
user_dismissal_rate
regeneration_rate
manual_edit_rate
prompt_injection_block_rate
```

Quality signals should combine deterministic evaluation, human review, user feedback, and production outcome signals.

Model confidence alone is not a quality measure.

## 15. AI latency breakdown

Measure:

```text
queue_wait_ms
context_assembly_ms
retrieval_ms
tool_call_ms
model_call_ms
validation_ms
persistence_ms
total_execution_ms
```

This allows latency to be attributed to models, tools, database, retrieval, validation, or queueing.

## 16. AI execution logs

Safe example:

```json
{
  "event": "ai.execution.completed",
  "execution_id": "uuid",
  "trace_id": "uuid",
  "agent_id": "property_analysis",
  "agent_version": "1.0.0",
  "provider": "configured-provider",
  "model": "configured-model",
  "was_cache_hit": false,
  "tool_call_count": 7,
  "duration_ms": 18450,
  "input_tokens": 8200,
  "output_tokens": 1350,
  "estimated_cost": "0.42",
  "status": "succeeded"
}
```

## 17. Data-platform metrics

Required:

```text
data_job_count
data_job_success_count
data_job_failure_count
data_job_duration_ms
source_request_count
source_request_failure_count
source_rate_limit_count
raw_artifact_count
rows_extracted
rows_staged
rows_published
rows_rejected
duplicate_row_count
quality_failure_count
schema_drift_count
dataset_publish_count
dataset_rollback_count
```

Dimensions may include pipeline ID, source ID, dataset ID, environment, and status.

Avoid high-cardinality partition labels.

## 18. Data freshness monitoring

Track:

```text
dataset_age_hours
source_publication_delay_hours
ingestion_delay_hours
publication_delay_hours
stale_partition_count
unknown_freshness_count
```

Freshness statuses:

```text
current
aging
stale
unknown
```

Critical datasets must alert when freshness SLAs are breached.

## 19. Data quality monitoring

Track:

```text
completeness_score
validity_score
uniqueness_score
timeliness_score
coverage_score
overall_quality_score
critical_rule_failure_count
warning_rule_count
```

Dashboards should show trends, current versions, failing partitions, last successful publication, schema drift, and source health.

## 20. Data lineage observability

Operators must be able to trace:

```text
published record
    ↓
curated dataset version
    ↓
canonical records
    ↓
pipeline version
    ↓
raw artifact
    ↓
source
```

Record dataset ID, dataset version, pipeline version, raw artifact ID, source ID, and quality score.

## 21. Cloud Run monitoring

Monitor:

```text
request count
request latency
5xx rate
4xx rate
instance count
CPU
memory
container startup latency
restart count
timeout count
max-instance saturation
```

Alert on elevated errors, latency, saturation, memory pressure, repeated restarts, and readiness failure.

## 22. Cloud Run Jobs and Scheduler

Monitor jobs for:

```text
execution count
success
failure
duration
retry count
task failure
timeout
CPU
memory
```

Monitor Scheduler for invocation failures, delivery latency, and missed schedules.

Every failed critical production job requires an alert.

## 23. Database monitoring

Monitor:

```text
active connections
connection saturation
long-running queries
deadlocks
lock waits
statement timeouts
transaction duration
storage growth
index hit rate
sequential scans
vacuum health
replication lag where available
```

## 24. Storage monitoring

Track:

```text
storage_bytes
object_count
upload_failure_count
download_failure_count
signed_url_failure_count
orphan_object_count
malware_scan_failure_count
```

Separate property documents, inspection media, reports, raw data, processed data, and temporary files.

## 25. Communication monitoring

Track:

```text
communication_draft_count
communication_approval_count
communication_send_count
communication_send_failure_count
delivery_count
bounce_count
complaint_count
duplicate_send_prevented_count
webhook_signature_failure_count
```

Alert on send failures, bounce spikes, complaint spikes, unusual volume, and signature failures.

## 26. Notification monitoring

Track:

```text
notification_created_count
notification_delivery_count
notification_failure_count
push_token_invalid_count
notification_read_count
notification_dismissed_count
notification_opt_out_count
duplicate_notification_prevented_count
```

Monitor notification fatigue and repeated dismissal.

## 27. Security monitoring

Track:

```text
login_success_count
login_failure_count
authorisation_denial_count
cross_household_denial_count
rate_limit_rejection_count
suspicious_upload_count
prompt_injection_detection_count
service_identity_failure_count
secret_access_failure_count
webhook_signature_failure_count
admin_action_count
```

Security signals require restricted access and suitable retention.

## 28. Audit correlation

Sensitive audit events must include:

```text
trace_id
request_id
actor
resource
action
outcome
occurred_at
```

Operators should correlate an audit event with its API request, database transaction, AI execution, and communication send.

## 29. Dashboards

Create environment-specific dashboards.

### Executive health dashboard

Show active users, properties, successful portfolio updates, AI success, critical data freshness, communication health, and current incidents.

### Backend dashboard

Show volume, latency, errors, database health, rate limits, and deployment revision.

### AI dashboard

Show executions, success, latency, cost, cache hit rate, validation failures, provider health, and agent versions.

### Data dashboard

Show job status, freshness, quality, schema drift, source health, and publication history.

### Security dashboard

Show authentication failures, authorisation denials, suspicious uploads, signature failures, prompt injection, and admin actions.

### Communications dashboard

Show drafts, approvals, sends, deliveries, bounces, complaints, and duplicate prevention.

## 30. Alert design

Every alert must define:

```text
alert_name
severity
owner
condition
threshold
evaluation_window
runbook
notification_channel
auto_resolution
```

An alert without an owner or runbook is incomplete.

## 31. Severity model

```text
SEV-1 confirmed major data exposure, compromise, or widespread outage
SEV-2 major degradation or critical workflow failure
SEV-3 partial degradation or contained failure
SEV-4 warning trend or low-impact issue
```

## 32. Core production alerts

Required alerts:

```text
backend_high_error_rate
backend_high_latency
database_connection_saturation
database_unavailable
ai_execution_failure_spike
ai_output_validation_failure_spike
ai_cost_spike
ai_provider_unavailable
data_job_failed
critical_dataset_stale
data_quality_critical_failure
scheduler_failed
email_send_failure_spike
webhook_signature_failure_spike
push_delivery_failure_spike
authentication_failure_spike
cross_household_access_attempt
storage_upload_failure_spike
backup_failure
```

## 33. Initial threshold examples

Initial thresholds may include:

```text
5xx rate greater than 5% for 5 minutes
AI failure rate greater than 10% for 10 minutes
database pool usage greater than 85% for 10 minutes
email send failures greater than 10% for 10 minutes
critical job fails once
critical dataset breaches freshness SLA
```

Thresholds must be tuned from actual baselines.

## 34. Runbooks

Create runbooks for:

```text
backend outage
AI provider outage
AI validation failure spike
database saturation
data job failure
stale dataset
email delivery failure
webhook failure
storage failure
authentication failure spike
cross-household alert
cost spike
secret rotation
deployment rollback
```

Each runbook must include symptoms, dashboards, log queries, likely causes, containment, recovery, rollback, verification, escalation, and post-incident work.

## 35. Error reporting

Sentry or equivalent should group by stable error code, exception type, route or agent, service, and release.

Include environment, release, trace ID, request ID, execution ID, and job ID.

Do not attach sensitive payloads.

## 36. Release observability

Every release must record:

```text
release_version
commit_sha
image_digest
cloud_run_revision
migration_revision
agent_versions
prompt_versions
frontend_build
deployed_at
deployed_by
```

Dashboards must support before-and-after release comparison.

## 37. Feature-flag monitoring

For each flagged feature track:

```text
flag_name
enabled_population
execution_count
success_rate
error_rate
latency
cost
user_feedback
```

A feature should be disableable quickly.

## 38. SLOs and SLIs

Define SLIs for:

- API availability
- API latency
- AI execution success
- AI execution latency
- data freshness
- communication-send success
- notification delivery
- critical-job success

Do not claim an SLO until it is monitored.

At sufficient maturity, use error budgets to guide release pace and reliability work.

## 39. Retention and access

Define retention for:

```text
application logs
security logs
audit logs
AI execution metadata
AI model usage
data job logs
traces
metrics
frontend crash reports
```

Retention must balance privacy, legal requirements, operational value, and cost.

Restrict access by role:

```text
developer
operator
security
support
administrator
```

Support access should not automatically include raw private logs.

## 40. Production support workflow

When a user reports an issue:

1. obtain the safe support reference;
2. locate request and trace;
3. identify service and release;
4. inspect logs and metrics;
5. correlate AI execution or data job;
6. verify data and model versions;
7. confirm user-visible impact;
8. resolve or escalate;
9. document the outcome;
10. add a regression test where applicable.

## 41. Incident review

For significant incidents document:

```text
summary
impact
timeline
root cause
contributing factors
detection
response
recovery
what worked
what failed
actions
owners
due dates
```

Use blameless language.

## 42. Observability testing

Test:

- trace propagation
- request ID generation
- structured log schema
- redaction
- metric emission
- alert firing and routing
- dashboard queries
- release tagging
- AI cost aggregation
- data freshness alerts
- runbook accuracy

## 43. Environment variables

Common:

```text
LOG_LEVEL=
LOG_FORMAT=json
SENTRY_DSN=
SENTRY_ENVIRONMENT=
SENTRY_RELEASE=
TRACE_SAMPLE_RATE=
OTEL_SERVICE_NAME=
OTEL_EXPORTER_OTLP_ENDPOINT=
OTEL_EXPORTER_OTLP_HEADERS=
METRICS_ENABLED=
TRACING_ENABLED=
```

AI:

```text
AI_COST_TRACKING_ENABLED=
AI_QUALITY_SAMPLING_RATE=
AI_TRACE_CONTENT_ENABLED=false
```

Data:

```text
DATA_QUALITY_ALERTING_ENABLED=
DATA_FRESHNESS_ALERTING_ENABLED=
```

## 44. Documentation structure

Maintain:

```text
docs/observability/
├── overview.md
├── logging.md
├── metrics.md
├── tracing.md
├── dashboards.md
├── alerts.md
├── slos.md
├── ai-monitoring.md
├── data-monitoring.md
├── security-monitoring.md
└── runbooks/
```

## 45. Codex rules

Codex must:

1. add structured logging;
2. propagate trace IDs;
3. expose safe request IDs;
4. instrument critical paths;
5. avoid high-cardinality metric labels;
6. redact secrets and private content;
7. instrument AI latency, cost, cache, and validation;
8. instrument data jobs, freshness, and quality;
9. create health and readiness checks;
10. document or generate alert configuration;
11. document dashboard requirements;
12. attach release metadata;
13. create runbooks;
14. test observability;
15. report missing external monitoring configuration honestly.

## 46. Definition of done

Observability is complete when:

- all services emit structured logs;
- trace IDs propagate end to end;
- frontend errors correlate with backend requests;
- AI executions are traceable;
- data jobs and dataset publications are traceable;
- critical technical and business metrics exist;
- AI cost and quality are monitored;
- data freshness and quality are monitored;
- dashboards exist;
- alerts have owners and runbooks;
- logs are redacted;
- releases are tagged;
- audit events correlate with technical traces;
- support can investigate user-visible failures;
- retention and access are documented;
- observability tests pass.

## 47. Final principle

TrackMyProps must be able to answer:

```text
What happened?
When did it happen?
Who or which service initiated it?
Which release, data version, prompt, agent, and model were used?
Why did it fail?
What did the user experience?
Can it be safely reproduced and resolved?
```

If these questions cannot be answered for an important user-visible outcome, observability is incomplete.
