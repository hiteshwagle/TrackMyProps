# TrackMyProps Database Architecture

## 1. Purpose

This document defines the target Supabase PostgreSQL architecture for TrackMyProps across the frontend, backend, AI platform, and data platform.

The database must support:

- users, households, roles, and permissions;
- owned and watched properties;
- ownership structures, acquisitions, loans, income, expenses, leases, valuations, inspections, and documents;
- portfolio calculations, snapshots, benchmarks, and scenarios;
- AI agents, prompts, executions, caches, conversations, recommendations, and evaluations;
- public and licensed datasets, historical observations, quality, lineage, and publishing;
- expressions of interest, approvals, outbound communications, notifications, subscriptions, and audit trails;
- row-level security, least-privilege service roles, reliable migrations, retention, backup, and recovery.

The design prioritises integrity, security, historical preservation, clear ownership, auditability, reproducibility, scalability, and explainability.

---

## 2. Technology and extensions

Use:

- Supabase PostgreSQL as the primary relational database;
- SQLAlchemy 2 for persistence access;
- Alembic for schema migrations;
- PostGIS for geography and spatial queries;
- pgvector only where embeddings or retrieval require it;
- row-level security for frontend-accessible records;
- database constraints for authoritative integrity;
- views and materialized views for approved read models.

Potential extensions:

```sql
create extension if not exists pgcrypto;
create extension if not exists postgis;
create extension if not exists vector;
create extension if not exists citext;
```

Every enabled extension must have a documented purpose.

---

## 3. Schema ownership

Recommended schemas:

```text
auth
public
backend
audit
ai
data_registry
raw_metadata
staging
canonical
curated
quality
lineage
operations
```

| Schema | Owner and purpose |
|---|---|
| `auth` | Supabase Auth identities |
| `public` | Minimal frontend-safe views and functions |
| `backend` | User, property, financial, portfolio, approval, billing, and notification records |
| `audit` | Append-only business and security events |
| `ai` | AI agents, prompts, executions, cache, memory, checkpoints, and evaluation |
| `data_registry` | Sources, licences, datasets, pipeline definitions, and versions |
| `raw_metadata` | Metadata for immutable raw artefacts stored in object storage |
| `staging` | Temporary ingestion and transformation tables |
| `canonical` | Source-aware normalised data |
| `curated` | Consumer-ready market, suburb, risk, and feature datasets |
| `quality` | Rules, results, anomaly records, and scores |
| `lineage` | Dataset, partition, aggregate, and record lineage |
| `operations` | Jobs, idempotency, outbox events, and processed-event tracking |

Rules:

- Each table has one owning service.
- The frontend never accesses staging, raw metadata, AI checkpoints, or internal audit data directly.
- The backend is the system of record for user and portfolio data.
- The AI platform cannot directly modify authoritative property, loan, expense, or approval records.
- The data platform does not access user financial data unless separately approved.

---

## 4. Global conventions

### 4.1 Primary keys

Use UUIDs:

```sql
id uuid primary key default gen_random_uuid()
```

### 4.2 Timestamps

Use timezone-aware UTC timestamps:

```text
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
deleted_at timestamptz null
```

Distinguish real-world effective time from ingestion time:

```text
effective_date
observed_at
published_at
ingested_at
created_at
```

### 4.3 Money

Use exact numeric types:

```text
numeric(18,2)
```

Include:

```text
currency_code char(3) not null default 'AUD'
```

Never use floating point for authoritative currency totals.

### 4.4 Rates

Store interest rates and ratios consistently, preferably as decimal values such as `0.0625` for 6.25%. Use `numeric(12,8)` or an explicitly approved precision.

### 4.5 Versions

Use explicit versions where behaviour or dependencies matter:

```text
record_version bigint
calculation_version text
dataset_version text
schema_version text
agent_version text
prompt_version text
model_policy_version text
```

### 4.6 JSONB

Use `jsonb` for flexible metadata, snapshots, provider payload references, and versioned structured outputs. Do not hide core relational fields inside JSON.

### 4.7 Soft deletion

Use `deleted_at` for recoverable business records. Transient execution and staging records may be physically deleted under retention policies.

---

## 5. Identity and households

