# TrackMyProps Event Catalogue

## 1. Purpose

This document defines the event-driven contracts used by TrackMyProps.

It applies to:

```text
TrackMyProps/
├── backend/
├── ai-platform/
├── data-platform/
└── frontend/
```

It covers:

- domain events;
- AI execution events;
- data publication events;
- listing and discovery events;
- communication events;
- notification events;
- billing events;
- security events;
- operational events;
- producers;
- consumers;
- payloads;
- ordering;
- retries;
- idempotency;
- replay;
- versioning;
- observability;
- dead-letter handling.

The catalogue must remain consistent with:

```text
contracts.md
api-design.md
database.md
observability.md
security.md
```

---

# 2. Event design principles

1. Events are immutable.
2. Events describe facts that already happened.
3. Commands are not events.
4. Every event has a unique event ID.
5. Every event has a version.
6. Producers own event schemas.
7. Consumers process idempotently.
8. Delivery is at least once unless otherwise documented.
9. Consumers must not assume global ordering.
10. Aggregate version is used when order matters.
11. Sensitive payloads are minimised.
12. Events carry traceability metadata.
13. Schema changes follow compatibility rules.
14. Retries are bounded.
15. Failed events are observable and recoverable.

---

# 3. Event envelope

All events use:

```json
{
  "event_id": "uuid",
  "event_type": "property.updated",
  "event_version": "1.0",
  "occurred_at": "2026-08-02T10:00:00Z",
  "published_at": "2026-08-02T10:00:01Z",
  "producer": "backend",
  "environment": "production",
  "trace_id": "uuid",
  "request_id": "uuid",
  "actor": {
    "type": "user",
    "id": "uuid"
  },
  "aggregate": {
    "type": "property",
    "id": "uuid",
    "version": "4"
  },
  "payload": {}
}
```

Required fields:

```text
event_id
event_type
event_version
occurred_at
producer
environment
trace_id
aggregate
payload
```

Optional:

```text
published_at
request_id
actor
causation_id
correlation_id
tenant_id
household_id
```

---

# 4. Event naming

Use:

```text
<aggregate>.<past_tense_fact>
```

Examples:

```text
property.created
loan.updated
dataset.published
ai.execution.completed
communication.sent
```

Avoid:

```text
create_property
send_email
run_analysis
```

Those are commands, not events.

---

# 5. Event transport

Recommended initial pattern:

```text
PostgreSQL outbox
    ↓
publisher worker
    ↓
Pub/Sub or internal event transport
    ↓
consumer
```

A simpler initial implementation may use:

- PostgreSQL outbox;
- background worker;
- direct authenticated internal endpoint.

However, event durability and idempotency must be preserved.

---

# 6. Outbox pattern

Every transactional domain event should be written in the same transaction as the domain change.

Outbox fields:

```text
event_id
event_type
event_version
aggregate_type
aggregate_id
aggregate_version
payload
trace_id
occurred_at
published_at
publication_attempts
status
```

Statuses:

```text
pending
publishing
published
failed
dead_lettered
```

---

# 7. Consumer inbox

Consumers should persist processed event IDs.

Fields:

```text
consumer_name
event_id
processed_at
result
attempt_count
```

Duplicate delivery must not duplicate side effects.

---

# 8. Ordering

Do not assume global ordering.

When order matters, use:

```text
aggregate.id
aggregate.version
```

Example:

```text
property version 4 must not be overwritten by delayed version 3
```

Consumers may:

- reject stale versions;
- ignore duplicates;
- defer out-of-order events;
- fetch current state from source of truth.

---

# 9. Retry policy

Default retry pattern:

```text
exponential backoff
bounded attempts
jitter
```

Example:

```text
attempt 1: immediate
attempt 2: 10 seconds
attempt 3: 1 minute
attempt 4: 5 minutes
attempt 5: 30 minutes
```

After maximum attempts:

```text
dead_letter
```

Critical events require alerting.

---

# 10. Dead-letter handling

Dead-letter records must include:

```text
event_id
event_type
consumer
failure_reason
attempt_count
first_failed_at
last_failed_at
payload_reference
trace_id
```

Operators must be able to:

- inspect;
- correct configuration;
- replay safely;
- mark resolved;
- document reason.

---

# 11. Replay

Replay requirements:

- idempotent consumers;
- bounded scope;
- event-type filter;
- date filter;
- dry run;
- operator audit;
- no duplicate side effects.

Replaying communication or billing events requires extra safeguards.

---

# 12. Event compatibility

Backward-compatible changes:

