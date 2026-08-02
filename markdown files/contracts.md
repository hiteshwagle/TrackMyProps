# TrackMyProps Shared Contracts

## 1. Purpose

This document defines the shared contracts used across TrackMyProps.

It applies to:

```text
TrackMyProps/
├── frontend/
├── backend/
├── ai-platform/
└── data-platform/
```

It covers API conventions, authentication, service identity, requests, responses, errors, pagination, idempotency, events, AI execution, recommendations, data freshness, evidence, approvals, documents, notifications, webhooks, versioning, and generated clients.

## 2. Contract principles

1. Contracts are versioned.
2. Contracts are explicit.
3. Contracts are validated at every boundary.
4. Contracts are backward compatible where practical.
5. Breaking changes require a new version.
6. Internal services do not trust each other implicitly.
7. Sensitive fields are omitted unless required.
8. Dates use ISO-8601.
9. IDs use UUIDs unless documented otherwise.
10. Money includes currency.
11. AI outputs distinguish facts, calculations, assumptions, and predictions.
12. Events are immutable and idempotent.
13. Errors use stable codes.
14. Every material response is traceable.
15. Generated clients are preferred over duplicated manual models.

## 3. Shared contract repository

```text
TrackMyProps/contracts/
├── openapi/
│   ├── backend-v1.yaml
│   └── ai-platform-v1.yaml
├── events/
│   ├── common.schema.json
│   ├── property-events.schema.json
│   ├── ai-events.schema.json
│   ├── data-events.schema.json
│   └── communication-events.schema.json
├── json-schema/
│   ├── common/
│   ├── recommendations/
│   ├── executions/
│   ├── freshness/
│   └── errors/
├── examples/
├── generated/
└── README.md
```

Generated code must not be manually edited.

## 4. API versioning

Use URI versioning:

```text
/api/v1
```

Breaking changes require `/api/v2` or a later major version.

## 5. Content types and timestamps

Default:

```text
Content-Type: application/json
Accept: application/json
```

File uploads may use `multipart/form-data`.

Timestamps are ISO-8601 UTC strings, for example:

```text
2026-08-02T09:15:00Z
```

## 6. Authentication contract

### 6.1 User requests

```text
Authorization: Bearer <supabase_access_token>
```

The backend validates issuer, audience, signature, expiry, subject, token type, and required claims.

### 6.2 Service requests

Use signed service identity tokens.

```text
Authorization: Bearer <service_identity_token>
X-Request-ID: <uuid>
X-Trace-ID: <uuid>
```

The receiving service validates issuer, audience, service identity, expiry, scope, and environment.

### 6.3 Household context

Where needed:

```text
X-Household-ID: <uuid>
```

This is contextual only. The backend still verifies membership and permission.

## 7. Standard request headers

```text
Authorization
Content-Type
Accept
X-Request-ID
X-Trace-ID
X-Idempotency-Key
X-Household-ID
X-Client-Version
X-App-Platform
X-App-Build
```

Request IDs should be generated when absent. Trace IDs propagate across services.

## 8. Standard response metadata

Where appropriate:

```json
{
  "data": {},
  "meta": {
    "request_id": "uuid",
    "trace_id": "uuid",
    "generated_at": "2026-08-02T09:15:00Z"
  }
}
```

Use one consistent response pattern per API.

## 9. Error contract

```json
{
  "error": {
    "code": "PROPERTY_NOT_FOUND",
    "message": "The requested property could not be found.",
    "details": {},
    "trace_id": "uuid"
  }
}
```

Required fields: `code`, `message`, and `trace_id`.

Optional fields: `details`, `field_errors`, `retryable`, and `retry_after_seconds`.

Validation example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "field_errors": [
      {
        "field": "weekly_rent",
        "code": "VALUE_TOO_LOW",
        "message": "Weekly rent must be greater than zero."
      }
    ],
    "trace_id": "uuid"
  }
}
```

Suggested code prefixes:

```text
AUTH_
PERMISSION_
VALIDATION_
PROPERTY_
LOAN_
PORTFOLIO_
SCENARIO_
AI_
DATA_
DOCUMENT_
COMMUNICATION_
BILLING_
RATE_LIMIT_
INTERNAL_
```

## 10. HTTP status mapping

Use appropriate status codes, including:

```text
200 OK
201 Created
202 Accepted
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
413 Payload Too Large
415 Unsupported Media Type
422 Validation Error
429 Too Many Requests
500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
504 Gateway Timeout
```

Never return `200` for a failed operation.

## 11. Pagination

Page-based request:

```text
?page=1&page_size=25
```

Response:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "page_size": 25,
    "total": 130,
    "total_pages": 6,
    "has_next": true,
    "has_previous": false
  }
}
```