### `backend.user_profiles`

Application profile linked one-to-one with `auth.users`.

```text
id
auth_user_id unique not null
display_name
first_name
last_name
preferred_name
phone
timezone default 'Australia/Sydney'
locale default 'en-AU'
default_currency default 'AUD'
onboarding_status
knowledge_level
risk_profile
investment_goal
created_at
updated_at
deleted_at
```

### `backend.households`

Shared investment context for one or more users.

```text
id
name
base_currency
timezone
created_by_user_id
record_version
created_at
updated_at
deleted_at
```

### `backend.household_members`

```text
id
household_id
user_profile_id
role
status
invited_at
joined_at
created_at
updated_at
```

Suggested roles:

```text
owner
admin
member
viewer
advisor
```

Constraint:

```text
unique(household_id, user_profile_id)
```

### `backend.user_preferences`

Stores notification, dashboard, communication-tone, accessibility, and learning preferences. Do not mix these with household investment strategy.

---

## 6. Properties and ownership

### `backend.properties`

```text
id
household_id
address_line_1
address_line_2
unit_number
street_number
street_name
street_type
suburb
state
postcode
country_code
latitude
longitude
property_type
bedrooms
bathrooms
car_spaces
land_area_sqm
building_area_sqm
year_built
external_property_id
canonical_property_id
ownership_status
acquisition_status
primary_residence_flag
notes
record_version
created_by_user_id
created_at
updated_at
deleted_at
```

Possible ownership status:

```text
owned
co_owned
watching
under_contract
previously_owned
```

### `backend.ownership_entities`

Supports company, trust, SMSF, and other legal structures.

```text
id
household_id
entity_type
legal_name
display_name
abn
acn
trust_name
trustee_name
notes
created_at
updated_at
deleted_at
```

Restrict sensitive legal identifiers.

### `backend.property_ownerships`

```text
id
property_id
owner_type
owner_user_profile_id
owner_entity_id
ownership_percentage
effective_from
effective_to
is_current
created_at
updated_at
```

Active ownership percentages should reconcile to 100%, allowing documented rounding tolerance.

### `backend.property_acquisitions`

```text
id
property_id
purchase_price
contract_date
settlement_date
deposit_amount
stamp_duty
conveyancing_fees
buyers_agent_fees
building_pest_fees
loan_application_fees
other_acquisition_costs
total_acquisition_cost
currency_code
source
created_at
updated_at
```

Total acquisition cost is calculated deterministically by the backend.

---

## 7. Loans and finance

### `backend.loans`

```text
id
household_id
property_id
lender_name
loan_account_reference_masked
loan_type
rate_type
interest_rate
original_principal
current_balance
available_redraw
offset_balance
repayment_amount
repayment_frequency
interest_only_flag
interest_only_end_date
fixed_rate_end_date
loan_start_date
maturity_date
remaining_term_months
lvr
currency_code
status
record_version
created_at
updated_at
deleted_at
```

Loan types may include principal-and-interest, interest-only, line of credit, construction, bridging, and other.

### `backend.loan_rate_history`

```text
id
loan_id
interest_rate
effective_from
effective_to
source
created_at
```

### `backend.loan_balance_history`

```text
id
loan_id
balance
offset_balance
available_redraw
observed_at
source
created_at
```

### `backend.loan_repayments`

```text
id
loan_id
payment_date
principal_component
interest_component
fees_component
total_amount
source
external_reference
created_at
```

### `backend.loan_facilities`

Supports cross-collateralised or multi-loan arrangements.

```text
id
household_id
facility_name
lender_name
facility_limit
current_drawn
currency_code
created_at
updated_at
```

### `backend.loan_security_properties`

```text
id
loan_id
property_id
security_type
effective_from
effective_to
created_at
```

### `backend.loan_scenarios`

Stores validated refinance, rate-change, additional-repayment, and restructuring scenarios.

---

## 8. Rental income and leases

### `backend.property_income_entries`

```text
id
property_id
income_type
amount
currency_code
period_start
period_end
received_date
frequency
source
external_reference
notes
created_at
updated_at
deleted_at
```

Income types may include rent, parking, storage, solar feed-in, reimbursement, grants, and other.