- add optional field;
- add metadata;
- add safe enum value when consumers tolerate unknown values.

Breaking changes:

- remove field;
- change type;
- change meaning;
- rename event;
- make optional field required;
- change aggregate semantics.

Breaking change requires new event version.

---

# 13. Domain event categories

The catalogue contains:

```text
identity and household
property
finance
lease and tenancy
valuation
portfolio
scenario
AI
recommendation
listing and discovery
communication
document
inspection and maintenance
learning
notification
billing
data platform
security
operations
```

---

# 14. Identity and household events

## 14.1 user.profile_updated

Producer:

```text
backend
```

Consumers:

```text
audit
analytics
notification preferences
```

Trigger:

- user updates profile.

Payload:

```json
{
  "changed_fields": [
    "display_name",
    "timezone"
  ]
}
```

Sensitive values should not be included unless required.

---

## 14.2 household.created

Producer:

```text
backend
```

Consumers:

```text
audit
billing
analytics
default configuration
```

Payload:

```json
{
  "household_id": "uuid",
  "name": "Example Household",
  "owner_user_id": "uuid"
}
```

---

## 14.3 household.updated

Payload:

```json
{
  "changed_fields": [
    "name"
  ]
}
```

---

## 14.4 household.member_added

Consumers:

- permissions cache;
- audit;
- notifications.

Payload:

```json
{
  "member_user_id": "uuid",
  "role": "member"
}
```

---

## 14.5 household.member_role_changed

Payload:

```json
{
  "member_user_id": "uuid",
  "previous_role": "viewer",
  "new_role": "member"
}
```

Security-sensitive and auditable.

---

## 14.6 household.member_removed

Consumers:

- permission invalidation;
- session review;
- notifications;
- audit.

Payload:

```json
{
  "member_user_id": "uuid",
  "previous_role": "member"
}
```

---

# 15. Property events

## 15.1 property.created

Producer:

```text
backend
```

Consumers:

```text
portfolio recalculation
AI cache invalidation
audit
analytics
search indexing
```

Payload:

```json
{
  "household_id": "uuid",
  "property_type": "house",
  "ownership_status": "owned",
  "address_reference": "uuid"
}
```

---

## 15.2 property.updated

Payload:

```json
{
  "household_id": "uuid",
  "changed_fields": [
    "bedrooms",
    "bathrooms",
    "property_type"
  ]
}
```

Consumers:

- recalculation;
- AI cache invalidation;
- recommendation staleness;
- audit.

---

## 15.3 property.archived

Payload:

```json
{
  "reason": "sold"
}
```

Consumers:

- portfolio recalculation;
- notification suppression;
- discovery cleanup.

---

## 15.4 property.restored

Consumers:

- portfolio recalculation;
- search indexing;
- audit.

---

## 15.5 property.deleted

Payload must be minimal.

Consumers:

- storage deletion;
- AI memory deletion;
- cache deletion;
- search deletion;
- audit;
- analytics anonymisation.

---

# 16. Acquisition and ownership events

## 16.1 acquisition.created

Payload:

```json
{
  "property_id": "uuid",
  "purchase_price": {
    "amount": "750000.00",
    "currency": "AUD"
  },
  "settlement_date": "2025-10-10"
}
```

Consumers:

- financial recalculation;
- performance baseline;
- AI invalidation.

---

## 16.2 acquisition.updated

Payload:

```json
{
  "changed_fields": [
    "purchase_price",
    "stamp_duty"
  ]
}
```

---

## 16.3 ownership.created

Payload:

```json
{
  "property_id": "uuid",
  "owner_reference": "uuid",
  "ownership_percentage": "0.50"
}
```

---

## 16.4 ownership.updated

Consumers:

- tax placeholder logic;
- portfolio calculation;
- permission review where ownership and access are linked.

---

## 16.5 ownership.deleted

---

# 17. Loan events

## 17.1 loan.created

Consumers:

- property financial recalculation;
- portfolio recalculation;
- risk analysis;
- AI cache invalidation;
- fixed-rate reminder setup.

Payload:

```json
{
  "property_id": "uuid",
  "loan_type": "principal_and_interest",
  "rate_type": "fixed",
  "balance": {
    "amount": "600000.00",
    "currency": "AUD"
  },
  "fixed_rate_expiry": "2027-05-01"
}
```

---

## 17.2 loan.updated

Payload:

```json
{
  "changed_fields": [
    "balance",
    "interest_rate",
    "repayment_amount"
  ]
}
```

---

## 17.3 loan.rate_changed

Payload:

