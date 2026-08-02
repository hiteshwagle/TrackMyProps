# TrackMyProps API Design

## 1. Purpose

This document defines the API design for TrackMyProps.

It covers:

- public backend APIs used by frontend clients;
- internal backend APIs used by AI and data services;
- authentication and authorisation;
- resource naming;
- request and response conventions;
- pagination, sorting, filtering, and search;
- errors;
- idempotency;
- optimistic concurrency;
- asynchronous jobs;
- AI execution APIs;
- property, portfolio, finance, scenario, listing, communication, document, notification, learning, and billing endpoints;
- internal tool APIs;
- webhook endpoints;
- API versioning;
- OpenAPI generation;
- security and testing requirements.

The API must remain consistent with:

```text
contracts.md
security.md
database.md
calculation-specification.md
agent-catalogue.md
testing-strategy.md
```

---

# 2. API boundaries

TrackMyProps has three principal API surfaces.

## 2.1 Public backend API

Used by:

- Expo mobile application;
- web application;
- approved future partner clients.

Base path:

```text
/api/v1
```

The public backend API owns:

- authentication context;
- household authorisation;
- property and portfolio data;
- financial records;
- scenarios;
- AI execution requests;
- recommendations;
- communications;
- documents;
- notifications;
- user preferences;
- learning progress;
- billing and entitlements.

## 2.2 Internal AI platform API

Used by the backend.

The AI platform should not be called directly by the frontend.

Base path:

```text
/internal/v1
```

It owns:

- agent execution;
- execution status;
- execution cancellation;
- registry information;
- health;
- readiness;
- internal evaluation and administration where approved.

## 2.3 Internal backend tool API

Used by the AI and data platforms.

Base path:

```text
/internal/v1/tools
```

It exposes narrowly scoped tools for:

- authorised reads;
- deterministic calculations;
- recommendation persistence;
- communication draft persistence;
- event publication;
- dataset notification.

It must not expose unrestricted database or SQL access.

---

# 3. Base URLs

Suggested production domains:

```text
https://api.trackmyprops.com.au/api/v1
```

The AI platform should remain internal where possible.

Development and staging use separate URLs.

Do not hardcode URLs in clients.

---

# 4. API design principles

1. Use nouns for resources.
2. Use HTTP methods consistently.
3. Use stable, versioned contracts.
4. Require authentication by default.
5. Authorise every resource.
6. Use UUID identifiers.
7. Use ISO-8601 dates and timestamps.
8. Represent money as decimal strings with currency.
9. Use asynchronous execution for long-running AI and report operations.
10. Use idempotency for consequential or expensive operations.
11. Use optimistic concurrency for editable resources.
12. Return stable error codes.
13. Avoid exposing database structure directly.
14. Avoid action-heavy RPC endpoints unless the operation is not naturally resource-oriented.
15. Generate and publish OpenAPI specifications.

---

# 5. HTTP method conventions

```text
GET     retrieve a resource or collection
POST    create a resource or initiate an operation
PATCH   partially update a resource
PUT     fully replace a resource only where appropriate
DELETE  delete or request deletion
```

Use `POST` for commands such as:

```text
send
approve
cancel
recalculate
archive
restore
```

These actions should be modelled as sub-resources or explicit commands.

---

# 6. Naming conventions

Use:

```text
kebab-case in URLs
snake_case in JSON
plural resource names
```

Examples:

```text
/properties
/portfolio-snapshots
/communication-drafts
/ai-executions
```

Avoid verbs in top-level resource names.

---

# 7. Authentication

Public API:

```text
Authorization: Bearer <supabase_access_token>
```

Internal API:

```text
Authorization: Bearer <service_identity_token>
```

Optional headers:

```text
X-Request-ID
X-Trace-ID
X-Idempotency-Key
X-Household-ID
X-Client-Version
X-App-Platform
X-App-Build
```

The backend must not trust `X-Household-ID` without verifying membership.

---

# 8. Standard response metadata

Collection response:

