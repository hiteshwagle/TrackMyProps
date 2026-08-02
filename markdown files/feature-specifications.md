# TrackMyProps Feature Specifications

## 1. Purpose

This document defines the detailed functional specifications for the major TrackMyProps features.

It applies across:

```text
TrackMyProps/
├── frontend/
├── backend/
├── ai-platform/
└── data-platform/
```

It covers:

- user goals;
- scope;
- workflows;
- business rules;
- data requirements;
- permissions;
- dependencies;
- errors and edge cases;
- observability;
- acceptance criteria;
- release readiness.

This document must remain consistent with:

```text
architecture.md
database.md
api-design.md
contracts.md
permissions-matrix.md
agent-catalogue.md
calculation-specification.md
security.md
testing-strategy.md
```

---

# 2. Feature specification template

Every feature should define:

```text
feature_id
feature_name
objective
primary_users
dependencies
permissions
data requirements
workflow
business rules
UI states
errors
events
metrics
security
acceptance criteria
out of scope
```

---

# 3. Authentication and onboarding

## Feature ID

```text
AUTH-001
```

## Objective

Allow a user to create an account, authenticate securely, complete onboarding, and enter the TrackMyProps application.

## Primary users

- new user;
- returning user.

## Supported authentication

- email and password;
- magic link where enabled;
- Google;
- Apple.

## Workflow

```text
Open app
    ↓
Choose sign-up or sign-in
    ↓
Authenticate
    ↓
Verify email where required
    ↓
Accept terms and privacy
    ↓
Create or join household
    ↓
Complete onboarding preferences
    ↓
Enter dashboard
```

## Required onboarding data

```text
display_name
timezone
country
investment_experience
primary_goal
notification_preferences
```

## Business rules

- authentication must be handled by Supabase Auth;
- unverified users may be restricted from sensitive actions;
- onboarding can be resumed;
- users must not be forced to enter a property before accessing the app;
- legal acceptance must be versioned;
- logout must clear local user state and query caches.

## Edge cases

- expired magic link;
- duplicate email;
- OAuth account conflict;
- interrupted onboarding;
- deleted household invitation;
- revoked session;
- offline state.

## Acceptance criteria

- user can register;
- user can sign in;
- user can sign out;
- session persists securely;
- onboarding resumes after interruption;
- legal acceptance is stored;
- unauthenticated routes are protected;
- local data from a prior user is cleared on logout.

---

# 4. Household management

## Feature ID

```text
HOUSE-001
```

## Objective

Allow users to create and manage a household that owns the portfolio context.

## Workflow

```text
Create household
    ↓
Name household
    ↓
Set owner
    ↓
Invite members
    ↓
Assign roles
```

## Rules

- every household has exactly one active owner unless ownership transfer is in progress;
- roles follow `permissions-matrix.md`;
- member invitations expire;
- removed members lose access immediately;
- permission caches must be invalidated;
- household deletion requires owner approval and re-authentication.

## Acceptance criteria

- owner can create household;
- owner can invite member;
- invitee can accept;
- role change takes effect immediately;
- removed user cannot access household data;
- cross-household access is denied;
- all membership changes are audited.

---

# 5. Property creation and management

## Feature ID

```text
PROP-001
```

## Objective

Allow users to create and maintain an owned property record.

## Core fields

```text
address
property_type
bedrooms
bathrooms
car_spaces
land_area
building_area
year_built
ownership_status
notes
```

## Workflow

```text
Add property
    ↓
Search or enter address
    ↓
Confirm address
    ↓
Enter property attributes
    ↓
Enter acquisition and ownership details
    ↓
Save
    ↓
Display property dashboard
```

## Rules

- address may be provider matched or manually entered;
- provider match confidence must be stored;
- duplicate property warning should be shown;
- manual data remains user-provided until independently verified;
- archived properties remain available in history;
- deletion is protected and cascades through approved deletion workflow.

## UI states

- empty portfolio;
- address search;
- manual address;
- duplicate warning;
- saving;
- success;
- validation error;
- provider unavailable.

## Acceptance criteria

- user can create property;
- duplicate warning appears for likely duplicate;
- property is scoped to household;
- user can edit property;
- user can archive and restore property;
- financial dashboard initially shows missing-data prompts;
- creation event and audit record are written.