```json
{
  "previous_rate": "0.0610",
  "new_rate": "0.0640",
  "effective_date": "2026-08-01"
}
```

Consumers:

- repayment recalculation;
- risk analysis;
- recommendation generation;
- CIO briefing.

---

## 17.4 loan.fixed_rate_expiry_approaching

Producer:

```text
backend scheduler
```

Payload:

```json
{
  "loan_id": "uuid",
  "expiry_date": "2026-11-01",
  "days_remaining": 90
}
```

Consumers:

- notifications;
- recommendation generation;
- CIO briefing.

---

## 17.5 loan.deleted

Consumers:

- recalculation;
- cache invalidation;
- audit.

---

## 17.6 offset.updated

Payload:

```json
{
  "loan_id": "uuid",
  "previous_balance": {
    "amount": "40000.00",
    "currency": "AUD"
  },
  "new_balance": {
    "amount": "52000.00",
    "currency": "AUD"
  }
}
```

---

## 17.7 redraw.updated

---

# 18. Income and expense events

## 18.1 income.created

Consumers:

- property recalculation;
- portfolio recalculation;
- AI invalidation.

Payload:

```json
{
  "property_id": "uuid",
  "income_type": "rent",
  "amount": {
    "amount": "650.00",
    "currency": "AUD"
  },
  "frequency": "weekly"
}
```

---

## 18.2 income.updated

---

## 18.3 income.deleted

---

## 18.4 expense.created

Payload:

```json
{
  "property_id": "uuid",
  "category": "insurance",
  "amount": {
    "amount": "1600.00",
    "currency": "AUD"
  },
  "frequency": "annually",
  "classification": "operating"
}
```

---

## 18.5 expense.updated

---

## 18.6 expense.deleted

---

## 18.7 expense.material_change_detected

Producer:

```text
backend or analysis worker
```

Payload:

```json
{
  "property_id": "uuid",
  "category": "insurance",
  "change_percent": "0.25",
  "comparison_period": "year_over_year"
}
```

Consumers:

- recommendations;
- CIO briefing;
- notifications.

---

# 19. Lease events

## 19.1 lease.created

Payload:

```json
{
  "property_id": "uuid",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "weekly_rent": {
    "amount": "650.00",
    "currency": "AUD"
  }
}
```

Consumers:

- financial recalculation;
- reminder scheduling;
- portfolio update.

---

## 19.2 lease.updated

---

## 19.3 lease.ended

---

## 19.4 lease.expiry_approaching

Producer:

```text
backend scheduler
```

Consumers:

- notification;
- rent-review recommendation;
- property-management workflow.

---

## 19.5 lease.rent_review_due

---

## 19.6 lease.vacancy_started

---

## 19.7 lease.vacancy_ended

---

# 20. Valuation events

## 20.1 valuation.created

Payload:

```json
{
  "property_id": "uuid",
  "valuation_type": "bank",
  "value": {
    "amount": "900000.00",
    "currency": "AUD"
  },
  "valuation_date": "2026-07-20"
}
```

Consumers:

- financial recalculation;
- portfolio recalculation;
- LVR update;
- AI invalidation;
- recommendation review.

---

## 20.2 valuation.selected

Payload:

```json
{
  "property_id": "uuid",
  "valuation_id": "uuid",
  "previous_valuation_id": "uuid"
}
```

---

## 20.3 valuation.expired

Producer:

```text
backend scheduler
```

Consumers:

- data-quality warning;
- recommendation confidence reduction;
- notification.

---

## 20.4 valuation.external_request_completed

Payload:

```json
{
  "request_id": "uuid",
  "valuation_id": "uuid",
  "provider": "configured-provider"
}
```

---

# 21. Portfolio events

## 21.1 property.financials_recalculated

Payload:

```json
{
  "property_id": "uuid",
  "financial_snapshot_id": "uuid",
  "calculation_version": "1.0.0",
  "input_version": "property-financials:18"
}
```

---

## 21.2 portfolio.recalculation_requested

Producer:

```text
backend
```

Consumers:

```text
portfolio calculation worker
```

---

## 21.3 portfolio.recalculated

Payload:

```json
{
  "portfolio_snapshot_id": "uuid",
  "property_count": 4,
  "calculation_version": "1.0.0"
}
```

Consumers:

- frontend update;
- AI invalidation;
- portfolio analysis;
- recommendation generation.

---

## 21.4 portfolio.material_change_detected

Payload:

```json
{
  "change_type": "portfolio_lvr",
  "previous_value": "0.68",
  "new_value": "0.74",
  "materiality": "high"
}
```

---

# 22. Scenario events