### `backend.rental_agreements`

```text
id
property_id
lease_start_date
lease_end_date
weekly_rent
bond_amount
payment_frequency
tenant_reference
property_manager_id
status
rent_review_date
vacate_date
created_at
updated_at
deleted_at
```

Store only the minimum tenant information required.

### `backend.rent_history`

```text
id
rental_agreement_id
weekly_rent
effective_from
effective_to
reason
created_at
```

### `backend.vacancy_periods`

```text
id
property_id
vacancy_start_date
vacancy_end_date
reason
estimated_lost_income
created_at
updated_at
```

---

## 9. Expenses and maintenance

### `backend.expense_categories`

Reference data for categories including council rates, water, strata, insurance, management, repairs, maintenance, gardening, pest control, smoke alarms, land tax, accounting, legal, utilities, advertising, leasing fees, cleaning, depreciation, interest, loan fees, renovation, capital improvements, and other.

### `backend.property_expense_entries`

```text
id
property_id
expense_category_id
amount
currency_code
expense_date
period_start
period_end
frequency
supplier_name
tax_deductible_flag
capital_expense_flag
recurring_flag
source
external_reference
notes
document_id
created_at
updated_at
deleted_at
```

The flags are user or adviser supplied and must not be represented as tax advice.

### `backend.recurring_expense_rules`

```text
id
property_id
expense_category_id
amount
frequency
next_due_date
end_date
supplier_name
auto_create_flag
is_active
created_at
updated_at
```

### `backend.maintenance_requests`

```text
id
property_id
title
description
priority
status
reported_at
completed_at
estimated_cost
actual_cost
supplier_name
document_id
created_at
updated_at
```

---

## 10. Valuation and portfolio performance

### `backend.property_valuations`

```text
id
property_id
valuation_type
valuation_amount
currency_code
valuation_date
source
source_reference
confidence_score
lower_bound
upper_bound
notes
created_at
```

Valuation types:

```text
user_estimate
automated_estimate
agent_appraisal
bank_valuation
certified_valuation
sale_price
```

Never overwrite valuation history.

### `backend.property_performance_snapshots`

```text
id
property_id
snapshot_date
estimated_value
loan_balance
equity
lvr
gross_yield
net_yield
annual_income
annual_expenses
annual_cash_flow
capital_growth_rate
total_return
calculation_version
input_version
created_at
```

### `backend.portfolio_performance_snapshots`

```text
id
household_id
snapshot_date
total_property_value
total_debt
total_equity
weighted_lvr
annual_income
annual_expenses
annual_cash_flow
portfolio_yield
liquidity_score
diversification_score
risk_score
health_score
calculation_version
created_at
```

### `backend.benchmark_comparisons`

```text
id
subject_type
subject_id
benchmark_type
benchmark_reference_id
metric_code
subject_value
benchmark_value
variance_value
variance_percent
effective_date
dataset_version
created_at
```

---

## 11. Scenario modelling

### `backend.scenarios`

```text
id
household_id
name
scenario_type
status
created_by_user_id
base_snapshot_date
calculation_version
created_at
updated_at
deleted_at
```

Scenario types:

```text
sell_property
hold_property
refinance
repay_loan
purchase_property
rate_change
rent_change
vacancy
renovation
income_change
retirement
job_loss
custom
```

### `backend.scenario_inputs`

```text
id
scenario_id
input_key
input_value_json
unit
source
created_at
updated_at
```

### `backend.scenario_results`

```text
id
scenario_id
result_type
result_payload
calculation_version
created_at
```

### `backend.scenario_comparisons`

Stores comparison summaries and links to the scenarios being compared. Prefer a join table if querying becomes complex.

---

## 12. Property management and inspections

### `backend.property_managers`

```text
id
household_id
company_name
contact_name
email
phone
licence_reference
website
notes
created_at
updated_at
deleted_at
```

### `backend.property_management_agreements`

```text
id
property_id
property_manager_id
agreement_start_date
agreement_end_date
management_fee_percent
leasing_fee
renewal_fee
inspection_frequency
notice_period_days
special_conditions
document_id
status
created_at
updated_at
```

### `backend.property_inspections`