---

# 6. Acquisition details

## Feature ID

```text
PROP-002
```

## Objective

Capture property purchase and settlement information.

## Fields

```text
purchase_price
contract_date
settlement_date
deposit
stamp_duty
conveyancing_fees
buyers_agent_fees
building_and_pest_fees
loan_fees
initial_repairs
other_acquisition_costs
```

## Rules

- deposit must not be double counted in acquisition cost;
- amounts use AUD unless multi-currency is introduced;
- dates must be valid;
- settlement date cannot precede contract date unless explicitly corrected;
- cost base is shown as an estimate only.

## Acceptance criteria

- total acquisition cost uses the documented formula;
- user can edit costs;
- calculation version is stored;
- missing optional costs do not block save;
- material changes trigger recalculation.

---

# 7. Ownership structure

## Feature ID

```text
PROP-003
```

## Objective

Record legal or economic ownership structure for portfolio modelling.

## Supported owner types

```text
individual
joint
company
trust
superannuation_fund
other
```

## Rules

- ownership percentages must total 100% for active records;
- ownership structure does not automatically grant application access;
- legal and tax implications are not inferred;
- sensitive entity fields are restricted.

## Acceptance criteria

- user can add multiple ownership records;
- percentage validation works;
- incomplete totals are clearly flagged;
- ownership changes are audited;
- advisor access does not arise automatically from ownership.

---

# 8. Loan management

## Feature ID

```text
LOAN-001
```

## Objective

Track loans secured against properties.

## Fields

```text
lender
facility_name
loan_type
rate_type
current_balance
original_amount
interest_rate
repayment_amount
repayment_frequency
remaining_term
interest_only_end_date
fixed_rate_expiry
offset_balance
available_redraw
loan_fees
security_properties
```

## Workflow

```text
Add loan
    ↓
Select secured property or properties
    ↓
Enter loan terms
    ↓
Validate
    ↓
Calculate repayment estimate
    ↓
Save
```

## Rules

- cross-collateralised facilities must not be double counted;
- offset and redraw are distinct;
- repayment estimates are labelled estimates;
- loan balance cannot be negative;
- fixed-rate expiry can create reminders;
- user-entered lender data is not verified unless linked to a provider.

## Acceptance criteria

- user can create, edit, and delete a loan;
- repayment estimate follows formula;
- interest-only calculation works;
- offset reduces interest estimate but not legal balance;
- portfolio debt avoids double counting;
- loan changes trigger recalculation and AI invalidation.

---

# 9. Income management

## Feature ID

```text
FIN-001
```

## Objective

Track rent and other property income.

## Income types

```text
rent
parking
storage
solar
reimbursement
other
```

## Rules

- recurring and one-off income are supported;
- frequency conversion follows calculation specification;
- current rent may be linked to an active lease;
- asking rent is not treated as achieved rent;
- vacancy and arrears are recorded separately.

## Acceptance criteria

- user can add recurring rent;
- annualised income is correct;
- one-off income is included only in the relevant period;
- lease rent and manual rent conflicts are shown;
- changes trigger recalculation.

---

# 10. Expense management

## Feature ID

```text
FIN-002
```

## Objective

Track recurring and one-off property expenses.

## Categories

```text
council_rates
water_rates
strata
insurance
property_management
repairs
maintenance
land_tax
accounting
legal
utilities
advertising
leasing_fees
capital_improvement
other
```

## Rules

- operating and capital expenses must be separated;
- financing costs must be separated where required;
- recurring expenses use frequency conversion;
- receipts and documents may be attached;
- negative expense entries require explicit refund or correction classification.

## Acceptance criteria

- user can create and categorise expense;
- annualised expense is correct;
- capital expense is excluded from NOI;
- expense history is filterable;
- material expense change can trigger a recommendation.

---

# 11. Lease management

## Feature ID

```text
LEASE-001
```

## Objective

Track lease terms, rent, milestones, and vacancy.

## Fields

```text
start_date
end_date
weekly_rent
bond
payment_frequency
tenant_reference
property_manager_reference
rent_review_date
status
```

## Rules

- tenant personal data must be minimised;
- overlapping active leases require confirmation or rejection;
- lease expiry and rent review can create reminders;
- ended leases remain historical;
- vacancy periods must not overlap active lease periods.