## 22.1 scenario.created

---

## 22.2 scenario.updated

---

## 22.3 scenario.run_requested

Consumers:

- calculation worker.

---

## 22.4 scenario.run_completed

Payload:

```json
{
  "scenario_id": "uuid",
  "scenario_run_id": "uuid",
  "scenario_type": "sell_and_repay_loan",
  "calculation_version": "1.0.0"
}
```

Consumers:

- frontend;
- recommendation engine;
- audit.

---

## 22.5 scenario.run_failed

Payload:

```json
{
  "scenario_id": "uuid",
  "error_code": "MISSING_REQUIRED_INPUT"
}
```

---

## 22.6 scenario.deleted

---

# 23. AI execution events

## 23.1 ai.execution.created

Producer:

```text
backend
```

Consumers:

```text
AI platform
observability
billing usage
```

Payload:

```json
{
  "execution_id": "uuid",
  "agent_id": "property_analysis",
  "agent_version": "1.0.0",
  "subject_type": "property",
  "subject_id": "uuid"
}
```

---

## 23.2 ai.execution.started

Producer:

```text
ai-platform
```

---

## 23.3 ai.execution.progress

Payload:

```json
{
  "execution_id": "uuid",
  "sequence_number": 5,
  "stage": "risk_analysis",
  "progress_percent": 55,
  "message": "Reviewing property and suburb risks."
}
```

Consumers:

- backend persistence;
- realtime frontend updates.

Do not include hidden reasoning.

---

## 23.4 ai.execution.waiting_for_input

Payload:

```json
{
  "execution_id": "uuid",
  "required_fields": [
    "estimated_sale_price"
  ]
}
```

---

## 23.5 ai.execution.waiting_for_approval

Used only where orchestration requires explicit user approval.

---

## 23.6 ai.execution.completed

Payload:

```json
{
  "execution_id": "uuid",
  "agent_id": "property_analysis",
  "agent_version": "1.0.0",
  "status": "succeeded",
  "was_cache_hit": false,
  "result_reference": "uuid",
  "input_tokens": 8200,
  "output_tokens": 1350,
  "estimated_cost": "0.42"
}
```

Consumers:

- backend;
- notifications;
- billing usage;
- observability.

---

## 23.7 ai.execution.partially_completed

Payload includes missing or failed specialist sections.

---

## 23.8 ai.execution.failed

Payload:

```json
{
  "execution_id": "uuid",
  "error_code": "AI_OUTPUT_VALIDATION_FAILED",
  "retryable": false
}
```

---

## 23.9 ai.execution.cancelled

---

## 23.10 ai.cache.invalidated

Payload:

```json
{
  "scope": "property",
  "scope_id": "uuid",
  "reason": "valuation_updated",
  "affected_agents": [
    "finance",
    "property_analysis",
    "prediction"
  ]
}
```

---

# 24. Recommendation events

## 24.1 recommendation.created

Payload:

```json
{
  "recommendation_id": "uuid",
  "recommendation_type": "review_refinance",
  "priority": "high",
  "subject_type": "property",
  "subject_id": "uuid",
  "agent_id": "strategy"
}
```

Consumers:

- notification prioritisation;
- frontend;
- CIO briefing;
- analytics.

---

## 24.2 recommendation.updated

---

## 24.3 recommendation.acknowledged

---

## 24.4 recommendation.dismissed

Payload:

```json
{
  "reason": "not_relevant"
}
```

Consumers:

- deduplication;
- learning;
- CIO suppression.

---

## 24.5 recommendation.completed

---

## 24.6 recommendation.expired

Producer:

```text
backend scheduler
```

---

## 24.7 recommendation.materially_changed

Used when previously dismissed or acknowledged recommendation becomes materially different.

---

# 25. Listing and discovery events

## 25.1 listing.created

Producer:

```text
data-platform
```

Payload:

```json
{
  "listing_id": "uuid",
  "provider": "configured-provider",
  "provider_listing_id": "external-id",
  "status": "active",
  "property_id": "uuid"
}
```

Consumers:

- watchlist matcher;
- listing analysis;
- discovery.

---

## 25.2 listing.updated

Payload:

```json
{
  "changed_fields": [
    "price_text",
    "auction_date"
  ],
  "provider_updated_at": "2026-08-02T08:00:00Z"
}
```

---

## 25.3 listing.withdrawn

---

## 25.4 listing.sold

Payload may include sale status and approved price data where licensed.

---

## 25.5 listing.match_evaluated

Payload:

```json
{
  "listing_id": "uuid",
  "watchlist_id": "uuid",
  "match_score": "0.82",
  "qualified": true
}
```

---

## 25.6 opportunity.created

Producer:

```text
backend or discovery worker
```

Payload:

```json
{
  "opportunity_id": "uuid",
  "listing_id": "uuid",
  "watchlist_id": "uuid",
  "priority": "high"
}
```

---

## 25.7 opportunity.shortlisted

---

## 25.8 opportunity.rejected

---

# 26. Watchlist events

## 26.1 watchlist.created

---

## 26.2 watchlist.updated

Consumers:

- rematch active listings;
- cache invalidation.

---

## 26.3 watchlist.deleted

---

# 27. Communication draft events

## 27.1 communication.draft_created

Payload:

```json
{
  "draft_id": "uuid",
  "communication_type": "expression_of_interest",
  "listing_id": "uuid",
  "requires_user_approval": true
}
```

---

## 27.2 communication.draft_updated

Payload:

```json
{
  "draft_id": "uuid",
  "draft_version": 2,
  "changed_fields": [
    "subject",
    "body"
  ]
}
```

Prior approval may be invalidated.

---

## 27.3 communication.approved

Payload:

```json
{
  "draft_id": "uuid",
  "approval_id": "uuid",
  "draft_version": 2,
  "recipient_email_hash": "hash"
}
```

Security-sensitive.

---

## 27.4 communication.approval_invalidated

Reasons:

- body changed;
- subject changed;
- recipient changed;
- approval expired.

---

## 27.5 communication.send_requested

Producer:

```text
backend
```

Consumers:

```text
email sender
```

Requires idempotency.

---

## 27.6 communication.sent

Payload:

```json
{
  "message_id": "uuid",
  "draft_id": "uuid",
  "provider": "sendgrid",
  "provider_message_reference": "safe-reference"
}
```

---

## 27.7 communication.delivery_confirmed

---

## 27.8 communication.bounced

---

## 27.9 communication.complained

---

## 27.10 communication.send_failed

Payload:

```json
{
  "message_id": "uuid",
  "error_code": "EMAIL_PROVIDER_UNAVAILABLE",
  "retryable": true
}
```

---

## 27.11 communication.duplicate_prevented

---

# 28. Document events

## 28.1 document.upload_initiated

---

## 28.2 document.uploaded

Payload:

```json
{
  "document_id": "uuid",
  "property_id": "uuid",
  "document_type": "strata_report",
  "mime_type": "application/pdf",
  "file_size_bytes": 2450000
}
```

Consumers:

- malware scan;
- document processing;
- audit.

---

## 28.3 document.scan_completed

Payload:

```json
{
  "document_id": "uuid",
  "scan_status": "clean"
}
```

---

## 28.4 document.scan_failed

Must block downstream processing.

---

## 28.5 document.analysis_requested

---

## 28.6 document.analysis_completed

Payload:

```json
{
  "document_id": "uuid",
  "analysis_id": "uuid",
  "parser_version": "1.0.0",
  "agent_version": "1.0.0"
}
```

---

## 28.7 document.analysis_failed

---

## 28.8 document.deleted

Consumers:

- storage cleanup;
- extracted text deletion;
- embeddings deletion;
- AI cache invalidation;
- audit.

---

# 29. Inspection events

## 29.1 inspection.created

---

## 29.2 inspection.completed

---

## 29.3 inspection.finding_created

Payload:

```json
{
  "inspection_id": "uuid",
  "finding_id": "uuid",
  "severity": "medium",
  "category": "maintenance"
}
```

---

## 29.4 inspection.follow_up_due

---

# 30. Maintenance events

## 30.1 maintenance_request.created

---

## 30.2 maintenance_request.status_changed

Payload:

```json
{
  "previous_status": "open",
  "new_status": "in_progress"
}
```

---

## 30.3 maintenance_request.completed

---

## 30.4 maintenance_request.overdue

---

# 31. Learning events

## 31.1 learning.path_started

---

## 31.2 learning.lesson_started

---

## 31.3 learning.lesson_completed

---

## 31.4 learning.quiz_submitted

Payload:

```json
{
  "attempt_id": "uuid",
  "score": "0.80",
  "module_id": "uuid"
}
```

---

## 31.5 learning.concept_mastery_updated

Payload:

```json
{
  "concept_id": "gross_yield",
  "previous_level": "beginner",
  "new_level": "intermediate"
}
```

---

# 32. Notification events

## 32.1 notification.requested

Producer:

- backend;
- recommendation engine;
- scheduler.

Payload:

```json
{
  "notification_type": "fixed_rate_expiry",
  "user_id": "uuid",
  "priority": "high",
  "related_entity_type": "loan",
  "related_entity_id": "uuid"
}
```

---

## 32.2 notification.created

---

## 32.3 notification.delivery_requested

---

## 32.4 notification.delivered

---

## 32.5 notification.failed

---

## 32.6 notification.read

---

## 32.7 notification.dismissed

---

## 32.8 notification.duplicate_suppressed

---

# 33. Billing events

## 33.1 billing.subscription_created

Producer:

```text
billing webhook processor
```

Payload:

```json
{
  "user_id": "uuid",
  "provider": "configured-provider",
  "plan_id": "pro",
  "status": "active"
}
```

---

## 33.2 billing.subscription_updated

---

## 33.3 billing.subscription_cancelled

---

## 33.4 billing.entitlements_changed

Consumers:

- backend permission cache;
- AI usage enforcement;
- frontend refresh.

---

## 33.5 billing.payment_succeeded

---

## 33.6 billing.payment_failed

Consumers:

- notification;
- entitlement grace logic;
- support.

---

## 33.7 billing.usage_recorded

Payload:

```json
{
  "usage_type": "ai_execution",
  "quantity": 1,
  "execution_id": "uuid"
}
```

---

# 34. Data-platform events

## 34.1 source.access_failed

Payload:

```json
{
  "source_id": "rba",
  "error_code": "SOURCE_TIMEOUT",
  "retryable": true
}
```

---

## 34.2 source.schema_changed

Payload:

```json
{
  "source_id": "provider",
  "previous_schema_hash": "hash",
  "new_schema_hash": "hash"
}
```

Consumers:

- alerts;
- pipeline suspension;
- data engineering review.

---

## 34.3 raw_artifact.created

Payload:

```json
{
  "raw_artifact_id": "uuid",
  "source_id": "abs",
  "checksum": "hash",
  "retrieved_at": "2026-08-02T08:00:00Z"
}
```

---

## 34.4 pipeline.started

---

## 34.5 pipeline.completed

Payload:

```json
{
  "pipeline_id": "abs_population",
  "job_id": "uuid",
  "rows_extracted": 10000,
  "rows_published": 9950,
  "rows_rejected": 50
}
```

---

## 34.6 pipeline.failed

---

## 34.7 dataset.quality_evaluated

Payload:

```json
{
  "dataset_id": "suburb_market_metrics",
  "dataset_version": "2026.08.02",
  "overall_score": "0.95",
  "critical_failure_count": 0
}
```

---

## 34.8 dataset.published

Payload:

```json
{
  "dataset_id": "suburb_market_metrics",
  "dataset_version": "2026.08.02",
  "previous_version": "2026.07.15",
  "changed_partitions": [
    "NSW:2000"
  ],
  "quality_score": "0.95",
  "material_change": true
}
```

Consumers:

- backend cache invalidation;
- AI cache invalidation;
- recommendations;
- observability.

---

## 34.9 dataset.partition_updated

---

## 34.10 dataset.stale

Payload:

```json
{
  "dataset_id": "listing_feed",
  "age_hours": 12,
  "maximum_age_hours": 4
}
```

---

## 34.11 dataset.quality_degraded

---

## 34.12 dataset.rolled_back

---

## 34.13 dataset.contract_expiry_approaching

Consumers:

- operations;
- procurement;
- data owner.

---

# 35. Economic and market events

These are normalised domain events produced from dataset publication.

## 35.1 rates.cash_rate_changed

Payload:

```json
{
  "previous_rate": "0.0435",
  "new_rate": "0.0410",
  "effective_date": "2026-08-04",
  "source_id": "rba"
}
```

---

## 35.2 market.metrics_updated

---

## 35.3 rental.metrics_updated

---

## 35.4 comparable_sales.updated

---

## 35.5 demographics.updated

---

## 35.6 hazards.updated

---

## 35.7 infrastructure.project_status_changed

Payload:

```json
{
  "project_id": "uuid",
  "previous_status": "funded",
  "new_status": "under_construction"
}
```

---

# 36. Security events

Security events may use a separate restricted event stream.

## 36.1 security.authentication_failed

Payload must avoid passwords and tokens.

---

## 36.2 security.authorisation_denied

Payload:

```json
{
  "actor_id": "uuid",
  "resource_type": "property",
  "resource_id": "uuid",
  "action": "read",
  "reason": "not_household_member"
}
```

---

## 36.3 security.cross_household_access_attempted

High-priority security event.

---

## 36.4 security.service_identity_failed