```text
id
property_id
inspection_type
scheduled_at
completed_at
status
notes
created_by_user_id
created_at
updated_at
```

### `backend.inspection_findings`

```text
id
inspection_id
category
severity
description
recommended_action
estimated_cost
status
created_at
updated_at
```

### `backend.inspection_media`

```text
id
inspection_id
storage_object_id
media_type
caption
captured_at
latitude
longitude
created_at
```

---

## 13. Documents

### `backend.documents`

```text
id
household_id
property_id
document_type
file_name
storage_bucket
storage_path
mime_type
file_size_bytes
checksum
status
uploaded_by_user_id
uploaded_at
processed_at
retention_class
deleted_at
```

Document types may include contracts, strata reports, building and pest reports, loan statements, rental statements, council notices, insurance, leases, management agreements, valuations, depreciation schedules, invoices, and receipts.

### `backend.document_versions`

```text
id
document_id
version_number
storage_path
checksum
uploaded_by_user_id
created_at
```

### `backend.document_processing_jobs`

```text
id
document_id
processing_type
status
ai_execution_id
error_code
started_at
completed_at
created_at
```

Use signed, time-limited storage access. Do not expose permanent unrestricted URLs.

---

## 14. Watchlists, listings, and opportunities

### `backend.property_watchlists`

```text
id
household_id
name
description
criteria_json
is_active
created_by_user_id
created_at
updated_at
```

### `backend.listings`

```text
id
canonical_property_id
source_id
external_listing_id
listing_url
listing_status
listing_type
address_text
suburb
state
postcode
asking_price_min
asking_price_max
auction_date
listed_at
updated_at_source
withdrawn_at
sold_at
raw_reference
dataset_version
created_at
updated_at
```

Storage and exposure must comply with source licences.

### `backend.watchlist_matches`

```text
id
watchlist_id
listing_id
match_score
match_reasons
disqualifiers
confidence_score
status
created_at
updated_at
```

### `backend.listing_opportunities`

```text
id
household_id
listing_id
property_id
status
priority
assigned_user_id
notes
created_at
updated_at
```

---

## 15. Expressions of interest and communication

### `backend.communication_drafts`

```text
id
household_id
property_id
listing_id
communication_type
recipient_name
recipient_email
subject
body
status
ai_execution_id
draft_version
created_by_user_id
approved_by_user_id
approved_at
sent_at
created_at
updated_at
```

Statuses:

```text
draft
awaiting_review
approved
sending
sent
failed
cancelled
```

### `backend.communication_approvals`

```text
id
draft_id
approved_by_user_id
approved_subject
approved_body
recipient_email
approval_token_hash
approved_at
revoked_at
created_at
```

Approval records become immutable after send.

### `backend.communication_messages`

```text
id
draft_id
provider_message_id
direction
sender
recipient
subject
body_snapshot
sent_at
received_at
status
created_at
```

### `backend.communication_events`

Stores delivery, bounce, reply, failure, and provider events using redacted payloads.

The AI platform may draft content but cannot approve or send it.

---

## 16. Recommendations and user decisions

### `backend.recommendations`

```text
id
household_id
property_id
portfolio_scope_id
recommendation_type
subject_type
subject_id
summary
priority
confidence_score
confidence_label
evidence_json
assumptions_json
risks_json
alternatives_json
suggested_actions_json
data_freshness_json
ai_execution_id
agent_id
agent_version
prompt_version
model_metadata_json
status
expires_at
superseded_by_id
created_at
updated_at
```

Statuses:

```text
new
viewed
acknowledged
dismissed
saved
actioned
expired
superseded
```

### `backend.recommendation_decisions`

```text
id
recommendation_id
user_profile_id
decision
reason
notes
created_at
```

### `backend.recommendation_events`

Tracks lifecycle changes, reminders, expiry, and supersession.

---

## 17. Learning model

Recommended tables:

```text
backend.learning_profiles
backend.learning_paths
backend.learning_modules
backend.learning_progress
backend.quiz_attempts
backend.learning_concepts
backend.user_concept_mastery
```

They support:

- user knowledge level;
- goals and preferred style;
- structured learning paths;
- module ordering and content versions;
- completion progress;
- quiz responses and feedback;
- concept mastery and revision scheduling.