## Acceptance criteria

- user can create and update lease;
- active lease rent feeds cash-flow calculation;
- upcoming expiry is surfaced;
- vacancy start and end are recorded;
- lease events are emitted.

---

# 12. Valuation management

## Feature ID

```text
VAL-001
```

## Objective

Store property valuations from different sources and select a preferred current value.

## Valuation types

```text
user_estimate
agent_appraisal
bank_valuation
certified_valuation
automated_valuation
```

## Rules

- every valuation includes source and date;
- AVMs include provider, range, confidence, and disclaimer where available;
- preferred valuation is selected according to user choice and policy;
- stale valuations are flagged;
- a valuation is not a guaranteed sale price.

## Acceptance criteria

- user can add valuation;
- user can select preferred valuation;
- equity and LVR update after selection;
- stale status is visible;
- provider restrictions are respected.

---

# 13. Property financial dashboard

## Feature ID

```text
DASH-001
```

## Objective

Provide a current financial view for one property.

## Metrics

```text
estimated_value
loan_balance
equity
LVR
gross_yield
net_yield
annual_income
annual_expenses
annual_cash_flow
monthly_cash_flow
weekly_cash_flow
```

## UI requirements

- metric definitions available;
- source and calculation date;
- missing-data prompts;
- trend charts;
- calculation version;
- clear distinction between actual and estimated values.

## Acceptance criteria

- all metrics match calculation specification;
- missing metrics show unavailable, not zero;
- stale valuation warning is visible;
- user can navigate to edit contributing records;
- chart period filters work.

---

# 14. Portfolio dashboard

## Feature ID

```text
DASH-002
```

## Objective

Provide a consolidated view of the household portfolio.

## Metrics

```text
portfolio_value
portfolio_debt
portfolio_equity
portfolio_LVR
portfolio_income
portfolio_expenses
portfolio_cash_flow
weighted_gross_yield
weighted_net_yield
property_count
```

## Additional views

- property contribution;
- concentration;
- geographic distribution;
- property-type distribution;
- upcoming milestones;
- latest recommendations.

## Acceptance criteria

- cross-collateralised debt is counted once;
- weighted yields use totals;
- portfolio totals equal unique property/facility sums;
- property contribution is visible;
- dashboard reflects latest successful snapshot.

---

# 15. Historical snapshots

## Feature ID

```text
PERF-001
```

## Objective

Preserve and display property and portfolio performance over time.

## Snapshot triggers

- scheduled;
- property recalculation;
- valuation change;
- loan change;
- month-end;
- material portfolio change.

## Rules

- snapshots are immutable;
- calculation version is stored;
- input version is stored;
- historical data must remain reproducible.

## Acceptance criteria

- user can view trends;
- old snapshots do not change;
- gaps are identified;
- calculation-version changes are traceable.

---

# 16. Suburb overview

## Feature ID

```text
DATA-001
```

## Objective

Provide a source-backed suburb profile.

## Sections

- demographics;
- market;
- rental;
- schools;
- crime;
- infrastructure;
- planning;
- hazards;
- freshness;
- sources.

## Rules

- every section shows source and effective date;
- unavailable sections are explicit;
- suburb boundaries are versioned;
- demographic data must not be used for discriminatory recommendations.

## Acceptance criteria

- user can search and open suburb;
- source dates are visible;
- stale sections are flagged;
- metrics can be filtered by property type where available;
- geography edition is preserved.

---

# 17. Suburb comparison

## Feature ID

```text
DATA-002
```

## Objective

Compare multiple suburbs on compatible metrics.

## Rules

- periods, property types, and bedroom categories must align;
- incompatible metrics are not compared silently;
- source differences are disclosed;
- comparison should allow user-selected priorities.

## Acceptance criteria

- user can compare at least two suburbs;
- mismatched data shows warning;
- comparable metrics render side by side;
- sources and freshness remain visible.

---

# 18. AI property analysis

## Feature ID

```text
AI-001
```

## Objective

Generate an evidence-backed property investment analysis.

## Workflow

```text
User requests analysis
    ↓
Backend validates access and entitlement
    ↓
AI execution created
    ↓
Specialist agents run
    ↓
Evidence and freshness validated
    ↓
Final synthesis
    ↓
Recommendation persisted
    ↓
Frontend notified
```