---

## 36.5 security.webhook_signature_failed

---

## 36.6 security.prompt_injection_detected

Payload:

```json
{
  "execution_id": "uuid",
  "source_type": "listing",
  "source_reference": "uuid",
  "detection_type": "indirect_instruction"
}
```

Do not include the full malicious content unless stored in restricted evidence.

---

## 36.7 security.suspicious_upload_detected

---

## 36.8 security.secret_access_failed

---

## 36.9 security.admin_action_performed

Restricted and audited.

---

# 37. Operational events

## 37.1 deployment.completed

Payload:

```json
{
  "service": "backend",
  "release_version": "1.2.0",
  "commit_sha": "sha",
  "revision": "cloud-run-revision"
}
```

---

## 37.2 deployment.failed

---

## 37.3 migration.completed

---

## 37.4 migration.failed

---

## 37.5 backup.completed

---

## 37.6 backup.failed

---

## 37.7 restore.test_completed

---

## 37.8 provider.degraded

---

## 37.9 provider.recovered

---

## 37.10 cost.threshold_exceeded

Payload:

```json
{
  "cost_category": "ai",
  "period": "daily",
  "actual_amount": "250.00",
  "threshold_amount": "200.00",
  "currency": "AUD"
}
```

---

# 38. Producer-consumer matrix

| Event category | Primary producer | Main consumers |
|---|---|---|
| Household | Backend | Audit, permissions, notifications |
| Property | Backend | Portfolio, AI, search, audit |
| Finance | Backend | Calculations, AI, recommendations |
| Lease | Backend/Scheduler | Notifications, property management |
| Valuation | Backend/Provider adapter | Financials, AI, portfolio |
| Portfolio | Calculation worker | Frontend, AI, recommendations |
| Scenario | Backend/Calculation worker | Frontend, AI |
| AI execution | Backend/AI platform | Frontend, billing, notifications |
| Recommendation | Backend/AI platform | Frontend, CIO, notifications |
| Listing | Data platform | Discovery, matching, frontend |
| Communication | Backend/Email worker | Audit, frontend, webhooks |
| Document | Backend/Document worker | AI, storage, frontend |
| Data | Data platform | Backend, AI, monitoring |
| Billing | Webhook processor | Entitlements, frontend |
| Security | All services | Security monitoring |
| Operations | Deployment/Platform | Monitoring, incident response |

---

# 39. Event privacy classification

Classify events:

```text
public_metadata
internal
confidential
restricted
security_restricted
```

Most user-domain events are:

```text
confidential
```

Security events may be:

```text
security_restricted
```

Do not place full personal or financial content in event payloads.

Use resource references.

---

# 40. Event retention

Define retention by category.

Example policy:

```text
domain events: long-term according to audit and product policy
AI progress events: shorter operational retention
billing events: according to financial and provider obligations
security events: extended restricted retention
data publication events: long-term lineage retention
operational events: according to incident and cost needs
```

Actual periods must be defined in privacy and retention policy.

---

# 41. Event observability

Track:

```text
events_published_count
events_publish_failure_count
events_consumed_count
events_consume_failure_count
event_processing_duration_ms
event_retry_count
event_dead_letter_count
event_duplicate_count
event_out_of_order_count
event_lag_ms
```

Dimensions:

```text
event_type
event_version
producer
consumer
environment
status
```

Avoid event ID as a metric label.

---

# 42. Event lag

Measure:

```text
event_lag =
    consumer_processed_at - event.occurred_at
```

Alert on critical lag for:

- communication;
- billing;
- security;
- listings;
- AI progress;
- data freshness.

---

# 43. Event schema registry

Maintain:

```text
contracts/events/
├── common.schema.json
├── household-events.schema.json
├── property-events.schema.json
├── finance-events.schema.json
├── ai-events.schema.json
├── recommendation-events.schema.json
├── listing-events.schema.json
├── communication-events.schema.json
├── document-events.schema.json
├── billing-events.schema.json
├── data-events.schema.json
├── security-events.schema.json
└── operational-events.schema.json
```

Every event type requires an example.

---

# 44. Contract testing

Test:

- envelope;
- payload schema;
- version;
- required fields;
- optional fields;
- unknown field tolerance;
- unknown enum handling;
- producer contract;
- consumer compatibility;
- idempotency;
- duplicate delivery;
- stale aggregate version;
- out-of-order delivery;
- dead-letter;
- replay.

---

# 45. Event publication rules

A producer must:

1. validate payload;
2. create event ID;
3. attach trace ID;
4. attach aggregate version;
5. write to outbox transactionally;
6. publish;
7. record publication status;
8. retry safely;
9. alert on persistent failure.

---

# 46. Consumer rules

A consumer must:

1. validate envelope;
2. validate payload version;
3. check inbox for duplicate;
4. verify scope where relevant;
5. process transactionally;
6. record result;
7. acknowledge after durable success;
8. retry transient failures;
9. dead-letter permanent failures;
10. expose metrics.

---

# 47. Side-effect event rules

Events that can lead to external side effects require additional safeguards.

Examples:

```text
communication.send_requested
billing payment events
notification.delivery_requested
```

Requirements:

- idempotency key;
- approval where required;
- deduplication;
- rate limits;
- audit;
- provider event reference;
- status reconciliation.

---

# 48. Event-driven cache invalidation

Examples:

## Valuation updated

Invalidate:

```text
finance
property_analysis
prediction
portfolio_performance
```

## Loan updated

Invalidate:

```text
finance
risk
strategy
sell_hold_refinance
portfolio_performance
```

## Dataset published

Invalidate only cache entries referencing changed dataset versions or partitions.

Do not clear all caches globally by default.

---

# 49. Event-driven recommendations

Material events may trigger recommendation evaluation.

Examples:

```text
loan.fixed_rate_expiry_approaching
lease.rent_review_due
valuation.created
portfolio.material_change_detected
rates.cash_rate_changed
dataset.quality_degraded
listing.match_evaluated
```

Recommendation generation must apply:

- materiality;
- deduplication;
- user preferences;
- stale-data policy;
- cooldown.

---

# 50. Event-driven notifications

Notifications should be generated from recommendation or milestone events rather than every raw update.

Avoid:

```text
one notification per low-level event
```

Prefer:

```text
one deduplicated user-relevant notification
```

---

# 51. Operational replay restrictions

Do not replay without review:

```text
communication.sent
communication.send_requested
billing.payment_succeeded
billing.payment_failed
notification.delivery_requested
```

For these events, replay may require:

- simulation;
- reconciliation;
- provider query;
- manual approval.

---

# 52. Event administration

Provide restricted tooling for:

- search by event ID;
- search by trace ID;
- inspect consumer status;
- replay eligible event;
- mark dead-letter resolved;
- view lag;
- view schema version;
- view aggregate history.

All admin actions must be audited.

---

# 53. Environment variables

Potential configuration:

```text
EVENT_TRANSPORT=
EVENT_TOPIC_PREFIX=
EVENT_OUTBOX_POLL_INTERVAL_SECONDS=
EVENT_MAX_RETRIES=
EVENT_DEAD_LETTER_TOPIC=
EVENT_CONSUMER_GROUP=
EVENT_PUBLISHING_ENABLED=
EVENT_REPLAY_ENABLED=
```

No secrets should be embedded in event payloads or topic names.

---

# 54. Documentation requirements

Each event must document:

```text
event_type
event_version
description
producer
consumers
trigger
aggregate
payload
privacy_classification
ordering
idempotency
retry
dead_letter
retention
schema_path
example
```

---

# 55. Codex rules

Codex must:

1. implement an outbox pattern;
2. implement consumer inbox deduplication;
3. use immutable event envelopes;
4. version event schemas;
5. propagate trace IDs;
6. minimise payloads;
7. avoid secrets and full private documents;
8. use aggregate versions;
9. add retry and dead-letter handling;
10. create event metrics;
11. add schema and compatibility tests;
12. restrict replay of side-effect events;
13. create cache invalidation consumers;
14. document every new event;
15. update the catalogue with every event change.

---

# 56. Definition of done

The event architecture is complete when:

- event envelope is standardised;
- event schemas exist;
- outbox publication is transactional;
- consumers are idempotent;
- duplicate delivery is safe;
- out-of-order delivery is handled;
- retries are bounded;
- dead-letter events are visible;
- replay is controlled;
- domain, AI, data, communication, billing, security, and operational events are catalogued;
- cache invalidation is targeted;
- recommendation triggers are materiality-aware;
- event lag is monitored;
- side-effect events have extra safeguards;
- contract tests pass;
- admin replay is audited.

---

# 57. Final event principle

For every TrackMyProps event, the platform must be able to answer:

```text
What fact occurred?
Who produced it?
Which aggregate and version does it describe?
Who consumes it?
Can it be delivered more than once?
What happens if it arrives late or out of order?
How is failure retried?
Can it be replayed safely?
What sensitive data does it contain?
Which schema version validates it?
```

An event without clear answers to those questions is not ready for production.