Cursor pagination:

```json
{
  "items": [],
  "pagination": {
    "next_cursor": "opaque",
    "has_next": true
  }
}
```

Use cursor pagination for large time-ordered streams.

## 12. Sorting and filtering

Suggested conventions:

```text
sort=created_at
order=desc
status=active
property_id=<uuid>
from_date=2026-01-01
to_date=2026-08-01
```

Only allow approved sort fields.

## 13. Idempotency

Header:

```text
X-Idempotency-Key: <client-generated-unique-value>
```

Required for AI execution creation, EOI sending, payments, webhooks, expensive reports, and duplicate-prone jobs.

Conflict example:

```json
{
  "error": {
    "code": "IDEMPOTENCY_KEY_REUSED",
    "message": "This idempotency key was already used with a different request.",
    "trace_id": "uuid"
  }
}
```

## 14. Optimistic concurrency

Use `record_version`.

Conflict example:

```json
{
  "error": {
    "code": "RECORD_VERSION_CONFLICT",
    "message": "The record was updated by another operation.",
    "details": {
      "current_version": 4
    },
    "trace_id": "uuid"
  }
}
```

## 15. Money contract

```json
{
  "amount": "1250.50",
  "currency": "AUD"
}
```

Amounts are decimal strings. Currency uses ISO 4217.

## 16. Percentage and rate contract

Use decimal form:

```json
{
  "value": "0.0625",
  "display_percent": "6.25"
}
```

Do not mix decimal and percentage conventions within one API.

## 17. Date and time contract

```text
date: YYYY-MM-DD
timestamp: ISO-8601 UTC
timezone: IANA identifier
```

Example:

```json
{
  "settlement_date": "2026-09-15",
  "created_at": "2026-08-02T09:15:00Z",
  "timezone": "Australia/Sydney"
}
```

## 18. Property contract

```json
{
  "id": "uuid",
  "household_id": "uuid",
  "address": {
    "unit_number": "5",
    "street_number": "10",
    "street_name": "Example",
    "street_type": "Street",
    "suburb": "Sydney",
    "state": "NSW",
    "postcode": "2000",
    "country_code": "AU",
    "latitude": -33.8688,
    "longitude": 151.2093
  },
  "property_type": "apartment",
  "bedrooms": 2,
  "bathrooms": 2,
  "car_spaces": 1,
  "ownership_status": "owned",
  "record_version": 1
}
```

## 19. Financial summary contract

```json
{
  "property_id": "uuid",
  "as_at": "2026-08-02",
  "estimated_value": {"amount": "850000.00", "currency": "AUD"},
  "loan_balance": {"amount": "600000.00", "currency": "AUD"},
  "equity": {"amount": "250000.00", "currency": "AUD"},
  "lvr": {"value": "0.705882"},
  "annual_income": {"amount": "33800.00", "currency": "AUD"},
  "annual_expenses": {"amount": "11800.00", "currency": "AUD"},
  "annual_cash_flow": {"amount": "-8200.00", "currency": "AUD"},
  "calculation_version": "1.0.0",
  "input_version": "property-financials:18"
}
```

## 20. AI execution creation

Endpoint:

```text
POST /api/v1/ai/executions
```

Request:

```json
{
  "agent_id": "property_analysis",
  "subject": {"type": "property", "id": "uuid"},
  "input": {"analysis_type": "investment_review"},
  "freshness_preference": "current",
  "locale": "en-AU"
}
```

Response:

```json
{
  "execution_id": "uuid",
  "status": "queued",
  "agent_id": "property_analysis",
  "agent_version": "1.0.0",
  "created_at": "2026-08-02T09:15:00Z"
}
```

## 21. AI execution status

```json
{
  "execution_id": "uuid",
  "status": "running",
  "progress": {
    "percent": 55,
    "stage": "risk_analysis",
    "message": "Reviewing property and suburb risks."
  },
  "cache": {"was_cache_hit": false},
  "created_at": "2026-08-02T09:15:00Z",
  "started_at": "2026-08-02T09:15:02Z",
  "completed_at": null
}
```

Statuses:

```text
requested
validated
queued
running
waiting_for_input
waiting_for_approval
succeeded
partially_succeeded
failed
cancelled
expired
```