## Output sections

- summary;
- facts;
- calculations;
- suburb context;
- market context;
- strengths;
- weaknesses;
- risks;
- missing information;
- due-diligence questions;
- suggested actions;
- confidence;
- evidence;
- freshness.

## Rules

- final synthesis always executes;
- underlying specialist results may be cached;
- user-specific context cannot be shared;
- calculations come from backend tools;
- no guaranteed outcomes;
- no professional inspection claims.

## Acceptance criteria

- execution is asynchronous;
- progress is visible;
- result includes evidence and confidence;
- missing data is explicit;
- invalid output fails safely;
- user can retry;
- cost and latency are tracked.

---

# 19. Prediction

## Feature ID

```text
AI-002
```

## Objective

Provide bounded forecasts using validated models.

## Supported outputs

- rental growth range;
- capital growth range;
- vacancy risk;
- repayment stress;
- cash-flow sensitivity.

## Rules

- LLM does not generate authoritative numeric forecast;
- lower, central, and upper values are shown;
- horizon and model version are visible;
- six-hour cache applies;
- prediction is labelled estimate, not guarantee.

## Acceptance criteria

- forecast includes range and confidence;
- inputs and data versions are traceable;
- cache invalidates on material input change;
- stale data reduces confidence;
- no false precision.

---

# 20. Portfolio performance analysis

## Feature ID

```text
AI-003
```

## Objective

Identify portfolio strengths, weaknesses, contribution, and alignment.

## Output

- portfolio health;
- outperformers;
- underperformers;
- concentration;
- leverage;
- cash-flow pressure;
- diversification;
- benchmark context;
- suggested reviews.

## Rules

- underperformance cannot rely on one weak metric alone;
- strategy context must be considered;
- benchmark compatibility must be checked.

## Acceptance criteria

- every conclusion links to supporting metrics;
- concentration is calculated deterministically;
- missing strategy is requested or disclosed;
- user can acknowledge or dismiss recommendations.

---

# 21. Risk analysis

## Feature ID

```text
AI-004
```

## Objective

Identify material financial, market, property, and data risks.

## Risk categories

- rate;
- LVR;
- vacancy;
- liquidity;
- concentration;
- flood;
- bushfire;
- climate;
- supply;
- planning;
- insurance;
- data quality.

## Rules

- missing data does not equal low risk;
- severity and confidence are separate;
- mitigations are suggestions, not guarantees;
- professional review is recommended where required.

## Acceptance criteria

- each risk includes category, severity, confidence, evidence, and mitigation;
- missing evidence is visible;
- no-risk claims require adequate evidence;
- hazards preserve source methodology.

---

# 22. Sell, hold, and refinance scenarios

## Feature ID

```text
SCEN-001
```

## Objective

Allow users to model and compare strategic options.

## Supported scenarios

- hold;
- sell;
- refinance;
- sell and repay another loan;
- purchase;
- rate sensitivity;
- vacancy sensitivity;
- sale-price sensitivity.

## Rules

- all numeric outputs come from calculation engine;
- assumptions are editable;
- tax is excluded unless dedicated module exists;
- break costs are shown as missing when unknown;
- scenario does not modify live records.

## Acceptance criteria

- user can save assumptions;
- user can run scenario;
- results show calculation version;
- scenarios can be compared;
- missing inputs block or qualify result;
- sensitivity tables recalculate correctly.

---

# 23. Watchlists

## Feature ID

```text
DISC-001
```

## Objective

Allow users to define property-search criteria.

## Criteria

```text
suburbs
budget
property_type
bedrooms
bathrooms
minimum_yield
growth_preference
school_access
transport
risk_constraints
portfolio_fit
```

## Rules

- watchlist criteria must avoid prohibited demographic discrimination;
- criteria are versioned;
- listing matches are recalculated when criteria change.

## Acceptance criteria

- user can create and edit watchlist;
- active listings can be matched;
- disqualifiers are visible;
- watchlist deletion removes future matching but preserves history where required.

---

# 24. Listing discovery

## Feature ID

```text
DISC-002
```

## Objective

Surface licensed property listings that match user criteria.

## Rules