Current legal, tax, lending, and market facts should reference source and freshness metadata rather than being permanently embedded in static lesson records.

---

## 18. Notifications

### `backend.notification_preferences`

```text
id
user_profile_id
channel
notification_type
enabled
digest_mode
quiet_hours_json
created_at
updated_at
```

### `backend.notifications`

```text
id
user_profile_id
household_id
notification_type
title
body
priority
status
related_entity_type
related_entity_id
scheduled_at
sent_at
read_at
expires_at
created_at
```

### `backend.notification_deliveries`

Tracks provider, channel, attempts, status, errors, and external IDs.

### `backend.device_tokens`

Stores restricted push tokens and platform/device metadata.

---

## 19. Subscription and usage

Recommended tables:

```text
backend.subscription_plans
backend.subscriptions
backend.entitlements
backend.usage_counters
backend.webhook_events
```

`webhook_events` must have a unique provider event key for idempotency.

Usage counters may track AI reports, predictions, document analyses, listing analyses, and other subscription-limited features.

---

## 20. Audit trail

### `audit.audit_events`

Append-only fields:

```text
id
event_type
actor_type
actor_user_id
actor_service
household_id
resource_type
resource_id
action
before_snapshot
after_snapshot
request_id
trace_id
ip_hash
user_agent_summary
occurred_at
created_at
```

Audit:

- property, ownership, loan, income, expense, lease, and valuation changes;
- document deletion;
- communication approval and sending;
- recommendation decisions;
- permission and subscription changes;
- administrative actions;
- high-impact service failures.

Do not include secrets, full documents, or unnecessary personal data.

---

## 21. AI platform tables

### `ai.agent_definitions`

Stores stable agent ID, version, schemas, policies, allowed tools, prompt references, and status.

### `ai.prompt_versions`

Stores prompt ID, semantic version, hash, source path, purpose, metadata, status, and publication date. Prompts must not contain secrets.

### `ai.executions`

```text
id
backend_request_id
household_id
user_scope_id
agent_id
agent_version
graph_id
status
priority
input_reference_json
input_fingerprint
cache_key
was_cache_hit
started_at
completed_at
error_code
trace_id
created_at
updated_at
```

### `ai.execution_events`

Ordered progress and lifecycle events.

### `ai.tool_calls`

Stores tool, version, status, safe hashes/references, latency, retry count, and error code.

### `ai.model_usage`

Stores provider, model, token counts, estimated cost, latency, and fallback usage.

### `ai.cache_entries`

```text
id
cache_key
agent_id
agent_version
scope_type
scope_id
input_fingerprint
result_reference
created_at
expires_at
stale_until
invalidated_at
invalidation_reason
hit_count
metadata_json
```

Never globally cache user-specific results.

### `ai.cache_dependencies`

Links cache entries to property versions, portfolio versions, dataset versions, prompt versions, model policies, or other dependencies.

### `ai.conversations`, `ai.messages`, and `ai.conversation_summaries`

Store authorised conversational context and summaries. Do not store private chain-of-thought.

### `ai.checkpoints`

PostgreSQL-backed LangGraph checkpoints isolated from frontend access.

### `ai.evaluation_runs` and `ai.evaluation_results`

Store regression and quality evaluation metadata and outcomes.

---

## 22. Data registry and operations

### `data_registry.sources`

Stores source ID, provider, type, jurisdiction, access method, licence, cadence, redistribution rights, authentication type, personal-data classification, and status.

### `data_registry.source_licences`

Stores allowed use, prohibited use, attribution, redistribution, retention, derivative rights, effective dates, and review status.

### `data_registry.datasets`

Stores dataset ID, business meaning, grain, schema version, owner, quality profile, freshness policy, licence constraints, and status.

### `data_registry.dataset_versions`

Stores version, source version, schema version, publication time, row count, quality score, freshness status, and storage reference.

### `data_registry.dataset_partitions`

Stores partition key/value, checksum, row count, quality score, and publication time.

### `data_registry.pipelines` and `data_registry.pipeline_versions`

Store pipeline ownership, versions, source and output datasets, configuration, and status.