```json
{
  "items": [],
  "pagination": {},
  "meta": {
    "request_id": "uuid",
    "trace_id": "uuid",
    "generated_at": "2026-08-02T10:00:00Z"
  }
}
```

Single-resource responses may return the resource directly with trace headers, or use a consistent envelope.

The selected convention must be applied consistently.

---

# 9. Error response

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

Validation error:

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

---

# 10. Pagination

## Page-based

```text
?page=1&page_size=25
```

Use for:

- small user collections;
- property lists;
- notifications;
- learning modules.

## Cursor-based

```text
?cursor=<opaque>&limit=50
```

Use for:

- event streams;
- AI execution events;
- audit feeds;
- large history tables;
- listing feeds.

---

# 11. Filtering

Examples:

```text
?status=active
?property_id=<uuid>
?from_date=2026-01-01
?to_date=2026-08-02
?property_type=house
?state=NSW
?suburb=Sydney
```

Only approved filter fields are allowed.

Unknown filters should be rejected or safely ignored according to documented policy.

---

# 12. Sorting

Example:

```text
?sort=created_at&order=desc
```

Allow only approved fields.

Do not pass raw sort expressions to SQL.

---

# 13. Search

Search endpoint:

```text
GET /search
```

Potential query:

```text
?q=parramatta&type=property,suburb,listing
```

Search must:

- respect permissions;
- not expose private resources;
- use bounded result sizes;
- identify result type;
- return match reason where helpful.

---

# 14. Idempotency

Required for:

- AI execution creation;
- communication sending;
- scenario generation if expensive;
- report generation;
- payment operations;
- selected imports.

Header:

```text
X-Idempotency-Key
```

The same key with a different request body must return a conflict.

---

# 15. Optimistic concurrency

Editable resources should include:

```text
record_version
```

PATCH request:

```json
{
  "record_version": 3,
  "weekly_rent": {
    "amount": "650.00",
    "currency": "AUD"
  }
}
```

Conflict:

```text
409 RECORD_VERSION_CONFLICT
```

---

# 16. Health endpoints

Public backend:

```text
GET /health
GET /ready
```

Internal AI:

```text
GET /internal/v1/health
GET /internal/v1/ready
```

Health must not expose secrets, dependency credentials, or internal topology.

---

# 17. Current user API

## Retrieve profile

```text
GET /api/v1/me
```

## Update profile

```text
PATCH /api/v1/me
```

## Retrieve preferences

```text
GET /api/v1/me/preferences
```

## Update preferences

```text
PATCH /api/v1/me/preferences
```

## List sessions where supported

```text
GET /api/v1/me/sessions
```

## Revoke session

```text
DELETE /api/v1/me/sessions/{session_id}
```

## Export account data

```text
POST /api/v1/me/exports
```

## Request account deletion

```text
POST /api/v1/me/deletion-requests
```

---

# 18. Household API

## List households

```text
GET /api/v1/households
```

## Create household

```text
POST /api/v1/households
```

## Retrieve household

```text
GET /api/v1/households/{household_id}
```

## Update household

```text
PATCH /api/v1/households/{household_id}
```

## List members

```text
GET /api/v1/households/{household_id}/members
```

## Invite member

```text
POST /api/v1/households/{household_id}/invitations
```

## Update member role

```text
PATCH /api/v1/households/{household_id}/members/{member_id}
```

## Remove member

```text
DELETE /api/v1/households/{household_id}/members/{member_id}
```

---

# 19. Property API

## List properties

```text
GET /api/v1/properties
```

Filters:

```text
household_id
ownership_status
property_type
state
suburb
```

## Create property

```text
POST /api/v1/properties
```

## Retrieve property

```text
GET /api/v1/properties/{property_id}
```

## Update property

```text
PATCH /api/v1/properties/{property_id}
```

## Archive property

```text
POST /api/v1/properties/{property_id}/archive
```

## Restore property

```text
POST /api/v1/properties/{property_id}/restore
```

## Delete property

```text
DELETE /api/v1/properties/{property_id}
```

Deletion may create a protected asynchronous deletion request rather than immediately deleting all records.

---

# 20. Property acquisition API