- listing data must come from approved source;
- listing status must refresh;
- withdrawn listings are handled;
- image and display rights are enforced;
- match score is explainable;
- provider disclaimers are displayed.

## Acceptance criteria

- user can view matches;
- source and update time are visible;
- listing can be shortlisted or rejected;
- no unauthorised scraping is used;
- expired or withdrawn listings are marked.

---

# 25. Listing analysis

## Feature ID

```text
DISC-003
```

## Objective

Extract and analyse listing details before deeper due diligence.

## Output

- listing facts;
- asking method;
- auction;
- agent;
- inconsistencies;
- missing details;
- questions;
- prompt-injection warning where detected.

## Acceptance criteria

- listing text is treated as untrusted;
- extracted facts reference source;
- missing details are explicit;
- embedded instructions cannot trigger tools;
- listing updates invalidate stale analysis.

---

# 26. EOI drafting

## Feature ID

```text
COMM-001
```

## Objective

Create an editable expression-of-interest draft.

## Required fields

```text
listing
recipient
offer_amount
finance_status
deposit
settlement_preference
conditions
expiry
user_contact_details
```

## Rules

- AI may draft only;
- missing fields must be shown;
- finance approval cannot be invented;
- recipient must be confirmed;
- draft version is tracked;
- approval is required before send.

## Acceptance criteria

- user can generate draft;
- missing fields are identified;
- user can edit subject and body;
- draft is never auto-sent;
- provider or listing content cannot change recipient silently.

---

# 27. Communication approval and send

## Feature ID

```text
COMM-002
```

## Objective

Allow an authorised user to approve and send a communication safely.

## Workflow

```text
Review draft
    ↓
Confirm recipient
    ↓
Confirm final subject and body
    ↓
Approve version
    ↓
Send with idempotency key
    ↓
Track delivery
```

## Rules

- owner approves and sends by default;
- body, subject, recipient, offer, or conditions change invalidates approval;
- duplicate send is prevented;
- all sends are audited;
- provider webhook signatures are verified.

## Acceptance criteria

- unapproved draft cannot send;
- changed draft invalidates approval;
- duplicate request does not duplicate email;
- delivery status is visible;
- failure is retryable only according to policy.

---

# 28. Document upload

## Feature ID

```text
DOC-001
```

## Objective

Allow secure upload and storage of property documents.

## Workflow

```text
Request signed upload
    ↓
Upload directly to private storage
    ↓
Complete upload
    ↓
Validate file
    ↓
Malware scan
    ↓
Ready for processing
```

## Rules

- private storage;
- generated storage path;
- MIME, extension, magic-byte, and size validation;
- short-lived signed URL;
- no permanent public URL;
- malware scan required before analysis where implemented.

## Acceptance criteria

- unauthorised user cannot upload;
- unsupported file is rejected;
- expired signed URL fails;
- uploaded file is private;
- document metadata is stored;
- audit event is written.

---

# 29. Document analysis

## Feature ID

```text
DOC-002
```

## Objective

Extract and explain key information from approved documents.

## Rules

- document content is untrusted;
- page references are required;
- missing or unreadable pages are identified;
- extracted values require user review before updating records;
- legal and structural conclusions are limited.

## Acceptance criteria

- user can request analysis;
- output includes page references;
- prompt injection is blocked;
- extracted value is not silently applied;
- deleting document removes derived text, embeddings, and cache.

---

# 30. Inspection management

## Feature ID

```text
PM-001
```

## Objective

Track property inspections and findings.

## Fields

```text
inspection_type
scheduled_date
completed_date
property_manager
summary
findings
media
follow_up_date
```

## Acceptance criteria

- inspection can be created;
- findings can be added;
- media can be uploaded;
- overdue follow-up is surfaced;
- viewer cannot edit;
- events are emitted.

---

# 31. Maintenance management

## Feature ID

```text
PM-002
```

## Objective

Track maintenance requests from issue to completion.

## Statuses

```text
open
triaged
approved
in_progress
waiting
completed
cancelled
```

## Acceptance criteria

- user can create request;
- status history is preserved;
- costs can link to expense;
- overdue requests are visible;
- completion records timestamp and actor.

---

# 32. Property manager record

## Feature ID

```text
PM-003
```

## Objective

Store property manager and agreement details.

