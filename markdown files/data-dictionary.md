# TrackMyProps Data Dictionary

## 1. Purpose

This document defines the authoritative data dictionary for TrackMyProps.

It covers:

- major entities;
- field names;
- data types;
- units;
- nullability;
- validation;
- source of truth;
- sensitivity;
- ownership;
- lifecycle;
- retention considerations;
- derived versus authoritative values;
- cross-service usage.

This document must remain consistent with:

```text
database.md
contracts.md
api-design.md
permissions-matrix.md
calculation-specification.md
data-sources.md
security.md
```

---

# 2. Data dictionary principles

1. Every field has one documented meaning.
2. Names are stable and unambiguous.
3. Money uses decimal strings with currency.
4. Rates use decimal form internally.
5. Timestamps are UTC.
6. User-facing timezone is stored separately.
7. Source of truth is explicit.
8. Derived fields are distinguishable from authoritative fields.
9. Sensitive data is classified.
10. Null has a defined meaning.
11. Unknown is not represented as zero.
12. Units are explicit.
13. Historical values are preserved where required.
14. Provider-derived values retain provider metadata.
15. Every entity has an owning service.

---

# 3. Common metadata fields

These fields may appear across many entities.

| Field | Type | Nullable | Meaning |
|---|---|---:|---|
| `id` | UUID | No | Stable internal identifier |
| `created_at` | timestamptz | No | Creation time in UTC |
| `updated_at` | timestamptz | No | Last modification time in UTC |
| `created_by` | UUID | Conditional | Actor that created the record |
| `updated_by` | UUID | Conditional | Actor that last changed the record |
| `record_version` | integer | No | Optimistic concurrency version |
| `status` | enum | No | Current lifecycle state |
| `source_type` | enum | Conditional | Origin of the data |
| `source_id` | text | Conditional | Registered source identifier |
| `source_record_id` | text | Conditional | Original source record identifier |
| `observed_at` | timestamptz/date | Conditional | When the value was observed |
| `published_at` | timestamptz/date | Conditional | When source published it |
| `ingested_at` | timestamptz | Conditional | When TrackMyProps ingested it |
| `dataset_version` | text | Conditional | Source or curated dataset version |
| `quality_score` | decimal | Conditional | Deterministic quality score from 0 to 1 |
| `is_deleted` | boolean | No | Soft-deletion marker where used |
| `deleted_at` | timestamptz | Conditional | Deletion time |
| `deleted_by` | UUID | Conditional | Actor that initiated deletion |

---

# 4. Sensitivity classifications

Use:

```text
public
internal
confidential
restricted
highly_restricted
```

## Public

Examples:

- public suburb names;
- published government statistics.

## Internal

Examples:

- internal IDs;
- calculation versions;
- operational metadata.

## Confidential

Examples:

- household property data;
- financial summaries;
- recommendations.

## Restricted

Examples:

- loan statements;
- contracts;
- recipient emails;
- user contact details.

## Highly restricted

Examples:

- authentication secrets;
- access tokens;
- private keys;
- raw identity documents.

Highly restricted secrets must not be stored in application tables.

---

# 5. Source type values

Recommended values:

```text
user_provided
document_extracted
official_public
commercial_provider
derived
system_generated
professional_provided
```

---

# 6. User profile

## Entity

```text
user_profiles
```

## Owner

```text
backend
```

| Field | Type | Nullable | Sensitivity | Source of truth | Validation |
|---|---|---:|---|---|---|
| `user_id` | UUID | No | Internal | Supabase Auth | Must exist in auth users |
| `display_name` | text | No | Confidential | User | Length and character rules |
| `email_reference` | text/UUID | Conditional | Restricted | Supabase Auth | Do not duplicate unnecessarily |
| `timezone` | text | No | Internal | User | Valid IANA timezone |
| `country_code` | char(2) | No | Internal | User | ISO 3166-1 alpha-2 |
| `investment_experience` | enum | Conditional | Confidential | User | Approved enum |
| `primary_goal` | enum/text | Conditional | Confidential | User | Approved values |
| `onboarding_status` | enum | No | Internal | System | Approved lifecycle |
| `legal_terms_version` | text | Conditional | Internal | System/User | Must reference published version |
| `legal_terms_accepted_at` | timestamptz | Conditional | Internal | System | Required after acceptance |
| `privacy_version` | text | Conditional | Internal | System/User | Published version |
| `privacy_accepted_at` | timestamptz | Conditional | Internal | System | Required after acceptance |

---

# 7. Household

## Entity

```text
households
```

## Owner

```text
backend
```

| Field | Type | Nullable | Sensitivity | Source of truth | Validation |
|---|---|---:|---|---|---|
| `id` | UUID | No | Internal | System | UUID |
| `name` | text | No | Confidential | Owner/Admin | Length limits |
| `owner_user_id` | UUID | No | Restricted | Backend | Active user |
| `default_currency` | char(3) | No | Internal | Owner | ISO 4217, initially AUD |
| `timezone` | text | No | Internal | Owner | IANA timezone |
| `status` | enum | No | Internal | System | active, pending_deletion, deleted |
| `membership_version` | integer | No | Internal | System | Increment on role/membership changes |

---

# 8. Household membership

## Entity

```text
household_memberships
```

| Field | Type | Nullable | Sensitivity | Source of truth | Validation |
|---|---|---:|---|---|---|
| `household_id` | UUID | No | Internal | Backend | Existing household |
| `user_id` | UUID | No | Restricted | Backend | Existing user |
| `role` | enum | No | Restricted | Owner/Admin | owner, admin, member, viewer, advisor |
| `status` | enum | No | Internal | System | invited, active, suspended, removed |
| `joined_at` | timestamptz | Conditional | Internal | System | Set on activation |
| `valid_until` | timestamptz | Conditional | Restricted | Owner/Admin | Used for temporary access |
| `invited_by` | UUID | Conditional | Restricted | System | Authorised actor |

---

# 9. Property

## Entity

```text
properties
```

## Owner

```text
backend
```