## Retrieve acquisition

```text
GET /api/v1/properties/{property_id}/acquisition
```

## Create or update acquisition

```text
PUT /api/v1/properties/{property_id}/acquisition
```

Fields may include:

```text
purchase_price
contract_date
settlement_date
deposit
stamp_duty
legal_fees
buyers_agent_fees
inspection_fees
other_acquisition_costs
```

---

# 21. Ownership API

## List ownership records

```text
GET /api/v1/properties/{property_id}/ownership
```

## Create ownership record

```text
POST /api/v1/properties/{property_id}/ownership
```

## Update ownership record

```text
PATCH /api/v1/properties/{property_id}/ownership/{ownership_id}
```

## Delete ownership record

```text
DELETE /api/v1/properties/{property_id}/ownership/{ownership_id}
```

Ownership percentages must be validated.

---

# 22. Loan API

## List property loans

```text
GET /api/v1/properties/{property_id}/loans
```

## Create loan

```text
POST /api/v1/properties/{property_id}/loans
```

## Retrieve loan

```text
GET /api/v1/loans/{loan_id}
```

## Update loan

```text
PATCH /api/v1/loans/{loan_id}
```

## Delete loan

```text
DELETE /api/v1/loans/{loan_id}
```

## List loan-rate history

```text
GET /api/v1/loans/{loan_id}/rate-history
```

## Add rate record

```text
POST /api/v1/loans/{loan_id}/rate-history
```

## Retrieve repayment estimate

```text
GET /api/v1/loans/{loan_id}/repayment-estimate
```

## Retrieve amortisation schedule

```text
GET /api/v1/loans/{loan_id}/amortisation
```

Query parameters may include:

```text
from_date
to_date
rate_override
```

---

# 23. Offset and redraw API

## Retrieve offset account

```text
GET /api/v1/loans/{loan_id}/offset
```

## Update offset balance

```text
PATCH /api/v1/loans/{loan_id}/offset
```

## Retrieve redraw

```text
GET /api/v1/loans/{loan_id}/redraw
```

## Update redraw availability

```text
PATCH /api/v1/loans/{loan_id}/redraw
```

Offset and redraw must remain distinct resources or fields.

---

# 24. Income API

## List income records

```text
GET /api/v1/properties/{property_id}/income
```

## Create income record

```text
POST /api/v1/properties/{property_id}/income
```

## Retrieve income record

```text
GET /api/v1/income/{income_id}
```

## Update income record

```text
PATCH /api/v1/income/{income_id}
```

## Delete income record

```text
DELETE /api/v1/income/{income_id}
```

---

# 25. Expense API

## List expenses

```text
GET /api/v1/properties/{property_id}/expenses
```

Filters:

```text
category
from_date
to_date
recurring
capital_or_operating
```

## Create expense

```text
POST /api/v1/properties/{property_id}/expenses
```

## Retrieve expense

```text
GET /api/v1/expenses/{expense_id}
```

## Update expense

```text
PATCH /api/v1/expenses/{expense_id}
```

## Delete expense

```text
DELETE /api/v1/expenses/{expense_id}
```

---

# 26. Lease API

## List leases

```text
GET /api/v1/properties/{property_id}/leases
```

## Create lease

```text
POST /api/v1/properties/{property_id}/leases
```

## Retrieve lease

```text
GET /api/v1/leases/{lease_id}
```

## Update lease

```text
PATCH /api/v1/leases/{lease_id}
```

## End lease

```text
POST /api/v1/leases/{lease_id}/end
```

## Add rent-review record

```text
POST /api/v1/leases/{lease_id}/rent-reviews
```

---

# 27. Valuation API

## List valuations

```text
GET /api/v1/properties/{property_id}/valuations
```

## Create valuation

```text
POST /api/v1/properties/{property_id}/valuations
```

## Retrieve valuation

```text
GET /api/v1/valuations/{valuation_id}
```

## Update valuation

```text
PATCH /api/v1/valuations/{valuation_id}
```

## Select preferred valuation