## 22. AI execution event

```json
{
  "event_id": "uuid",
  "execution_id": "uuid",
  "sequence_number": 5,
  "event_type": "specialist.completed",
  "stage": "finance_analysis",
  "message": "Financial analysis completed.",
  "progress_percent": 45,
  "created_at": "2026-08-02T09:15:20Z"
}
```

Never expose hidden chain-of-thought.

## 23. Recommendation contract

```json
{
  "recommendation_id": "uuid",
  "recommendation_type": "review_refinance",
  "subject": {"type": "property", "id": "uuid"},
  "summary": "Review refinancing options before the fixed-rate period ends.",
  "priority": "high",
  "confidence": {
    "score": "0.82",
    "label": "high",
    "positive_factors": ["Current loan data is complete."],
    "negative_factors": ["Future lender pricing is unknown."]
  },
  "facts": [],
  "calculations": [],
  "assumptions": [],
  "evidence": [],
  "risks": [],
  "alternatives": [],
  "suggested_actions": [],
  "missing_information": [],
  "data_freshness": [],
  "agent": {
    "agent_id": "strategy",
    "agent_version": "1.0.0",
    "prompt_id": "strategy.system",
    "prompt_version": "1.0.0"
  },
  "status": "new",
  "created_at": "2026-08-02T09:15:00Z",
  "expires_at": null
}
```

## 24. Evidence contract

```json
{
  "evidence_id": "uuid",
  "source_type": "curated_dataset",
  "source_name": "Suburb Market Metrics",
  "reference": {
    "dataset_id": "suburb_market_metrics",
    "record_id": "uuid"
  },
  "effective_date": "2026-07-01",
  "published_at": "2026-07-15T00:00:00Z",
  "retrieved_at": "2026-08-02T09:14:00Z",
  "dataset_version": "2026.07.15",
  "quality_score": "0.94",
  "summary": "Median rent for the selected property type was $620 per week."
}
```

## 25. Assumption contract

```json
{
  "assumption_id": "sale_price",
  "label": "Estimated sale price",
  "value": {"amount": "900000.00", "currency": "AUD"},
  "source": "user_input",
  "editable": true,
  "materiality": "high"
}
```

## 26. Risk contract

```json
{
  "risk_id": "interest_rate_exposure",
  "category": "finance",
  "severity": "high",
  "confidence": "high",
  "summary": "Repayments may rise after the fixed-rate period ends.",
  "evidence_ids": ["uuid"],
  "mitigations": ["Review refinance options before expiry."],
  "time_horizon": "next_6_months"
}
```

## 27. Suggested action contract

```json
{
  "action_id": "review_refinance",
  "label": "Review refinance options",
  "description": "Compare the current loan against available alternatives.",
  "action_type": "user_review",
  "requires_approval": false,
  "due_date": "2026-10-01",
  "priority": "high"
}
```

## 28. Data freshness contract

```json
{
  "source_name": "Suburb Market Metrics",
  "effective_date": "2026-07-01",
  "published_at": "2026-07-15T00:00:00Z",
  "ingested_at": "2026-07-15T02:10:00Z",
  "retrieved_at": "2026-08-02T09:14:00Z",
  "dataset_version": "2026.07.15",
  "freshness_status": "current",
  "maximum_acceptable_age_days": 45,
  "quality_score": "0.94"
}
```

Statuses:

```text
current
aging
stale
unknown
```

## 29. Prediction contract

```json
{
  "prediction_id": "uuid",
  "target": "annual_capital_growth",
  "horizon": {"value": 3, "unit": "years"},
  "estimate": {
    "lower": "0.03",
    "central": "0.045",
    "upper": "0.06"
  },
  "confidence": {"score": "0.61", "label": "medium"},
  "assumptions": [],
  "input_dataset_versions": {},
  "model_version": "prediction-model-1.0.0",
  "generated_at": "2026-08-02T09:15:00Z",
  "cache_expires_at": "2026-08-02T15:15:00Z",
  "disclaimer": "This is an estimate, not a guarantee."
}
```

## 30. Scenario contract

Request:

```json
{
  "scenario_type": "sell_property_repay_loan",
  "name": "Sell Property A and reduce Loan B",
  "inputs": {
    "property_to_sell_id": "uuid",
    "target_loan_id": "uuid",
    "estimated_sale_price": {"amount": "950000.00", "currency": "AUD"},
    "selling_costs": {"amount": "25000.00", "currency": "AUD"},
    "tax_input": null
  }
}
```