## Fields

```text
business_name
contact_name
email
phone
management_fee
leasing_fee
agreement_start
agreement_end
notice_period
services
```

## Rules

- data is user-provided unless independently verified;
- ABN validation may be added later;
- sensitive contact data is restricted;
- agreement expiry can create reminders.

## Acceptance criteria

- user can create and update record;
- agreement dates are validated;
- fee information can inform expense estimates;
- reminders are generated.

---

# 33. Investment tutor

## Feature ID

```text
LEARN-001
```

## Objective

Teach property investment concepts progressively.

## Features

- knowledge assessment;
- learning path;
- lessons;
- examples;
- quizzes;
- concept mastery;
- revision;
- personalised examples.

## Rules

- current legal or tax facts require approved sources;
- user-specific examples are educational;
- learning memory is reviewable and deletable.

## Acceptance criteria

- user can start path;
- progress is saved;
- quiz feedback is consistent;
- lesson adapts to knowledge level;
- user can reset progress.

---

# 34. Property management tutor

## Feature ID

```text
LEARN-002
```

## Objective

Teach practical property-management concepts.

## Topics

- choosing manager;
- agreements;
- fees;
- inspections;
- maintenance;
- arrears;
- rent review;
- communication;
- records;
- compliance concepts.

## Acceptance criteria

- tutor adapts to property context;
- current-law uncertainty is disclosed;
- no tenant communication is sent;
- learning progress persists.

---

# 35. Chief Investment Officer briefing

## Feature ID

```text
CIO-001
```

## Objective

Provide a concise, prioritised briefing based on material portfolio changes.

## Sections

```text
what_changed
why_it_matters
what_to_review
confidence
evidence
```

## Rules

- only material items are included;
- duplicates are suppressed;
- dismissed recommendations do not immediately recur;
- no-change briefing is valid;
- notification preferences are respected.

## Acceptance criteria

- briefing can be generated on schedule;
- priority is explainable;
- evidence is linked;
- duplicate alerts are suppressed;
- user can configure frequency.

---

# 36. Notifications

## Feature ID

```text
NOTIF-001
```

## Objective

Deliver relevant app, push, and optional email notifications.

## Notification types

- report ready;
- fixed-rate expiry;
- lease expiry;
- rent review;
- maintenance overdue;
- stale critical data;
- listing match;
- recommendation;
- billing issue.

## Rules

- respect user preferences;
- use quiet hours;
- deduplicate;
- do not expose sensitive details in lock-screen content by default;
- invalid device tokens are removed.

## Acceptance criteria

- notification is delivered;
- read state syncs;
- opt-out works;
- duplicate notification is prevented;
- failure is observable.

---

# 37. Billing and entitlements

## Feature ID

```text
BILL-001
```

## Objective

Control subscription access and usage.

## Features

- subscription status;
- entitlements;
- checkout;
- customer portal;
- usage;
- quotas;
- webhook reconciliation.

## Rules

- backend is authoritative;
- webhook events are idempotent;
- role and entitlement checks are separate;
- grace periods are explicit;
- provider state is reconciled.

## Acceptance criteria

- active subscription grants expected entitlements;
- cancelled subscription updates access correctly;
- duplicate webhook is safe;
- quota is enforced;
- billing failure does not expose sensitive provider data.

---

# 38. Account export

## Feature ID

```text
PRIV-001
```

## Objective

Allow a user to export authorised account and household data.

## Workflow

```text
Request export
    ↓
Re-authenticate if required
    ↓
Generate asynchronously
    ↓
Create short-lived download
    ↓
Audit
```

## Acceptance criteria

- export includes authorised data only;
- another household’s data is excluded;
- download expires;
- export request is audited;
- provider-restricted data is excluded or handled according to licence.

---

# 39. Account and household deletion

## Feature ID

```text
PRIV-002
```

## Objective

Allow secure deletion requests.

## Rules

- own account and household deletion are separate;
- owner approval required for household deletion;
- re-authentication may be required;
- retention exceptions are documented;
- deletion cascades to storage, AI memory, cache, embeddings, device tokens, and derived data where required;
- audit records may be retained according to policy.

## Acceptance criteria

- request is confirmed;
- protected cooldown can be applied;
- cancellation works before execution where allowed;
- deleted user loses access;
- deletion progress is traceable;
- orphaned objects are detected.