| Field | Type | Nullable | Sensitivity | Source of truth | Validation |
|---|---|---:|---|---|---|
| `household_id` | UUID | No | Restricted | Backend | Active household |
| `display_name` | text | Conditional | Confidential | User | Length limit |
| `property_type` | enum | No | Confidential | User/Provider | Approved enum |
| `ownership_status` | enum | No | Confidential | User | owned, prospective, sold, archived |
| `bedrooms` | integer | Conditional | Confidential | User/Provider | 0–50 |
| `bathrooms` | decimal/integer | Conditional | Confidential | User/Provider | Non-negative |
| `car_spaces` | integer | Conditional | Confidential | User/Provider | Non-negative |
| `land_area_sqm` | decimal | Conditional | Confidential | User/Provider | Positive |
| `building_area_sqm` | decimal | Conditional | Confidential | User/Provider | Positive |
| `year_built` | integer | Conditional | Confidential | User/Provider | Plausible year |
| `notes` | text | Conditional | Restricted | User | Length and content controls |
| `canonical_property_id` | UUID | Conditional | Internal | Data platform | Valid canonical property |
| `address_id` | UUID | No | Restricted | Backend/Data | Existing address |
| `archived_at` | timestamptz | Conditional | Internal | System | Required when archived |

---

# 10. Address

## Entity

```text
addresses
```

| Field | Type | Nullable | Sensitivity | Source of truth | Validation |
|---|---|---:|---|---|---|
| `unit_number` | text | Conditional | Restricted | Provider/User | Normalised |
| `street_number` | text | Conditional | Restricted | Provider/User | Normalised |
| `street_name` | text | No | Restricted | Provider/User | Normalised |
| `street_type` | text | Conditional | Restricted | Provider/User | Approved abbreviation |
| `suburb` | text | No | Confidential | Provider/User | Non-empty |
| `state` | enum | No | Confidential | Provider/User | Australian state/territory |
| `postcode` | text | No | Confidential | Provider/User | Four digits |
| `country_code` | char(2) | No | Internal | System | AU initially |
| `latitude` | decimal | Conditional | Confidential | Geocoder | Valid range |
| `longitude` | decimal | Conditional | Confidential | Geocoder | Valid range |
| `provider_address_id` | text | Conditional | Internal | Provider | Provider-specific |
| `match_confidence` | decimal | Conditional | Internal | Provider/System | 0 to 1 |
| `is_manual` | boolean | No | Internal | System | True for manual entry |

---

# 11. Acquisition

## Entity

```text
property_acquisitions
```

| Field | Type | Nullable | Unit | Source of truth | Validation |
|---|---|---:|---|---|---|
| `property_id` | UUID | No | — | Backend | Existing property |
| `purchase_price` | money | No | AUD | User/Document | Positive |
| `contract_date` | date | Conditional | Date | User/Document | Valid date |
| `settlement_date` | date | Conditional | Date | User/Document | Not before contract unless exception |
| `deposit` | money | Conditional | AUD | User/Document | Non-negative |
| `stamp_duty` | money | Conditional | AUD | User/Document | Non-negative |
| `conveyancing_fees` | money | Conditional | AUD | User | Non-negative |
| `buyers_agent_fees` | money | Conditional | AUD | User | Non-negative |
| `inspection_fees` | money | Conditional | AUD | User | Non-negative |
| `loan_fees` | money | Conditional | AUD | User | Non-negative |
| `initial_repairs` | money | Conditional | AUD | User | Non-negative |
| `other_acquisition_costs` | money | Conditional | AUD | User | Non-negative |
| `total_acquisition_cost` | money | Derived | AUD | Calculation engine | Versioned formula |

---

# 12. Ownership record

## Entity

```text
property_ownerships
```

| Field | Type | Nullable | Sensitivity | Source of truth | Validation |
|---|---|---:|---|---|---|
| `property_id` | UUID | No | Restricted | Backend | Existing property |
| `owner_type` | enum | No | Restricted | User/Document | individual, company, trust, etc. |
| `owner_reference` | UUID/text | No | Restricted | User/Backend | Valid internal or masked reference |
| `ownership_percentage` | decimal | No | Restricted | User/Document | Greater than 0 and <= 1 |
| `effective_from` | date | Conditional | Restricted | User/Document | Valid date |
| `effective_to` | date | Conditional | Restricted | User/Document | After effective_from |
| `is_verified` | boolean | No | Internal | User/System | False by default |

---

# 13. Loan

## Entity

```text
loans
```

## Owner

```text
backend
```

| Field | Type | Nullable | Unit | Sensitivity | Source of truth |
|---|---|---:|---|---|---|
| `household_id` | UUID | No | — | Restricted | Backend |
| `lender_name` | text | Conditional | — | Confidential | User/Document |
| `facility_name` | text | Conditional | — | Confidential | User |
| `loan_type` | enum | No | — | Confidential | User/Document |
| `rate_type` | enum | No | — | Confidential | User/Document |
| `original_amount` | money | Conditional | AUD | Restricted | User/Document |
| `current_balance` | money | No | AUD | Restricted | User/Document |
| `interest_rate` | decimal | No | Ratio | Restricted | User/Document |
| `repayment_amount` | money | Conditional | AUD | Restricted | User/Document |
| `repayment_frequency` | enum | Conditional | — | Confidential | User/Document |
| `remaining_term_months` | integer | Conditional | Months | Confidential | User/Document |
| `interest_only_end_date` | date | Conditional | Date | Confidential | User/Document |
| `fixed_rate_expiry` | date | Conditional | Date | Confidential | User/Document |
| `annual_fees` | money | Conditional | AUD | Restricted | User/Document |
| `status` | enum | No | — | Internal | System/User |

Validation:

- balance non-negative;
- interest rate plausible and non-negative;
- remaining term positive;
- dates consistent.

---

# 14. Loan security

## Entity

```text
loan_securities
```

| Field | Type | Nullable | Meaning |
|---|---|---:|---|
| `loan_id` | UUID | No | Secured facility |
| `property_id` | UUID | No | Property securing facility |
| `security_type` | enum | No | primary, additional, cross_collateralised |
| `effective_from` | date | Conditional | Start date |
| `effective_to` | date | Conditional | End date |