Result:

```json
{
  "scenario_id": "uuid",
  "scenario_type": "sell_property_repay_loan",
  "assumptions": [],
  "results": {
    "net_sale_proceeds": {"amount": "325000.00", "currency": "AUD"},
    "target_loan_reduction": {"amount": "325000.00", "currency": "AUD"},
    "annual_cash_flow_change": {"amount": "14800.00", "currency": "AUD"}
  },
  "calculation_version": "1.0.0",
  "created_at": "2026-08-02T09:15:00Z"
}
```

## 31. Communication draft contract

```json
{
  "draft_id": "uuid",
  "communication_type": "expression_of_interest",
  "listing_id": "uuid",
  "recipient": {
    "name": "Selling Agent",
    "email": "agent@example.com",
    "confirmed": false
  },
  "subject": "Expression of Interest – 10 Example Street",
  "body": "Draft content...",
  "missing_fields": ["finance_status", "settlement_preference"],
  "status": "awaiting_review",
  "requires_user_approval": true,
  "draft_version": 1,
  "ai_execution_id": "uuid",
  "created_at": "2026-08-02T09:15:00Z"
}
```

## 32. Communication approval and send

Approval request:

```json
{
  "draft_version": 2,
  "recipient_email": "agent@example.com",
  "approved_subject": "Expression of Interest – 10 Example Street",
  "approved_body": "Final approved content..."
}
```

Sending is a separate idempotent operation and requires valid approval.

## 33. Document contract

```json
{
  "document_id": "uuid",
  "property_id": "uuid",
  "document_type": "strata_report",
  "file_name": "strata-report.pdf",
  "mime_type": "application/pdf",
  "file_size_bytes": 2450000,
  "status": "uploaded",
  "uploaded_at": "2026-08-02T09:00:00Z",
  "processing": {"status": "not_started"}
}
```

Never expose permanent object-storage paths.

## 34. Signed upload contract

```json
{
  "upload_id": "uuid",
  "signed_upload_url": "temporary-url",
  "expires_at": "2026-08-02T09:10:00Z",
  "required_headers": {
    "Content-Type": "application/pdf"
  }
}
```

## 35. Notification contract

```json
{
  "notification_id": "uuid",
  "notification_type": "ai_report_ready",
  "title": "Your property analysis is ready",
  "body": "Review the analysis and supporting evidence.",
  "priority": "normal",
  "status": "unread",
  "related_entity": {"type": "ai_execution", "id": "uuid"},
  "created_at": "2026-08-02T09:15:00Z"
}
```

## 36. Event envelope

```json
{
  "event_id": "uuid",
  "event_type": "property.updated",
  "event_version": "1.0",
  "occurred_at": "2026-08-02T09:15:00Z",
  "producer": "backend",
  "environment": "production",
  "trace_id": "uuid",
  "aggregate": {
    "type": "property",
    "id": "uuid",
    "version": "4"
  },
  "payload": {}
}
```

Events are immutable.

## 37. Core event types

Backend events:

```text
household.created
household.member_added
property.created
property.updated
property.deleted
loan.created
loan.updated
lease.updated
valuation.created
portfolio.recalculated
scenario.created
recommendation.created
recommendation.updated
communication.approved
communication.sent
document.uploaded
document.deleted
```

AI events:

```text
ai.execution.created
ai.execution.started
ai.execution.progress
ai.execution.waiting_for_input
ai.execution.completed
ai.execution.partially_completed
ai.execution.failed
ai.cache.invalidated
```

Data events:

```text
dataset.published
dataset.partition_updated
dataset.stale
dataset.quality_degraded
market_metrics.updated
demographics.updated
comparable_sales.updated
rates.updated
hazards.updated
```

Discovery events:

```text
listing.created
listing.updated
listing.withdrawn
listing.sold
listing.matched
opportunity.created
```

## 38. Dataset published event

```json
{
  "event_id": "uuid",
  "event_type": "dataset.published",
  "event_version": "1.0",
  "occurred_at": "2026-08-02T09:15:00Z",
  "producer": "data-platform",
  "trace_id": "uuid",
  "aggregate": {
    "type": "dataset",
    "id": "suburb_market_metrics",
    "version": "2026.08.02"
  },
  "payload": {
    "previous_version": "2026.07.15",
    "changed_partitions": ["NSW:2000"],
    "quality_score": "0.95",
    "material_change": true
  }
}
```

## 39. Event idempotency and ordering