```text
POST /api/v1/properties/{property_id}/valuations/{valuation_id}/select
```

## Request external valuation estimate

```text
POST /api/v1/properties/{property_id}/valuation-requests
```

This may return `202 Accepted`.

---

# 28. Property financial summary API

## Current summary

```text
GET /api/v1/properties/{property_id}/financial-summary
```

## Historical snapshots

```text
GET /api/v1/properties/{property_id}/financial-snapshots
```

## Recalculate

```text
POST /api/v1/properties/{property_id}/financial-recalculations
```

Recalculation should be idempotent for the same input version.

---

# 29. Portfolio API

## Portfolio summary

```text
GET /api/v1/portfolio
```

## Portfolio financial summary

```text
GET /api/v1/portfolio/financial-summary
```

## Portfolio performance

```text
GET /api/v1/portfolio/performance
```

## Portfolio risk summary

```text
GET /api/v1/portfolio/risks
```

## Portfolio snapshots

```text
GET /api/v1/portfolio/snapshots
```

## Portfolio recalculation

```text
POST /api/v1/portfolio/recalculations
```

---

# 30. Calculation API

Most calculations should be exposed through resource summaries and scenarios.

Where direct calculation endpoints are needed:

```text
POST /api/v1/calculations/loan-repayment
POST /api/v1/calculations/sale-proceeds
POST /api/v1/calculations/refinance
POST /api/v1/calculations/yield
```

These endpoints must:

- use deterministic calculation services;
- return formula version;
- return inputs and assumptions;
- never persist unless explicitly requested.

---

# 31. Scenario API

## List scenarios

```text
GET /api/v1/scenarios
```

## Create scenario

```text
POST /api/v1/scenarios
```

Types:

```text
hold
sell
refinance
sell_and_repay_loan
purchase
interest_rate_sensitivity
vacancy_sensitivity
sale_price_sensitivity
```

## Retrieve scenario

```text
GET /api/v1/scenarios/{scenario_id}
```

## Update scenario assumptions

```text
PATCH /api/v1/scenarios/{scenario_id}
```

## Run scenario

```text
POST /api/v1/scenarios/{scenario_id}/runs
```

## List runs

```text
GET /api/v1/scenarios/{scenario_id}/runs
```

## Compare scenarios

```text
POST /api/v1/scenario-comparisons
```

## Delete scenario

```text
DELETE /api/v1/scenarios/{scenario_id}
```

---

# 32. Suburb and market-data API

## Search geography

```text
GET /api/v1/geographies/search
```

## Retrieve geography

```text
GET /api/v1/geographies/{geography_id}
```

## Demographics

```text
GET /api/v1/geographies/{geography_id}/demographics
```

## Market metrics

```text
GET /api/v1/geographies/{geography_id}/market-metrics
```

Filters:

```text
property_type
bedrooms
period
```

## Rental metrics

```text
GET /api/v1/geographies/{geography_id}/rental-metrics
```

## Schools

```text
GET /api/v1/geographies/{geography_id}/schools
```

## Crime

```text
GET /api/v1/geographies/{geography_id}/crime
```

## Infrastructure

```text
GET /api/v1/geographies/{geography_id}/infrastructure
```

## Planning

```text
GET /api/v1/geographies/{geography_id}/planning
```

## Hazards

```text
GET /api/v1/geographies/{geography_id}/hazards
```

## Compare geographies

```text
POST /api/v1/geography-comparisons
```

All responses should include freshness and source metadata.

---

# 33. Comparable-property API

## Sales comparables

```text
GET /api/v1/properties/{property_id}/comparable-sales
```

## Rental comparables

```text
GET /api/v1/properties/{property_id}/rental-comparables
```

Filters:

```text
radius_km
from_date
property_type
bedrooms
bathrooms
```

Provider rights may restrict export and display.

---

# 34. Watchlist API

## List watchlists

```text
GET /api/v1/watchlists
```

## Create watchlist

```text
POST /api/v1/watchlists
```

## Retrieve watchlist

```text
GET /api/v1/watchlists/{watchlist_id}
```

## Update watchlist