### `raw_metadata.raw_artifacts`

Stores metadata and object-storage references for immutable source artefacts. Large raw payloads should not live in PostgreSQL.

### `operations.jobs` and `operations.job_attempts`

Track pipeline, partition, idempotency key, status, attempts, metrics, errors, and traces.

### `operations.event_outbox`

Supports transactional event publication.

### `operations.processed_events`

Deduplicates events per consumer.

---

## 23. Canonical data model

Canonical tables are source-aware, historically versioned, and normalised.

Recommended tables:

```text
canonical.geographies
canonical.properties
canonical.property_sales
canonical.rental_observations
canonical.market_observations
canonical.demographic_observations
canonical.schools
canonical.crime_observations
canonical.infrastructure_projects
canonical.hazard_areas
canonical.economic_indicators
```

Every record should carry, where applicable:

```text
source_id
source_record_id
dataset_version
quality_score
valid_from
valid_to
observed_at
published_at
created_at
```

### Geography considerations

Support state, LGA, statistical areas, suburb/locality, postcode, parcel/address references, point and polygon geometry, aliases, parent relationships, and boundary versions.

Do not assume one suburb maps to one postcode or LGA.

### Property matching

Store:

- source property IDs;
- normalised address components;
- parcel/title reference where licensed;
- geocode;
- match method;
- match confidence;
- candidate review status;
- matching algorithm version.

Do not merge uncertain property identities automatically.

---

## 24. Curated datasets

Recommended tables:

```text
curated.suburb_market_metrics
curated.suburb_demographic_metrics
curated.suburb_risk_metrics
curated.suburb_infrastructure_metrics
curated.prediction_features
```

### `curated.suburb_market_metrics`

Potential fields:

```text
geography_id
period
property_type
bedrooms
median_price
median_rent
gross_yield
sales_count
listing_count
vacancy_rate
days_on_market
price_growth_1y
price_growth_3y
rental_growth_1y
quality_score
dataset_version
```

### `curated.prediction_features`

```text
entity_type
entity_id
feature_date
feature_code
feature_value
feature_version
dataset_versions_json
created_at
```

Prediction features must be point-in-time correct and must not leak future information.

---

## 25. Data quality and lineage

### Quality tables

```text
quality.quality_profiles
quality.quality_rules
quality.quality_results
quality.quality_scores
quality.anomalies
```

Quality dimensions include completeness, validity, uniqueness, timeliness, coverage, consistency, plausibility, and referential integrity.

Critical failures block publication.

### Lineage tables

```text
lineage.lineage_edges
lineage.record_lineage
lineage.aggregate_lineage
```

Published aggregates should identify input datasets, filters, methodology version, transformation version, and source versions.

---

## 26. Relationship summary

```text
auth.users
   ↓ 1:1
backend.user_profiles
   ↓ M:N
backend.households
   ↓ 1:M
backend.properties
   ├── property_ownerships
   ├── property_acquisitions
   ├── loans
   ├── property_income_entries
   ├── property_expense_entries
   ├── rental_agreements
   ├── property_valuations
   ├── documents
   ├── inspections
   ├── scenarios
   └── recommendations
```

AI flow:

```text
backend request
   ↓
ai.executions
   ├── execution_events
   ├── tool_calls
   ├── model_usage
   └── cache entries and dependencies
   ↓
backend.recommendations
```

Data flow:

```text
data_registry.sources
   ↓
raw_metadata.raw_artifacts
   ↓
canonical tables
   ↓
curated tables
   ↓
backend and AI consumers
```

---

## 27. Row-level security

Use RLS for records exposed through Supabase clients.

A user may access a household-owned record only when:

- the JWT maps to an active `backend.user_profiles` record;
- the user is an active household member;
- the member role permits the operation;
- the record is not deleted;
- subscription and feature entitlements permit the action where relevant.

Create carefully reviewed helper functions such as:

```sql
backend.is_household_member(household_id uuid)
backend.has_household_role(household_id uuid, allowed_roles text[])
```

Service roles must bypass RLS only where necessary and must still apply application-level authorisation.

RLS tests must cover cross-user and cross-household access attempts.

---

## 28. Database roles