Used to avoid double counting shared facilities.

---

# 15. Loan rate history

## Entity

```text
loan_rate_history
```

| Field | Type | Nullable | Unit | Source |
|---|---|---:|---|---|
| `loan_id` | UUID | No | — | Backend |
| `annual_rate` | decimal | No | Ratio | User/Document |
| `effective_date` | date | No | Date | User/Document |
| `rate_type` | enum | No | — | User/Document |
| `source_reference` | UUID/text | Conditional | — | Document/User |

---

# 16. Offset account

## Entity

```text
loan_offsets
```

| Field | Type | Nullable | Unit | Sensitivity |
|---|---|---:|---|---|
| `loan_id` | UUID | No | — | Restricted |
| `current_balance` | money | No | AUD | Restricted |
| `observed_at` | date/timestamptz | No | — | Confidential |
| `source_type` | enum | No | — | Internal |

---

# 17. Redraw

## Entity

```text
loan_redraws
```

| Field | Type | Nullable | Unit | Sensitivity |
|---|---|---:|---|---|
| `loan_id` | UUID | No | — | Restricted |
| `available_redraw` | money | No | AUD | Restricted |
| `observed_at` | date/timestamptz | No | — | Confidential |

Redraw is not treated as offset cash.

---

# 18. Property income

## Entity