```text
PATCH /api/v1/watchlists/{watchlist_id}
```

## Delete watchlist

```text
DELETE /api/v1/watchlists/{watchlist_id}
```

## Retrieve matches

```text
GET /api/v1/watchlists/{watchlist_id}/matches
```

---

# 35. Listing API

## List matched listings

```text
GET /api/v1/listings
```

Filters:

```text
watchlist_id
status
suburb
property_type
min_price
max_price
```

## Retrieve listing

```text
GET /api/v1/listings/{listing_id}
```

## Retrieve listing history

```text
GET /api/v1/listings/{listing_id}/history
```

## Shortlist listing

```text
POST /api/v1/listings/{listing_id}/shortlist
```

## Remove from shortlist

```text
DELETE /api/v1/listings/{listing_id}/shortlist
```

## Reject listing

```text
POST /api/v1/listings/{listing_id}/rejections
```

## Request listing analysis

```text
POST /api/v1/listings/{listing_id}/analysis-requests
```

---

# 36. AI execution API

## Create execution

```text
POST /api/v1/ai-executions
```

## List executions

```text
GET /api/v1/ai-executions
```

## Retrieve execution

```text
GET /api/v1/ai-executions/{execution_id}
```

## Retrieve execution events

```text
GET /api/v1/ai-executions/{execution_id}/events
```

Use cursor pagination.

## Cancel execution

```text
POST /api/v1/ai-executions/{execution_id}/cancel
```

## Retry execution

```text
POST /api/v1/ai-executions/{execution_id}/retries
```

## Submit required input

```text
POST /api/v1/ai-executions/{execution_id}/inputs
```

The frontend should not call AI platform endpoints directly.

---

# 37. Recommendation API

## List recommendations

```text
GET /api/v1/recommendations
```

Filters:

```text
status
type
priority
property_id
created_from
created_to
```

## Retrieve recommendation

```text
GET /api/v1/recommendations/{recommendation_id}
```

## Acknowledge

```text
POST /api/v1/recommendations/{recommendation_id}/acknowledgements
```

## Dismiss

```text
POST /api/v1/recommendations/{recommendation_id}/dismissals
```

## Mark completed

```text
POST /api/v1/recommendations/{recommendation_id}/completions
```

## Provide feedback

```text
POST /api/v1/recommendations/{recommendation_id}/feedback
```

---

# 38. Briefing API

## List briefings

```text
GET /api/v1/briefings
```

## Retrieve briefing

```text
GET /api/v1/briefings/{briefing_id}
```

## Generate briefing

```text
POST /api/v1/briefing-requests
```

## Update briefing preferences

```text
PATCH /api/v1/me/briefing-preferences
```

---

# 39. Communication draft API

## List drafts

```text
GET /api/v1/communication-drafts
```

## Create draft

```text
POST /api/v1/communication-drafts
```

## Retrieve draft

```text
GET /api/v1/communication-drafts/{draft_id}
```

## Update draft

```text
PATCH /api/v1/communication-drafts/{draft_id}
```

## Approve draft

```text
POST /api/v1/communication-drafts/{draft_id}/approvals
```

## Send draft

```text
POST /api/v1/communication-drafts/{draft_id}/send
```

Sending requires:

- valid approval;
- confirmed recipient;
- idempotency key;
- rate limit;
- audit.

## Cancel draft

```text
POST /api/v1/communication-drafts/{draft_id}/cancel
```

---

# 40. Communication-message API

## List sent messages

```text
GET /api/v1/communication-messages
```

## Retrieve message

```text
GET /api/v1/communication-messages/{message_id}
```

## Delivery events

```text
GET /api/v1/communication-messages/{message_id}/events
```

---

# 41. Document API

## List documents

```text
GET /api/v1/documents
```

Filters:

```text
property_id
document_type
processing_status
```

## Create signed upload

```text
POST /api/v1/document-uploads
```

## Complete upload

```text
POST /api/v1/document-uploads/{upload_id}/complete
```

## Retrieve document

```text
GET /api/v1/documents/{document_id}
```