Suggested roles:

```text
trackmyprops_backend_app
trackmyprops_ai_app
trackmyprops_data_ingest
trackmyprops_data_publish
trackmyprops_readonly
trackmyprops_migration
```

### Backend role

- read/write backend tables;
- append audit events;
- read curated data;
- no staging or raw payload access.

### AI role

- read approved backend views or invoke backend APIs;
- read curated data;
- write AI schema;
- no direct update to property, loan, expense, approval, or communication-send state.

### Data-ingest role

- read source registry;
- write raw metadata and staging;
- no user portfolio access.

### Data-publish role

- write canonical, curated, quality, lineage, and outbox records.

### Migration role

- schema changes through controlled deployment only.

---

## 29. Indexing

Create indexes from observed query patterns.

Common indexes:

```text
household_id
property_id
user_profile_id
status
created_at
effective_date
dataset_version
source_id
execution_id
recommendation_type
```

Examples:

```sql
create index on backend.property_expense_entries(property_id, expense_date desc);
create index on backend.property_income_entries(property_id, received_date desc);
create index on backend.property_valuations(property_id, valuation_date desc);
create index on backend.recommendations(household_id, status, created_at desc);
create index on ai.executions(household_id, status, created_at desc);
create index on curated.suburb_market_metrics(geography_id, period desc);
```

Use partial indexes for active records and GIST indexes for PostGIS geometry.

Do not add vector indexes before measuring retrieval size, latency, and recall requirements.

---

## 30. Partitioning

Consider date partitioning for high-volume append-only tables such as:

- audit events;
- AI execution events;
- model usage;
- property sales;
- rental observations;
- market observations;
- notification events;
- operational job history.

Do not partition prematurely. Document partition creation, retention, and query behaviour.

---

## 31. Views and materialized views

Potential read models:

```text
backend.v_property_current_financials
backend.v_current_loans
backend.v_latest_property_valuations
backend.mv_portfolio_summary
curated.mv_latest_suburb_metrics
curated.mv_property_comparable_summary
ai.mv_agent_cost_daily
quality.mv_dataset_health
```

Every materialized view must expose its refresh time and must not be presented as current when stale.

Keep complex financial and recommendation logic in versioned backend services rather than opaque SQL views.

---

## 32. Event outbox and idempotency

Use `operations.event_outbox` when a database change must reliably publish an event.

```text
business transaction
   ├── update authoritative record
   └── insert outbox event
        ↓
publisher sends event
        ↓
outbox marked published
```

Use `operations.processed_events` to deduplicate consumer processing.

Use unique idempotency records or keys for:

- webhook events;
- AI execution requests;
- EOI sending;
- payment operations;
- data pipeline runs;
- retryable external writes.

---

## 33. Concurrency control

Use optimistic concurrency for user-editable records:

```text
record_version bigint not null default 1
```

Updates should include the expected version. Return a conflict if the record changed.

Use database locks only when necessary and keep lock duration short.

---

## 34. Retention and deletion

Define retention classes for:

- portfolio and financial records;
- uploaded documents;
- communication approvals;
- audit events;
- AI conversations and checkpoints;
- model payloads;
- notifications;
- raw data;
- licensed datasets;
- operational logs.

Deletion workflows must remove or invalidate:

- records;
- storage objects;
- embeddings;
- AI memories;
- cache entries;
- signed references;
- derived user-specific outputs.

Audit and legal-retention exceptions must be documented.

---

## 35. Backup and recovery

Requirements:

- automated database backups;
- point-in-time recovery where supported;
- object-storage backup strategy for critical files;
- regular restore testing;
- documented recovery-point objective;
- documented recovery-time objective;
- migration rollback procedures;
- incident runbooks.

A backup is not considered reliable until restoration is tested.

---

## 36. Migration ownership and strategy

Each service owns migrations for its schema:

```text
backend/migrations/
ai-platform/migrations/
data-platform/migrations/
```

Rules:

- Two services must not migrate the same table.
- Cross-schema dependencies require coordination.
- Use expand-and-contract for breaking changes.
- Separate large data backfills from schema migrations.
- Test upgrades from the previous production schema.
- Test downgrades where practical.
- Document lock and runtime impact.