```text
property_income`
```

| Field | Type | Nullable | Unit | Source |
|---|---|---:|---|---|
| `property_id` | UUID | No | — | Backend |
| `income_type` | enum | No | — | User/Lease |
| `amount` | money | No | AUD | User/Document |
| `frequency` | enum | No | — | User |
| `start_date` | date | Conditional | Date | User |
| `end_date` | date | Conditional | Date | User |
| `is_recurring` | boolean | No | — | User/System |
| `lease_id` | UUID | Conditional | — | Backend |
| `annualised_amount` | money | Derived | AUD | Calculation engine |

---

# 19. Property expense

## Entity

```text
property_expenses
```

| Field | Type | Nullable | Unit | Source |
|---|---|---:|---|---|
| `property_id` | UUID | No | — | Backend |
| `category` | enum | No | — | User/Document |
| `classification` | enum | No | — | User/System |
| `amount` | money | No | AUD | User/Document |
| `frequency` | enum | No | — | User |
| `expense_date` | date | Conditional | Date | User/Document |
| `start_date` | date | Conditional | Date | User |
| `end_date` | date | Conditional | Date | User |
| `is_recurring` | boolean | No | — | User/System |
| `document_id` | UUID | Conditional | — | Backend |
| `annualised_amount` | money | Derived | AUD | Calculation engine |

Classification values:

```text
operating
financing
capital
tax
other
```

---

# 20. Lease

## Entity

```text
leases
```

| Field | Type | Nullable | Unit | Sensitivity | Source |
|---|---|---:|---|---|---|
| `property_id` | UUID | No | — | Restricted | Backend |
| `start_date` | date | No | Date | Confidential | User/Document |
| `end_date` | date | Conditional | Date | Confidential | User/Document |
| `weekly_rent` | money | No | AUD/week | Restricted | User/Document |
| `bond_amount` | money | Conditional | AUD | Restricted | User/Document |
| `rent_review_date` | date | Conditional | Date | Confidential | User/Document |
| `status` | enum | No | — | Confidential | System/User |
| `tenant_reference` | UUID/text | Conditional | — | Restricted | User |
| `property_manager_id` | UUID | Conditional | — | Confidential | Backend |

Tenant details should be minimised.

---

# 21. Vacancy period

## Entity

```text
vacancy_periods
```

| Field | Type | Nullable | Meaning |
|---|---|---:|---|
| `property_id` | UUID | No | Property |
| `start_date` | date | No | Vacancy start |
| `end_date` | date | Conditional | Vacancy end |
| `reason` | enum/text | Conditional | Cause |
| `weekly_rent_basis` | money | Conditional | Rent used for loss estimate |
| `vacancy_loss` | money | Derived | Calculation result |

---

# 22. Valuation

## Entity

```text
property_valuations
```

| Field | Type | Nullable | Unit | Sensitivity | Source |
|---|---|---:|---|---|---|
| `property_id` | UUID | No | — | Restricted | Backend |
| `valuation_type` | enum | No | — | Confidential | User/Provider |
| `value` | money | No | AUD | Restricted | User/Provider |
| `lower_bound` | money | Conditional | AUD | Restricted | Provider |
| `upper_bound` | money | Conditional | AUD | Restricted | Provider |
| `confidence` | decimal | Conditional | 0–1 | Confidential | Provider/System |
| `valuation_date` | date | No | Date | Confidential | User/Provider |
| `provider` | text | Conditional | — | Internal | Provider |
| `provider_model_version` | text | Conditional | — | Internal | Provider |
| `required_disclaimer` | text | Conditional | — | Internal | Provider contract |
| `is_preferred` | boolean | No | — | Internal | User/System |
| `freshness_status` | enum | Derived | — | Internal | System |

---

# 23. Property financial snapshot

## Entity

```text
property_financial_snapshots
```

| Field | Type | Nullable | Unit | Source |
|---|---|---:|---|---|
| `property_id` | UUID | No | — | Calculation engine |
| `snapshot_date` | date | No | Date | System |
| `property_value` | money | Conditional | AUD | Preferred valuation |
| `secured_debt` | money | Conditional | AUD | Loan aggregation |
| `equity` | money | Conditional | AUD | Derived |
| `lvr` | decimal | Conditional | Ratio | Derived |
| `annual_income` | money | Conditional | AUD/year | Derived |
| `annual_operating_expenses` | money | Conditional | AUD/year | Derived |
| `annual_cash_flow` | money | Conditional | AUD/year | Derived |
| `gross_yield` | decimal | Conditional | Ratio | Derived |
| `net_yield` | decimal | Conditional | Ratio | Derived |
| `calculation_version` | text | No | — | Calculation engine |
| `input_version` | text | No | — | Calculation engine |
| `completeness_score` | decimal | Conditional | 0–1 | Derived |
| `confidence_score` | decimal | Conditional | 0–1 | Derived |

Snapshots are immutable.

---

# 24. Portfolio snapshot

## Entity

```text
portfolio_snapshots
```

| Field | Type | Nullable | Unit |
|---|---|---:|---|
| `household_id` | UUID | No | — |
| `snapshot_date` | date | No | Date |
| `property_count` | integer | No | Count |
| `portfolio_value` | money | Conditional | AUD |
| `portfolio_debt` | money | Conditional | AUD |
| `portfolio_equity` | money | Conditional | AUD |
| `portfolio_lvr` | decimal | Conditional | Ratio |
| `annual_income` | money | Conditional | AUD/year |
| `annual_expenses` | money | Conditional | AUD/year |
| `annual_cash_flow` | money | Conditional | AUD/year |
| `weighted_gross_yield` | decimal | Conditional | Ratio |
| `weighted_net_yield` | decimal | Conditional | Ratio |
| `largest_property_concentration` | decimal | Conditional | Ratio |
| `hhi` | decimal | Conditional | Ratio |
| `calculation_version` | text | No | — |

---

# 25. Scenario

## Entity

```text
scenarios
```

| Field | Type | Nullable | Sensitivity | Source |
|---|---|---:|---|---|
| `household_id` | UUID | No | Restricted | Backend |
| `property_id` | UUID | Conditional | Restricted | User |
| `scenario_type` | enum | No | Confidential | User |
| `name` | text | No | Confidential | User |
| `assumptions` | JSONB | No | Restricted | User/System |
| `assumption_set_version` | text | No | Internal | System |
| `status` | enum | No | Internal | System |

Scenario types:

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

---

# 26. Scenario run

## Entity

```text
scenario_runs
```

| Field | Type | Nullable | Meaning |
|---|---|---:|---|
| `scenario_id` | UUID | No | Parent scenario |
| `run_number` | integer | No | Sequential run |
| `inputs` | JSONB | No | Immutable input snapshot |
| `outputs` | JSONB | No | Calculation output |
| `calculation_version` | text | No | Formula version |
| `status` | enum | No | succeeded, failed, etc. |
| `error_code` | text | Conditional | Controlled error |

---

# 27. Geography

## Entity

```text
canonical.geographies
```

| Field | Type | Nullable | Source |
|---|---|---:|---|
| `geography_type` | enum | No | ABS/State |
| `geography_code` | text | No | Source |
| `geography_name` | text | No | Source |
| `state` | enum | Conditional | Source |
| `geography_standard` | text | No | Source |
| `geography_edition` | text | No | Source |
| `geometry` | geometry | Conditional | Source |
| `effective_from` | date | Conditional | Source |
| `effective_to` | date | Conditional | Source |

---

# 28. Demographic observation

## Entity

```text
canonical.demographic_observations
```

| Field | Type | Nullable | Unit |
|---|---|---:|---|
| `geography_id` | UUID | No | — |
| `metric_code` | text | No | — |
| `value` | decimal/text | Conditional | Metric-specific |
| `unit` | text | No | Explicit unit |
| `period` | text/date | No | Observation period |
| `population_scope` | text | Conditional | Population definition |
| `suppression_flag` | boolean | No | — |
| `source_id` | text | No | — |
| `dataset_version` | text | No | — |

---

# 29. Market observation

## Entity

```text
canonical.market_observations
```

| Field | Type | Nullable | Unit |
|---|---|---:|---|
| `geography_id` | UUID | No | — |
| `property_type` | enum | Conditional | — |
| `bedrooms` | integer | Conditional | Count |
| `metric_code` | text | No | — |
| `value` | decimal | Conditional | Metric-specific |
| `unit` | text | No | Explicit |
| `period_start` | date | Conditional | Date |
| `period_end` | date | No | Date |
| `sample_size` | integer | Conditional | Count |
| `methodology_version` | text | Conditional | — |

---

# 30. Canonical property

## Entity

```text
canonical.properties
```

| Field | Type | Nullable | Meaning |
|---|---|---:|---|
| `canonical_property_id` | UUID | No | National internal property ID |
| `address_id` | UUID | No | Canonical address |
| `parcel_id` | UUID | Conditional | Related parcel |
| `building_id` | UUID | Conditional | Related building |
| `property_type` | enum | Conditional | Canonical type |
| `first_observed_at` | timestamptz | No | First known observation |
| `last_observed_at` | timestamptz | No | Latest observation |
| `match_status` | enum | No | matched, ambiguous, provisional |

---

# 31. Property sale

## Entity

```text
canonical.property_sales
```

| Field | Type | Nullable | Unit |
|---|---|---:|---|
| `canonical_property_id` | UUID | No | — |
| `contract_date` | date | Conditional | Date |
| `settlement_date` | date | Conditional | Date |
| `sale_price` | money | Conditional | AUD |
| `sale_type` | enum | Conditional | — |
| `is_market_sale` | boolean | Conditional | — |
| `source_id` | text | No | — |
| `source_record_id` | text | No | — |
| `quality_score` | decimal | Conditional | 0–1 |

---

# 32. Property listing

## Entity

```text
canonical.property_listings
```

| Field | Type | Nullable | Sensitivity | Source |
|---|---|---:|---|---|
| `provider` | text | No | Internal | Provider |
| `provider_listing_id` | text | No | Internal | Provider |
| `canonical_property_id` | UUID | Conditional | Internal | Matching |
| `listing_status` | enum | No | Internal | Provider |
| `listing_type` | enum | No | Internal | Provider |
| `price_text` | text | Conditional | Confidential | Provider |
| `price_min` | money | Conditional | AUD | Provider/System |
| `price_max` | money | Conditional | AUD | Provider/System |
| `listed_at` | timestamptz | Conditional | — | Provider |
| `updated_at_source` | timestamptz | Conditional | — | Provider |
| `withdrawn_at` | timestamptz | Conditional | — | Provider |
| `sold_at` | timestamptz | Conditional | — | Provider |
| `agent_reference` | text | Conditional | Restricted | Provider |
| `display_expiry` | timestamptz | Conditional | Internal | Contract |
| `licence_constraints` | JSONB | No | Internal | Source registry |

---

# 33. Watchlist

## Entity

```text
watchlists
```

| Field | Type | Nullable | Meaning |
|---|---|---:|---|
| `household_id` | UUID | No | Owning household |
| `name` | text | No | User label |
| `criteria` | JSONB | No | Search and strategy criteria |
| `criteria_version` | integer | No | Version for re-matching |
| `status` | enum | No | active, paused, archived |

---

# 34. Listing match

## Entity

```text
listing_matches
```

| Field | Type | Nullable | Unit |
|---|---|---:|---|
| `watchlist_id` | UUID | No | — |
| `listing_id` | UUID | No | — |
| `match_score` | decimal | No | 0–1 |
| `qualified` | boolean | No | — |
| `qualifying_reasons` | JSONB | No | — |
| `disqualifiers` | JSONB | No | — |
| `portfolio_fit_score` | decimal | Conditional | 0–1 |
| `calculation_version` | text | No | — |

---

# 35. AI execution

## Entity

```text
ai.executions
```

| Field | Type | Nullable | Sensitivity | Source |
|---|---|---:|---|---|
| `execution_id` | UUID | No | Internal | Backend |
| `household_id` | UUID | No | Restricted | Backend |
| `user_id` | UUID | No | Restricted | Backend |
| `agent_id` | text | No | Internal | Registry |
| `agent_version` | text | No | Internal | Registry |
| `prompt_version` | text | No | Internal | Registry |
| `subject_type` | text | No | Internal | Backend |
| `subject_id` | UUID | Conditional | Restricted | Backend |
| `status` | enum | No | Internal | System |
| `input_reference` | UUID/text | Conditional | Restricted | Backend |
| `result_reference` | UUID/text | Conditional | Restricted | AI/Backend |
| `was_cache_hit` | boolean | No | Internal | AI |
| `input_tokens` | integer | Conditional | Internal | Provider |
| `output_tokens` | integer | Conditional | Internal | Provider |
| `estimated_cost` | money | Conditional | Internal | AI |
| `started_at` | timestamptz | Conditional | Internal | AI |
| `completed_at` | timestamptz | Conditional | Internal | AI |
| `error_code` | text | Conditional | Internal | AI |

Do not store hidden chain-of-thought.

---

# 36. AI cache entry

## Entity

```text
ai.cache_entries
```

| Field | Type | Nullable | Meaning |
|---|---|---:|---|
| `cache_key` | text/hash | No | Deterministic key |
| `agent_id` | text | No | Agent |
| `agent_version` | text | No | Agent version |
| `scope_type` | enum | No | global, household, user, property |
| `scope_id` | UUID/text | Conditional | Scoped entity |
| `input_fingerprint` | text | No | Input hash |
| `dataset_versions` | JSONB | No | Source versions |
| `result_reference` | UUID/text | No | Stored result |
| `expires_at` | timestamptz | Conditional | TTL |
| `invalidated_at` | timestamptz | Conditional | Invalidation |

---

# 37. Recommendation

## Entity

```text
recommendations
```

| Field | Type | Nullable | Sensitivity |
|---|---|---:|---|
| `household_id` | UUID | No | Restricted |
| `property_id` | UUID | Conditional | Restricted |
| `recommendation_type` | enum | No | Confidential |
| `priority` | enum | No | Confidential |
| `status` | enum | No | Confidential |
| `summary` | text | No | Confidential |
| `details` | JSONB | No | Restricted |
| `evidence` | JSONB | No | Restricted |
| `confidence` | decimal | Conditional | Confidential |
| `data_freshness` | JSONB | No | Internal |
| `agent_id` | text | No | Internal |
| `agent_version` | text | No | Internal |
| `expires_at` | timestamptz | Conditional | Internal |
| `supersedes_id` | UUID | Conditional | Internal |

---

# 38. Briefing

## Entity

```text
briefings
```

| Field | Type | Nullable | Meaning |
|---|---|---:|---|
| `household_id` | UUID | No | Household |
| `briefing_period_start` | timestamptz/date | No | Start |
| `briefing_period_end` | timestamptz/date | No | End |
| `content` | JSONB | No | Structured briefing |
| `material_item_count` | integer | No | Count |
| `status` | enum | No | generated, delivered, read |
| `agent_version` | text | No | Producing version |

---

# 39. Communication draft

## Entity

```text
communication_drafts
```

| Field | Type | Nullable | Sensitivity |
|---|---|---:|---|
| `household_id` | UUID | No | Restricted |
| `communication_type` | enum | No | Confidential |
| `subject` | text | No | Restricted |
| `body` | text | No | Restricted |
| `recipient_email` | text | No | Restricted |
| `draft_version` | integer | No | Internal |
| `status` | enum | No | Internal |
| `requires_approval` | boolean | No | Internal |
| `listing_id` | UUID | Conditional | Confidential |
| `property_id` | UUID | Conditional | Confidential |
| `created_by_agent_id` | text | Conditional | Internal |
| `approved_version` | integer | Conditional | Internal |

---

# 40. Communication approval

## Entity

```text
communication_approvals
```

| Field | Type | Nullable | Sensitivity |
|---|---|---:|---|
| `draft_id` | UUID | No | Restricted |
| `draft_version` | integer | No | Internal |
| `approved_by` | UUID | No | Restricted |
| `approved_at` | timestamptz | No | Internal |
| `expires_at` | timestamptz | Conditional | Internal |
| `recipient_hash` | text | No | Internal |
| `content_hash` | text | No | Internal |
| `status` | enum | No | Internal |

---

# 41. Communication message

## Entity

```text
communication_messages
```

| Field | Type | Nullable | Sensitivity |
|---|---|---:|---|
| `draft_id` | UUID | No | Restricted |
| `provider` | text | No | Internal |
| `provider_message_reference` | text | Conditional | Internal |
| `status` | enum | No | Internal |
| `sent_at` | timestamptz | Conditional | Internal |
| `delivered_at` | timestamptz | Conditional | Internal |
| `bounced_at` | timestamptz | Conditional | Internal |
| `failure_code` | text | Conditional | Internal |
| `idempotency_key` | text/hash | No | Internal |

---

# 42. Document

## Entity

```text
documents
```

| Field | Type | Nullable | Sensitivity |
|---|---|---:|---|
| `household_id` | UUID | No | Restricted |
| `property_id` | UUID | Conditional | Restricted |
| `document_type` | enum | No | Restricted |
| `original_filename` | text | No | Restricted |
| `storage_path` | text | No | Restricted |
| `mime_type` | text | No | Internal |
| `file_size_bytes` | bigint | No | Internal |
| `checksum` | text | No | Internal |
| `scan_status` | enum | No | Internal |
| `processing_status` | enum | No | Internal |
| `uploaded_by` | UUID | No | Restricted |
| `retention_class` | enum | No | Internal |

---

# 43. Document analysis

## Entity

```text
document_analyses
```

| Field | Type | Nullable | Sensitivity |
|---|---|---:|---|
| `document_id` | UUID | No | Restricted |
| `analysis_type` | text | No | Internal |
| `summary` | JSONB/text | No | Restricted |
| `extracted_fields` | JSONB | No | Restricted |
| `page_references` | JSONB | No | Restricted |
| `missing_pages` | JSONB | No | Restricted |
| `parser_version` | text | No | Internal |
| `agent_version` | text | Conditional | Internal |
| `status` | enum | No | Internal |

---

# 44. Inspection

## Entity

```text
inspections
```

| Field | Type | Nullable | Sensitivity |
|---|---|---:|---|
| `property_id` | UUID | No | Restricted |
| `inspection_type` | enum | No | Confidential |
| `scheduled_date` | date/timestamptz | Conditional | Confidential |
| `completed_date` | date/timestamptz | Conditional | Confidential |
| `property_manager_id` | UUID | Conditional | Restricted |
| `summary` | text | Conditional | Restricted |
| `status` | enum | No | Internal |
| `follow_up_date` | date | Conditional | Confidential |

---

# 45. Inspection finding

## Entity

```text
inspection_findings
```

| Field | Type | Nullable | Meaning |
|---|---|---:|---|
| `inspection_id` | UUID | No | Parent inspection |
| `category` | enum | No | Finding type |
| `severity` | enum | No | low, medium, high, critical |
| `description` | text | No | Finding details |
| `status` | enum | No | open, resolved |
| `maintenance_request_id` | UUID | Conditional | Linked request |

---

# 46. Maintenance request

## Entity

```text
maintenance_requests
```

| Field | Type | Nullable | Unit/Sensitivity |
|---|---|---:|---|
| `property_id` | UUID | No | Restricted |
| `category` | enum | No | Confidential |
| `severity` | enum | No | Confidential |
| `description` | text | No | Restricted |
| `status` | enum | No | Internal |
| `estimated_cost` | money | Conditional | AUD |
| `actual_cost` | money | Conditional | AUD |
| `due_date` | date | Conditional | Confidential |
| `completed_at` | timestamptz | Conditional | Internal |
| `linked_expense_id` | UUID | Conditional | Internal |

---

# 47. Property manager

## Entity

```text
property_managers
```

| Field | Type | Nullable | Sensitivity |
|---|---|---:|---|
| `household_id` | UUID | No | Restricted |
| `business_name` | text | No | Confidential |
| `contact_name` | text | Conditional | Restricted |
| `email` | text | Conditional | Restricted |
| `phone` | text | Conditional | Restricted |
| `abn` | text | Conditional | Confidential |
| `verification_status` | enum | No | Internal |

---

# 48. Management agreement

## Entity

```text
management_agreements
```

| Field | Type | Nullable | Unit/Sensitivity |
|---|---|---:|---|
| `property_id` | UUID | No | Restricted |
| `property_manager_id` | UUID | No | Restricted |
| `agreement_start` | date | No | Confidential |
| `agreement_end` | date | Conditional | Confidential |
| `management_fee_rate` | decimal | Conditional | Ratio |
| `leasing_fee` | money/decimal | Conditional | AUD or ratio |
| `notice_period_days` | integer | Conditional | Days |
| `services` | JSONB | Conditional | Confidential |
| `document_id` | UUID | Conditional | Restricted |

---

# 49. Learning profile

## Entity

```text
learning_profiles
```

| Field | Type | Nullable | Meaning |
|---|---|---:|---|
| `user_id` | UUID | No | User |
| `knowledge_level` | enum | No | beginner, intermediate, advanced |
| `learning_goals` | JSONB | No | User goals |
| `preferred_style` | enum | Conditional | Learning preference |
| `last_activity_at` | timestamptz | Conditional | Last activity |

---

# 50. Learning progress

## Entity

```text
learning_progress
```

| Field | Type | Nullable | Meaning |
|---|---|---:|---|
| `user_id` | UUID | No | User |
| `module_id` | UUID | No | Module |
| `status` | enum | No | not_started, in_progress, completed |
| `progress_percent` | decimal | No | 0–1 |
| `score` | decimal | Conditional | 0–1 |
| `completed_at` | timestamptz | Conditional | Completion |

---

# 51. Notification

## Entity

```text
notifications
```

| Field | Type | Nullable | Sensitivity |
|---|---|---:|---|
| `user_id` | UUID | No | Restricted |
| `notification_type` | enum | No | Confidential |
| `title` | text | No | Confidential |
| `body` | text | No | Confidential |
| `priority` | enum | No | Internal |
| `related_entity_type` | text | Conditional | Internal |
| `related_entity_id` | UUID | Conditional | Restricted |
| `read_at` | timestamptz | Conditional | Internal |
| `delivered_at` | timestamptz | Conditional | Internal |
| `deduplication_key` | text | Conditional | Internal |

Sensitive details should be minimised in push content.

---

# 52. Device registration

## Entity

```text
devices
```

| Field | Type | Nullable | Sensitivity |
|---|---|---:|---|
| `user_id` | UUID | No | Restricted |
| `platform` | enum | No | Internal |
| `push_token_encrypted` | encrypted text | No | Restricted |
| `app_version` | text | Conditional | Internal |
| `last_seen_at` | timestamptz | Conditional | Internal |
| `status` | enum | No | Internal |

---

# 53. Subscription

## Entity

```text
subscriptions
```

| Field | Type | Nullable | Sensitivity |
|---|---|---:|---|
| `user_id` | UUID | No | Restricted |
| `provider` | text | No | Internal |
| `provider_customer_id` | text | Conditional | Restricted |
| `provider_subscription_id` | text | Conditional | Restricted |
| `plan_id` | text | No | Confidential |
| `status` | enum | No | Confidential |
| `current_period_start` | timestamptz | Conditional | Confidential |
| `current_period_end` | timestamptz | Conditional | Confidential |
| `cancel_at_period_end` | boolean | No | Confidential |

---

# 54. Entitlement

## Entity

```text
entitlements
```

| Field | Type | Nullable | Meaning |
|---|---|---:|---|
| `user_id` | UUID | No | User |
| `entitlement_code` | text | No | Feature entitlement |
| `status` | enum | No | active, inactive, grace |
| `valid_from` | timestamptz | Conditional | Start |
| `valid_until` | timestamptz | Conditional | End |
| `source` | text | No | Subscription or admin grant |

---

# 55. Usage record

## Entity

```text
usage_records
```

| Field | Type | Nullable | Unit |
|---|---|---:|---|
| `user_id` | UUID | No | — |
| `usage_type` | enum | No | — |
| `quantity` | decimal/integer | No | Metric-specific |
| `period_start` | timestamptz | No | — |
| `period_end` | timestamptz | No | — |
| `execution_id` | UUID | Conditional | — |

---

# 56. Audit event

## Entity

```text
audit_events
```

| Field | Type | Nullable | Sensitivity |
|---|---|---:|---|
| `event_id` | UUID | No | Internal |
| `actor_type` | enum | No | Internal |
| `actor_id` | UUID/text | Conditional | Restricted |
| `household_id` | UUID | Conditional | Restricted |
| `action` | text | No | Internal |
| `resource_type` | text | No | Internal |
| `resource_id` | UUID/text | Conditional | Restricted |
| `outcome` | enum | No | Internal |
| `trace_id` | UUID/text | No | Internal |
| `metadata` | JSONB | Conditional | Restricted |
| `occurred_at` | timestamptz | No | Internal |

Audit records are append-only.

---

# 57. Event outbox

## Entity

```text
event_outbox
```

| Field | Type | Nullable | Meaning |
|---|---|---:|---|
| `event_id` | UUID | No | Event ID |
| `event_type` | text | No | Versioned event name |
| `event_version` | text | No | Schema version |
| `aggregate_type` | text | No | Aggregate |
| `aggregate_id` | UUID/text | No | Aggregate ID |
| `aggregate_version` | integer/text | No | Ordering version |
| `payload` | JSONB | No | Event payload |
| `trace_id` | UUID/text | No | Trace |
| `status` | enum | No | pending, published, failed |
| `publication_attempts` | integer | No | Attempt count |

---

# 58. Consumer inbox

## Entity

```text
event_inbox
```

| Field | Type | Nullable | Meaning |
|---|---|---:|---|
| `consumer_name` | text | No | Consumer |
| `event_id` | UUID | No | Processed event |
| `processed_at` | timestamptz | No | Completion |
| `result` | enum | No | succeeded, ignored, failed |
| `attempt_count` | integer | No | Attempts |

---

# 59. Source registry

## Entity

```text
data.source_registry
```

| Field | Type | Nullable | Meaning |
|---|---|---:|---|
| `source_id` | text | No | Stable source ID |
| `source_name` | text | No | Display name |
| `source_owner` | text | No | Publishing body |
| `jurisdiction` | text | Conditional | Geographic scope |
| `access_method` | enum | No | API, bulk, feed, manual |
| `licence_name` | text | Conditional | Licence |
| `commercial_use_allowed` | boolean | Conditional | Contract-derived |
| `redistribution_allowed` | boolean | Conditional | Contract-derived |
| `raw_storage_allowed` | boolean | Conditional | Contract-derived |
| `maximum_retention_hours` | integer | Conditional | Contract-derived |
| `attribution_text` | text | Conditional | Required attribution |
| `status` | enum | No | Registry lifecycle |

---

# 60. Dataset version

## Entity

```text
data.dataset_versions
```

| Field | Type | Nullable | Meaning |
|---|---|---:|---|
| `dataset_id` | text | No | Dataset |
| `dataset_version` | text | No | Version |
| `source_id` | text | No | Source |
| `effective_date` | date | Conditional | Data effective date |
| `published_at` | timestamptz/date | Conditional | Source publication |
| `ingested_at` | timestamptz | No | Ingestion |
| `published_to_consumers_at` | timestamptz | Conditional | Internal publication |
| `quality_score` | decimal | Conditional | 0–1 |
| `freshness_status` | enum | No | current, aging, stale, unknown |
| `status` | enum | No | staged, published, rolled_back |

---

# 61. Pipeline job

## Entity

```text
data.pipeline_jobs
```

| Field | Type | Nullable | Meaning |
|---|---|---:|---|
| `job_id` | UUID | No | Job |
| `pipeline_id` | text | No | Pipeline |
| `pipeline_version` | text | No | Code version |
| `source_id` | text | No | Source |
| `status` | enum | No | queued, running, succeeded, failed |
| `started_at` | timestamptz | Conditional | Start |
| `completed_at` | timestamptz | Conditional | End |
| `rows_extracted` | bigint | Conditional | Count |
| `rows_staged` | bigint | Conditional | Count |
| `rows_published` | bigint | Conditional | Count |
| `rows_rejected` | bigint | Conditional | Count |
| `error_code` | text | Conditional | Controlled error |
| `trace_id` | text | No | Trace |

---

# 62. Data quality result

## Entity

```text
data.quality_results
```

| Field | Type | Nullable | Meaning |
|---|---|---:|---|
| `dataset_id` | text | No | Dataset |
| `dataset_version` | text | No | Version |
| `rule_id` | text | No | Quality rule |
| `severity` | enum | No | critical, error, warning, info |
| `status` | enum | No | passed, failed |
| `observed_value` | decimal/text | Conditional | Actual |
| `threshold` | decimal/text | Conditional | Expected |
| `affected_record_count` | bigint | Conditional | Count |
| `details` | JSONB | Conditional | Diagnostic |

---

# 63. Field nullability rules

Use null only when:

- value is unknown;
- value is not supplied;
- value is not applicable;
- value has not yet been observed.

Where the distinction matters, add:

```text
value_status
```

Recommended values:

```text
known
unknown
not_applicable
not_available
withheld
stale
invalid
```

Do not use:

- empty string for unknown;
- zero for missing;
- false for unknown boolean.

---

# 64. Money type

Recommended application model:

```json
{
  "amount": "650.00",
  "currency": "AUD"
}
```

Database:

```text
amount numeric(18,2)
currency char(3)
```

All calculations must reject currency mismatch unless explicit conversion is implemented.

---

# 65. Rate type

Internal:

```text
0.0625
```

Display:

```text
6.25%
```

Do not store `6.25` when the semantic value is `0.0625`.

---

# 66. Date and timestamp rules

Use:

```text
date
timestamptz
```

Date-only examples:

- settlement date;
- lease expiry;
- valuation date.

Timestamp examples:

- record creation;
- AI completion;
- event publication;
- email delivery.

Store timestamps in UTC.

---

# 67. Enum governance

Enums must:

- have documented values;
- tolerate future extension in clients;
- not be repurposed;
- be versioned if meaning changes;
- include `unknown` only when semantically useful.

---

# 68. JSONB governance

Use JSONB for:

- structured assumptions;
- evidence collections;
- provider-specific metadata;
- versioned output payloads.

Do not use JSONB to avoid defining stable core fields.

Every important JSONB structure requires a schema.

---

# 69. Derived field governance

Derived values must include or be traceable to:

```text
calculation_version
input_version
calculated_at
```

Examples:

- equity;
- LVR;
- yield;
- cash flow;
- concentration;
- confidence;
- match score;
- completeness.

Do not allow users to edit derived fields directly.

---

# 70. Provenance

Every material value should support:

```text
source_type
source_id
source_record_id
document_id
page_reference
observed_at
published_at
user_confirmed_at
```

The exact fields depend on the entity.

---

# 71. Data ownership by service

| Data domain | Owning service |
|---|---|
| Users and households | Backend |
| Properties and finance | Backend |
| Calculations and scenarios | Backend |
| AI executions and cache | AI platform |
| Recommendations and drafts | Backend, created through controlled AI tools |
| Raw and curated external data | Data platform |
| Billing and entitlements | Backend |
| Authentication identities | Supabase Auth |
| Files | Supabase Storage with backend metadata |
| Audit events | Backend/security-controlled storage |

---

# 72. Cross-service rules

- frontend reads through backend APIs;
- frontend does not query unrestricted database tables;
- AI reads through backend tools;
- AI does not own property records;
- data platform publishes canonical and curated datasets;
- backend consumes approved curated data;
- service-owned tables are not directly mutated by another service.

---

# 73. Retention classes

Recommended:

```text
transient
operational_short
product_active
historical
audit
security
contract_controlled
user_deletion_required
```

Actual retention periods must be defined in `privacy-and-retention.md`.

---

# 74. Data quality rules

Each major field should have:

- type validation;
- range validation;
- cross-field validation;
- source validation;
- freshness validation;
- duplicate detection;
- unit validation.

Examples:

```text
ownership percentages total 1.0
settlement date not before contract date
lease periods do not overlap without confirmation
property value positive
loan balance non-negative
LVR denominator positive
```

---

# 75. Indexing guidance

Index commonly queried fields:

```text
household_id
property_id
user_id
status
created_at
updated_at
effective_date
source_id
dataset_version
canonical_property_id
provider_listing_id
```

Use composite indexes based on real query patterns.

Use spatial indexes for geometry.

---

# 76. Data dictionary maintenance

Every schema migration must update:

- this dictionary;
- database models;
- API schemas;
- OpenAPI;
- event schemas;
- tests;
- migration documentation.

No production field should exist without a dictionary entry.

---

# 77. Documentation structure

Maintain:

```text
docs/data/
├── data-dictionary.md
├── enums.md
├── money-and-units.md
├── provenance.md
├── sensitivity.md
├── retention-classes.md
└── json-schemas/
```

---

# 78. Codex rules

Codex must:

1. use the defined field names;
2. preserve source-of-truth boundaries;
3. use Decimal for money;
4. use UTC timestamps;
5. distinguish null from zero;
6. classify sensitivity;
7. define provenance;
8. version derived calculations;
9. avoid unstructured JSONB for stable fields;
10. add validation;
11. add indexes based on usage;
12. update the dictionary with migrations;
13. prevent cross-service direct mutation;
14. add field-level tests;
15. report undocumented fields as incomplete.

---

# 79. Definition of done

The data dictionary is complete when:

- all major entities are documented;
- every important field has type and meaning;
- units are explicit;
- nullability is defined;
- source of truth is defined;
- sensitivity is classified;
- ownership is defined;
- derived values are versioned;
- provenance is traceable;
- provider restrictions are represented;
- retention classes are available;
- API, database, and event schemas align;
- tests validate field rules;
- no production field is undocumented.

---

# 80. Final data principle

For every TrackMyProps field, the platform must be able to answer:

```text
What does it mean?
What type and unit does it use?
May it be null?
Who owns it?
Where did it come from?
How sensitive is it?
Can a user edit it?
How long is it retained?
Is it authoritative or derived?
```

If those questions cannot be answered, the field is not ready for production.