## Create signed download

```text
POST /api/v1/documents/{document_id}/download-requests
```

## Request analysis

```text
POST /api/v1/documents/{document_id}/analysis-requests
```

## Retrieve analysis

```text
GET /api/v1/documents/{document_id}/analyses
```

## Delete document

```text
DELETE /api/v1/documents/{document_id}
```

---

# 42. Inspection API

## List inspections

```text
GET /api/v1/properties/{property_id}/inspections
```

## Create inspection

```text
POST /api/v1/properties/{property_id}/inspections
```

## Retrieve inspection

```text
GET /api/v1/inspections/{inspection_id}
```

## Update inspection

```text
PATCH /api/v1/inspections/{inspection_id}
```

## Add finding

```text
POST /api/v1/inspections/{inspection_id}/findings
```

## Add media

```text
POST /api/v1/inspections/{inspection_id}/media
```

---

# 43. Maintenance API

## List maintenance requests

```text
GET /api/v1/properties/{property_id}/maintenance-requests
```

## Create maintenance request

```text
POST /api/v1/properties/{property_id}/maintenance-requests
```

## Retrieve maintenance request

```text
GET /api/v1/maintenance-requests/{request_id}
```

## Update maintenance request

```text
PATCH /api/v1/maintenance-requests/{request_id}
```

## Add status event

```text
POST /api/v1/maintenance-requests/{request_id}/status-events
```

---

# 44. Property manager API

## Retrieve property manager

```text
GET /api/v1/properties/{property_id}/property-manager
```

## Create or update property manager

```text
PUT /api/v1/properties/{property_id}/property-manager
```

## Retrieve management agreement

```text
GET /api/v1/properties/{property_id}/management-agreement
```

## Update management agreement

```text
PUT /api/v1/properties/{property_id}/management-agreement
```

---

# 45. Learning API

## List learning paths

```text
GET /api/v1/learning-paths
```

## Retrieve learning path

```text
GET /api/v1/learning-paths/{path_id}
```

## Retrieve module

```text
GET /api/v1/learning-modules/{module_id}
```

## Start lesson

```text
POST /api/v1/learning-lessons/{lesson_id}/attempts
```

## Submit quiz

```text
POST /api/v1/learning-attempts/{attempt_id}/answers
```

## Retrieve progress

```text
GET /api/v1/me/learning-progress
```

## Request tutor session

```text
POST /api/v1/tutor-sessions
```

---

# 46. Notification API

## List notifications

```text
GET /api/v1/notifications
```

## Mark read

```text
POST /api/v1/notifications/{notification_id}/read
```

## Mark unread

```text
POST /api/v1/notifications/{notification_id}/unread
```

## Delete notification

```text
DELETE /api/v1/notifications/{notification_id}
```

## Register device

```text
POST /api/v1/devices
```

## Remove device

```text
DELETE /api/v1/devices/{device_id}
```

## Notification preferences

```text
GET /api/v1/me/notification-preferences
PATCH /api/v1/me/notification-preferences
```

---

# 47. Billing and entitlement API

## Retrieve subscription

```text
GET /api/v1/me/subscription
```

## Retrieve entitlements

```text
GET /api/v1/me/entitlements
```

## Create checkout session

```text
POST /api/v1/billing/checkout-sessions
```

## Create customer portal session

```text
POST /api/v1/billing/portal-sessions
```

## Retrieve usage

```text
GET /api/v1/me/usage
```

The backend remains authoritative for feature access.

---

# 48. Audit API

Users may be allowed to retrieve selected household audit history.

```text
GET /api/v1/audit-events
```

Filters:

```text
resource_type
resource_id
action
from_date
to_date
```

Administrative security logs must not be exposed through the normal user API.

---

# 49. Internal AI execution API

Used by backend only.

## Start execution

```text
POST /internal/v1/executions
```

## Retrieve execution

```text
GET /internal/v1/executions/{execution_id}
```

## Cancel execution

```text
POST /internal/v1/executions/{execution_id}/cancel
```

## Registry