---

# 40. Search

## Feature ID

```text
SEARCH-001
```

## Objective

Search properties, suburbs, listings, documents, and recommendations.

## Rules

- search respects permissions;
- private results never cross households;
- result type is explicit;
- provider search restrictions apply;
- sensitive document content is not indexed without approval.

## Acceptance criteria

- user can search authorised resources;
- no unauthorised result appears;
- empty state is useful;
- ranking is stable enough for common queries.

---

# 41. Offline and degraded-mode behaviour

## Feature ID

```text
UX-001
```

## Objective

Provide safe behaviour when network or providers are unavailable.

## Rules

- frontend may show cached non-sensitive data;
- writes are not silently lost;
- stale data is marked;
- AI requests require connectivity;
- provider outage must not fabricate values;
- retries are controlled.

## Acceptance criteria

- offline state is visible;
- cached data is labelled;
- failed writes can be retried;
- duplicate submission is prevented;
- provider outage produces controlled error.

---

# 42. Accessibility

## Feature ID

```text
UX-002
```

## Objective

Make core workflows accessible.

## Requirements

- semantic labels;
- screen-reader support;
- scalable text;
- keyboard support on web;
- adequate touch targets;
- non-colour-only status;
- accessible charts and summaries;
- focus management.

## Acceptance criteria

- core flows are keyboard usable on web;
- important controls have labels;
- screen-reader output is meaningful;
- status is not communicated only through colour.

---

# 43. Security and audit requirements across all features

Every feature must:

- authenticate;
- authorise;
- validate;
- enforce RLS where applicable;
- propagate trace ID;
- redact logs;
- audit sensitive actions;
- handle idempotency where required;
- enforce provider restrictions;
- fail closed.

---

# 44. Feature observability

Every feature should define:

```text
usage_count
success_count
failure_count
duration
abandonment
business outcome
error code
release
```

AI features also require:

```text
cost
tokens
cache
validation
quality
```

Data features also require:

```text
freshness
quality
source
dataset_version
```

---

# 45. Feature release checklist

```text
[ ] Requirements approved
[ ] Data model complete
[ ] API contract complete
[ ] Permissions defined
[ ] Security reviewed
[ ] UI states implemented
[ ] Errors implemented
[ ] Events defined
[ ] Metrics defined
[ ] Tests pass
[ ] Documentation updated
[ ] Feature flag configured
[ ] Rollback available
[ ] Acceptance criteria passed
```

---

# 46. Out-of-scope for initial MVP

Unless separately approved:

- autonomous property purchase;
- autonomous offer submission;
- automatic negotiation sending;
- tax-return preparation;
- legal approval;
- structural diagnosis;
- guaranteed valuation;
- guaranteed investment returns;
- unauthorised website scraping;
- community benchmarking with inadequate sample size;
- multi-country legal support;
- unrestricted advisor access;
- direct AI database mutation.

---

# 47. Codex rules

Codex must:

1. implement features according to this specification;
2. preserve service boundaries;
3. create API and data contracts;
4. enforce permissions;
5. implement all UI states;
6. implement errors and edge cases;
7. emit defined events;
8. add metrics and traces;
9. create tests from acceptance criteria;
10. use feature flags for high-impact features;
11. keep communication approval explicit;
12. use deterministic financial calculations;
13. display data freshness and evidence;
14. document deviations;
15. not claim completion until acceptance criteria pass.

---

# 48. Definition of done

A TrackMyProps feature is complete only when:

- user objective is satisfied;
- workflow is implemented end to end;
- frontend, backend, AI, and data responsibilities are clear;
- permissions are enforced;
- data is validated;
- calculations are correct;
- loading, empty, error, stale, and offline states are handled;
- events and metrics exist;
- security requirements pass;
- tests cover acceptance criteria;
- feature is observable;
- documentation is updated;
- rollback is possible.

---

# 49. Final feature principle

For every TrackMyProps feature, the team must answer:

```text
Who is it for?
What problem does it solve?
What data does it require?
What permissions apply?
What are the business rules?
What happens when data is missing or stale?
What can fail?
How is success measured?
What proves the feature is complete?
```

A feature without clear answers to those questions is not ready to build.