Safe sequence:

```text
1. Add compatible schema objects.
2. Deploy code supporting old and new forms.
3. Backfill.
4. Switch reads and writes.
5. Verify.
6. Remove deprecated objects in a later release.
```

---

## 37. Seed and test data

Safe seed data may include:

- expense categories;
- notification types;
- feature codes;
- learning paths;
- agent metadata;
- quality rule templates;
- lookup values.

Never seed real users, addresses, financial records, credentials, or restricted provider data.

Integration tests must use real PostgreSQL with required extensions. SQLite is not a full substitute for PostgreSQL, RLS, PostGIS, or migration behaviour.

---

## 38. Sensitive fields

Apply restricted access, masking, encryption where justified, and log redaction to:

- phone and email;
- ABN, ACN, trust, and entity details;
- loan account references;
- recipient email addresses;
- push tokens;
- provider customer identifiers;
- document storage paths;
- signed URLs;
- IP-derived audit values.

---

## 39. Data contracts

Every important table or view must document:

- purpose;
- owning service;
- grain;
- primary and foreign keys;
- effective-time semantics;
- currency and units;
- nullable fields;
- sensitivity;
- retention;
- RLS policy;
- consumers;
- indexes;
- versioning;
- known limitations.

---

## 40. Initial implementation order

### Phase 1 — Core portfolio

- users and households;
- properties and ownership;
- acquisitions;
- loans;
- income;
- expenses;
- leases;
- valuations;
- documents;
- audit.

### Phase 2 — Portfolio intelligence

- financial snapshots;
- portfolio snapshots;
- benchmarks;
- scenarios;
- recommendations and decisions.

### Phase 3 — AI platform

- agents and prompts;
- executions and progress;
- tool calls and model usage;
- cache and dependencies;
- conversations;
- checkpoints;
- evaluations.

### Phase 4 — Discovery and communication

- watchlists;
- listings;
- matches;
- opportunities;
- drafts;
- approvals;
- sent messages and provider events.

### Phase 5 — Learning and notifications

- learning profiles and paths;
- progress and quizzes;
- notifications;
- device tokens;
- preferences.

### Phase 6 — Data platform

- sources and licences;
- datasets and pipeline versions;
- jobs and raw metadata;
- canonical geography and property data;
- curated metrics;
- quality and lineage.

### Phase 7 — Hardening

- RLS;
- least-privilege roles;
- indexes;
- materialized views;
- retention jobs;
- backup and recovery tests;
- performance and migration tests.

---

## 41. Required connection values

Each project’s `.env.example` and `SETUP.md` must document, as applicable:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
DATABASE_DIRECT_URL
DATABASE_POOLER_URL
DATABASE_POOL_SIZE
DATABASE_MAX_OVERFLOW
DATABASE_STATEMENT_TIMEOUT_SECONDS
```

Also document:

- host;
- database name;
- port;
- SSL mode;
- transaction or session pooling mode;
- migration connection;
- service role names;
- schema ownership;
- local, staging, and production configuration.

Never commit real values.

---

## 42. Definition of done

The database architecture is complete when:

- schema ownership is explicit;
- all core entities and relationships are represented;
- exact numeric types are used for money;
- historical values are preserved;
- property, loan, income, expense, lease, valuation, and document workflows are supported;
- portfolio snapshots and scenario comparisons are supported;
- AI execution, cache dependency, and evaluation records are supported;
- data source, licence, quality, lineage, and dataset versioning are supported;
- communication approval is auditable and cannot be bypassed;
- RLS and cross-household isolation are tested;
- indexes match real query patterns;
- service roles follow least privilege;
- migrations are safe and version-controlled;
- deletion, retention, backup, and restore are documented;
- every required connection value appears in setup documentation;
- no frontend secret or unrestricted database role is required;
- no service ambiguously owns another service’s tables.

---

## 43. Final database principle

For every important property, financial, market, or AI value, TrackMyProps should be able to answer:

```text
What is this value?
Who changed or produced it?
When did it apply?
Where did it come from?
Which version produced it?
Who is allowed to see it?
Can it be reproduced?
```

If the database cannot answer those questions, the design is incomplete.