```text
GET /internal/v1/agents
GET /internal/v1/agents/{agent_id}
```

## Evaluation status

```text
GET /internal/v1/agents/{agent_id}/evaluation-status
```

Production access to registry administration must be restricted.

---

# 50. Internal backend tool API

All tools require service identity and household or resource scope.

Potential endpoints:

```text
POST /internal/v1/tools/get-property-context
POST /internal/v1/tools/get-portfolio-context
POST /internal/v1/tools/get-financial-summary
POST /internal/v1/tools/get-suburb-data
POST /internal/v1/tools/get-market-data
POST /internal/v1/tools/get-comparable-sales
POST /internal/v1/tools/get-risk-data
POST /internal/v1/tools/calculate-yield
POST /internal/v1/tools/calculate-cash-flow
POST /internal/v1/tools/calculate-lvr
POST /internal/v1/tools/calculate-sale-scenario
POST /internal/v1/tools/calculate-refinance-scenario
POST /internal/v1/tools/persist-recommendation
POST /internal/v1/tools/create-communication-draft
POST /internal/v1/tools/persist-briefing
POST /internal/v1/tools/persist-learning-progress
```

Each tool must:

- have a strict schema;
- enforce scope;
- expose minimal data;
- have a timeout;
- be auditable;
- avoid arbitrary query capability.

---

# 51. Data-platform internal API

Potential endpoints:

```text
POST /internal/v1/data-events
POST /internal/v1/dataset-publications
POST /internal/v1/dataset-quality-events
POST /internal/v1/cache-invalidations
```

The data platform should generally publish events rather than directly mutate backend domain tables.

---

# 52. Webhook endpoints

Potential endpoints:

```text
POST /webhooks/sendgrid
POST /webhooks/stripe
POST /webhooks/revenuecat
POST /webhooks/property-provider/{provider}
```

Requirements:

- signature verification;
- replay protection;
- idempotency;
- safe acknowledgement;
- event storage;
- schema validation;
- no authentication by query-string secret alone.

---

# 53. Asynchronous operations

Long-running operations should return:

```text
202 Accepted
```

Example:

```json
{
  "job_id": "uuid",
  "status": "queued",
  "status_url": "/api/v1/jobs/uuid"
}
```

Potential asynchronous resources:

```text
ai-executions
report-jobs
valuation-requests
document-analysis-requests
exports
deletion-requests
portfolio-recalculations
```

---

# 54. Generic job API

## Retrieve job

```text
GET /api/v1/jobs/{job_id}
```

## Cancel job

```text
POST /api/v1/jobs/{job_id}/cancel
```

Possible statuses:

```text
queued
running
waiting
succeeded
partially_succeeded
failed
cancelled
expired
```

---

# 55. Realtime updates

The frontend may receive updates through Supabase Realtime or another approved mechanism.

Potential channels:

```text
ai_execution_events
notifications
recommendations
communication_messages
portfolio_updates
```

Realtime payloads must be minimal and authorised.

The client should re-fetch authoritative resources after material events where appropriate.

---

# 56. Data freshness metadata

Data-driven responses should include:

```json
{
  "data_freshness": [
    {
      "source_name": "Suburb Market Metrics",
      "effective_date": "2026-07-01",
      "published_at": "2026-07-15T00:00:00Z",
      "dataset_version": "2026.07.15",
      "freshness_status": "current",
      "quality_score": "0.94"
    }
  ]
}
```

---

# 57. Field selection and expansion

Where useful:

```text
?fields=id,address,property_type
?include=financial_summary,preferred_valuation
```

Only approved expansions are supported.

Avoid arbitrary nested graph expansion.

---

# 58. Bulk operations

Bulk endpoints should be rare and bounded.

Examples:

```text
POST /api/v1/expenses/bulk
POST /api/v1/property-imports
```

Requirements:

- maximum item count;
- item-level errors;
- idempotency;
- transaction policy;
- partial-success policy;
- asynchronous execution for large imports.

---

# 59. Export API

Potential exports:

```text
portfolio
property
financial transactions
documents
recommendations
account data
```

Flow:

```text
POST /api/v1/exports
GET /api/v1/exports/{export_id}
POST /api/v1/exports/{export_id}/download-requests
```

Downloads must use short-lived signed URLs.

---

# 60. Rate limiting

Apply limits by:

- user;
- household;
- IP;
- route;
- subscription tier;
- operation type.

Stricter limits for:

```text
authentication
AI execution
document upload
communication send
exports
search
billing
webhooks
```

Return:

```text
429 Too Many Requests
Retry-After
```

---

# 61. Caching

Public API caching rules:

- private user responses are not publicly cacheable;
- use ETag where useful;
- support `If-None-Match`;
- do not cache permission-sensitive responses across users;
- respect provider data caching terms;
- include data version where relevant.

---

# 62. API versioning

Initial version:

```text
v1
```

Backward-compatible changes include:

- adding optional fields;
- adding endpoints;
- adding safe enum values where consumers handle unknown values.

Breaking changes require:

```text
v2
```

Deprecation must include:

- date;
- replacement;
- migration guide;
- removal date.

---

# 63. OpenAPI

Generate:

```text
contracts/openapi/backend-v1.yaml
contracts/openapi/ai-platform-v1.yaml
```

Requirements:

- schemas;
- examples;
- errors;
- security definitions;
- pagination;
- idempotency;
- deprecation;
- operation IDs;
- tags.

Frontend clients should be generated where practical.

---

# 64. Operation ID conventions

Examples:

```text
listProperties
createProperty
getProperty
updateProperty
createAiExecution
getAiExecution
approveCommunicationDraft
sendCommunicationDraft
```

Operation IDs must remain stable.

---

# 65. API security requirements

Every protected endpoint must:

- authenticate;
- authorise;
- validate;
- rate limit where needed;
- redact logs;
- return safe errors;
- propagate trace IDs;
- create audit events for sensitive actions.

Internal APIs must:

- validate service identity;
- validate audience;
- enforce allowlisted callers;
- avoid unrestricted query access.

---

# 66. API testing requirements

Required:

- schema validation;
- authentication;
- authorisation;
- RLS;
- happy path;
- validation errors;
- not found;
- conflict;
- idempotency;
- optimistic concurrency;
- rate limit;
- cross-household denial;
- provider failure;
- pagination;
- unknown enum handling;
- backward compatibility.

---

# 67. API documentation

Maintain:

```text
docs/api/
├── overview.md
├── authentication.md
├── errors.md
├── pagination.md
├── idempotency.md
├── webhooks.md
├── public-api.md
├── internal-ai-api.md
├── internal-tools-api.md
└── examples/
```

---

# 68. Codex rules

Codex must:

1. define endpoints in OpenAPI;
2. keep route structure consistent;
3. enforce authentication and authorisation;
4. use UUIDs;
5. use decimal strings for money;
6. use ISO-8601 timestamps;
7. implement stable error codes;
8. implement idempotency;
9. implement optimistic concurrency;
10. use asynchronous jobs for long operations;
11. keep AI platform private from frontend;
12. expose only narrow internal tools;
13. add contract tests;
14. generate clients where practical;
15. update API documentation with every route change.

---

# 69. Definition of done

The API design is complete when:

- public and internal API boundaries are clear;
- all major resources have endpoint definitions;
- authentication and authorisation are defined;
- errors are stable;
- pagination and filtering are consistent;
- idempotency is applied;
- optimistic concurrency is supported;
- long-running operations are asynchronous;
- AI executions are traceable;
- communication approval and send are separate;
- data freshness is included;
- internal tools are narrow and authorised;
- webhooks are secure;
- OpenAPI specifications exist;
- generated clients build;
- contract and security tests pass.

---

# 70. Final API principle

Every TrackMyProps API operation must make clear:

```text
Who may call it?
Which resource does it act on?
What input is accepted?
What output is returned?
What can fail?
Is it idempotent?
Is it synchronous or asynchronous?
Does it create a side effect?
How is it audited?
How is it versioned?
```

An endpoint without clear answers to those questions is not ready for production.