Consumers persist processed event IDs.

Duplicate delivery must not duplicate recommendations, email, notifications, cache invalidation, property updates, or billing actions.

Do not assume global ordering. Use aggregate versions when order matters.

## 40. Webhook contract

Every webhook must be signature verified, timestamp checked where supported, schema validated, idempotently processed, and stored by provider event ID.

Normalized example:

```json
{
  "provider": "sendgrid",
  "provider_event_id": "external-id",
  "event_type": "delivered",
  "occurred_at": "2026-08-02T09:15:00Z",
  "resource_reference": {
    "type": "communication_message",
    "id": "uuid"
  },
  "payload_redacted": {}
}
```

## 41. Data source contract

```json
{
  "source_id": "abs_census",
  "display_name": "ABS Census",
  "provider": "Australian Bureau of Statistics",
  "access_method": "bulk_download",
  "licence_id": "licence-reference",
  "refresh_cadence": "on_release",
  "contains_personal_data": false,
  "allows_redistribution": true,
  "allows_derived_outputs": true,
  "status": "active"
}
```

## 42. Dataset contract

```json
{
  "dataset_id": "suburb_market_metrics",
  "schema_version": "1.0",
  "grain": "suburb-property_type-bedroom-period",
  "owner": "data-platform",
  "freshness_policy": {
    "maximum_age_days": 45
  },
  "quality_profile": "market_metrics_strict",
  "status": "active"
}
```

## 43. Quality result contract

```json
{
  "dataset_id": "suburb_market_metrics",
  "dataset_version": "2026.08.02",
  "overall_score": "0.95",
  "dimensions": {
    "completeness": "0.98",
    "validity": "0.97",
    "uniqueness": "1.00",
    "timeliness": "0.90",
    "coverage": "0.89"
  },
  "critical_failures": [],
  "warnings": [],
  "evaluated_at": "2026-08-02T09:00:00Z"
}
```

## 44. Compatibility and deprecation

Backward-compatible changes include adding optional fields and new endpoints.

Breaking changes include removing fields, changing types or meaning, changing money representation, or changing ID types.

Deprecated contracts must include a deprecation date, replacement, removal date, migration guide, and affected consumers.

## 45. Contract testing

Required:

- OpenAPI validation;
- JSON Schema validation;
- producer tests;
- consumer tests;
- generated client tests;
- event compatibility tests;
- stable error-code tests;
- idempotency tests;
- money and date tests;
- optional-field tests;
- unknown-enum handling tests.

## 46. Generated clients

Generate:

- frontend backend client;
- backend AI client;
- event models;
- shared enums where appropriate.

Generated code records contract version, generation timestamp, and source schema.

## 47. Shared enums

Potential shared enums:

```text
property_type
loan_type
rate_type
recommendation_status
ai_execution_status
communication_status
freshness_status
priority
confidence_label
```

Consumers must safely handle unknown values.

## 48. Security rules

Contracts must not expose service-role keys, provider keys, internal connection strings, permanent signed URLs, hidden chain-of-thought, unrestricted storage paths, raw restricted provider data, stack traces, or database internals.

## 49. Documentation requirements

Every contract must include purpose, producer, consumers, version, schema, examples, errors, security, idempotency, compatibility, and ownership.

## 50. Codex rules

Codex must:

1. create OpenAPI source documents;
2. create event JSON Schemas;
3. generate clients where practical;
4. validate contracts in CI;
5. add contract tests;
6. preserve stable error codes;
7. use decimal strings for money;
8. use ISO-8601 dates;
9. use UUIDs;
10. propagate trace IDs;
11. enforce idempotency on selected operations;
12. never include secrets in schemas or examples;
13. version breaking changes;
14. document deprecations;
15. update contracts with every API or event change.

## 51. Definition of done

Shared contracts are complete when:

- backend OpenAPI is versioned;
- AI platform OpenAPI is versioned;
- event schemas exist;
- errors are standardised;
- pagination is consistent;
- money, rates, dates, and IDs are consistent;
- AI execution contracts are defined;
- recommendations include evidence and confidence;
- freshness is represented;
- communication approval is explicit;
- events are idempotent;
- webhook normalization is defined;
- contract tests pass;
- generated clients build;
- breaking changes are versioned;
- all four projects reference the same contract sources.

## 52. Final principle

TrackMyProps services must never rely on:

```text
“It probably returns something like this.”
```

Every important interaction requires a documented, versioned, validated contract that both producer and consumer understand.
