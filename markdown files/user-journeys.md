# TrackMyProps User Journeys

## 1. Purpose

This document maps the primary end-to-end user journeys for TrackMyProps.

It covers:

- onboarding;
- household setup;
- property creation;
- financial setup;
- portfolio review;
- AI analysis;
- scenario modelling;
- property discovery;
- EOI drafting and approval;
- document analysis;
- learning;
- property management;
- CIO briefings;
- notifications;
- billing;
- export and deletion;
- error, stale-data, and degraded-mode paths.

This document must remain consistent with:

```text
feature-specifications.md
api-design.md
permissions-matrix.md
agent-catalogue.md
calculation-specification.md
security.md
testing-strategy.md
```

---

# 2. Journey design principles

1. Every journey must have a clear user goal.
2. Every step must have an owner: frontend, backend, AI platform, or data platform.
3. Permissions must be checked before sensitive actions.
4. Long-running work must be asynchronous.
5. Missing data must be visible.
6. Stale data must be visible.
7. AI outputs must expose evidence and confidence.
8. Consequential actions require approval.
9. Users must be able to recover from interruption.
10. Empty, loading, error, and offline states must be designed.
11. Journeys should end with a clear next action.
12. Every major journey must be observable and testable.

---

# 3. Journey notation

Use:

```text
[User]
[Frontend]
[Backend]
[AI]
[Data]
[External Provider]
```

Decision points:

```text
◇ Decision
```

Failure paths:

```text
↳ Error or alternative path
```

---

# 4. Journey 1 — New user onboarding

## Goal

Create an account, complete setup, and enter the application.

## Primary actor

```text
New user
```

## Flow

```text
[User] Opens TrackMyProps
    ↓
[Frontend] Shows sign-in and sign-up options
    ↓
[User] Selects email, Google, or Apple
    ↓
[Backend/Supabase] Authenticates
    ↓
◇ Email verification required?
    ├── Yes → [User] verifies email
    └── No → continue
    ↓
[Frontend] Shows legal acceptance
    ↓
[User] Accepts Terms and Privacy Policy
    ↓
[Frontend] Collects display name, timezone, experience, and goals
    ↓
[Backend] Creates user profile
    ↓
◇ Existing household invitation?
    ├── Yes → show invitation
    └── No → offer household creation
    ↓
[User] Creates or joins household
    ↓
[Frontend] Shows onboarding completion
    ↓
[User] Enters empty portfolio dashboard
```

## Recovery paths

- interrupted onboarding resumes from last complete step;
- expired invitation offers refresh or household creation;
- OAuth conflict provides account-linking guidance;
- offline authentication shows retry state;
- session expiry returns to sign-in safely.

## Success criteria

- user is authenticated;
- legal acceptance is versioned;
- user profile exists;
- user belongs to at least one household;
- no prior user state remains on the device;
- empty dashboard provides a clear “Add property” action.

---

# 5. Journey 2 — Create household and invite member

## Goal

Create a shared household and add another user.

## Flow

```text
[Owner] Opens household settings
    ↓
[Frontend] Shows household members
    ↓
[Owner] Selects Invite member
    ↓
[Frontend] Collects email and role
    ↓
[Backend] Validates owner permission
    ↓
[Backend] Creates invitation
    ↓
[Backend] Sends invitation email
    ↓
[Invitee] Opens invitation
    ↓
◇ Invitee authenticated?
    ├── No → sign up or sign in
    └── Yes → continue
    ↓
[Backend] Validates invitation and expiry
    ↓
[Invitee] Accepts
    ↓
[Backend] Creates active household membership
    ↓
[Backend] Emits household.member_added
    ↓
[Frontend] Refreshes member list
```

## Edge cases

- invitation already accepted;
- invitation expired;
- invitee already a member;
- owner attempts to assign unsupported role;
- member removed during acceptance;
- duplicate invitation.

## Success criteria

- member receives correct role;
- RLS access is immediately effective;
- invitation cannot be reused;
- role change is audited;
- removed members immediately lose access.

---

# 6. Journey 3 — Add first property

## Goal

Create the first owned property and establish the portfolio baseline.

## Flow

```text
[User] Selects Add property
    ↓
[Frontend] Opens address search
    ↓
[User] Enters address
    ↓
[Frontend] Calls approved address provider
    ↓
◇ Address match found?
    ├── Yes → user confirms
    └── No → manual address entry
    ↓
[Backend] Checks likely duplicates
    ↓
◇ Potential duplicate?
    ├── Yes → show warning and existing property
    └── No → continue
    ↓
[User] Enters property type and attributes
    ↓
[User] Enters purchase and ownership details or skips
    ↓
[Backend] Validates and creates property
    ↓
[Backend] Emits property.created
    ↓
[Backend] Creates initial financial snapshot where possible
    ↓
[Frontend] Opens property dashboard
    ↓
[Frontend] Shows missing-data checklist
```

## Missing-data checklist may include

```text
loan
current valuation
rent
expenses
lease
ownership
```

## Success criteria

- property is household scoped;
- duplicate warning works;
- manual and provider-derived fields retain provenance;
- creation event is emitted;
- property dashboard renders even with incomplete data.

---

# 7. Journey 4 — Complete property financial setup

## Goal

Add enough financial data to calculate property performance.

## Flow

```text
[User] Opens property checklist
    ↓
[User] Adds loan
    ↓
[Backend] Calculates repayment estimate
    ↓
[User] Adds active lease or rent
    ↓
[User] Adds recurring expenses
    ↓
[User] Adds current valuation
    ↓
[Backend] Recalculates financial summary
    ↓
[Backend] Stores immutable snapshot
    ↓
[Frontend] Displays equity, LVR, yield, and cash flow
    ↓
[Frontend] Shows calculation date, assumptions, and missing fields
```

## Decision points

```text
◇ Cross-collateralised loan?
    ├── Yes → select all secured properties
    └── No → link to one property
```

```text
◇ Active lease available?
    ├── Yes → use lease rent
    └── No → allow user-confirmed rent or estimate with label
```

## Success criteria

- calculations follow specification;
- offset and redraw remain distinct;
- missing values are not treated as zero;
- valuation source and date are visible;
- snapshot can be reproduced.

---

# 8. Journey 5 — Review property dashboard

## Goal

Understand the current financial position of one property.

## Flow

```text
[User] Opens property
    ↓
[Frontend] Loads property, financial summary, valuation, loan, and recent events
    ↓
◇ Data current?
    ├── Yes → show normal dashboard
    ├── Aging → show warning
    └── Stale → show prominent stale-data warning
    ↓
[User] Reviews:
    ├── value
    ├── debt
    ├── equity
    ├── LVR
    ├── yield
    ├── cash flow
    └── trends
    ↓
[User] Selects a metric
    ↓
[Frontend] Shows definition, formula, inputs, assumptions, and version
    ↓
[User] Chooses next action:
    ├── edit data
    ├── request analysis
    ├── create scenario
    └── upload document
```

## Success criteria

- metrics are explainable;
- stale and estimated values are labelled;
- unavailable metrics are not shown as zero;
- user can trace each result to inputs.

---

# 9. Journey 6 — Review portfolio dashboard

## Goal

Understand the consolidated portfolio position.

## Flow

```text
[User] Opens Portfolio
    ↓
[Backend] Retrieves latest portfolio snapshot
    ↓
[Frontend] Displays:
    ├── portfolio value
    ├── debt
    ├── equity
    ├── LVR
    ├── income
    ├── expenses
    ├── cash flow
    ├── weighted yield
    ├── property contribution
    └── concentration
    ↓
[User] Filters by property or time period
    ↓
[Frontend] Shows trends and contribution
    ↓
[User] Opens underperformer or risk card
    ↓
[Frontend] Shows evidence and recommended next action
```

## Success criteria

- shared facilities are counted once;
- totals reconcile with property records;
- weighted yields use totals;
- contribution and concentration are visible;
- stale portfolio snapshots are identified.

---

# 10. Journey 7 — Request AI property analysis

## Goal

Generate a comprehensive evidence-backed analysis.

## Flow

```text
[User] Selects Analyse property
    ↓
[Frontend] Shows scope, estimated usage, and required data
    ↓
[User] Confirms
    ↓
[Backend] Validates:
    ├── authentication
    ├── household permission
    ├── entitlement
    ├── quota
    └── required minimum data
    ↓
[Backend] Creates AI execution
    ↓
[AI] Loads authorised context through backend tools
    ↓
[AI] Runs specialist agents in parallel
    ↓
[AI] Validates freshness and evidence
    ↓
[AI] Performs final synthesis
    ↓
[AI] Validates structured output
    ↓
[Backend] Persists recommendation
    ↓
[Backend] Emits completion event
    ↓
[Frontend] Receives realtime update or notification
    ↓
[User] Opens result
```

## Result journey

```text
[Frontend] Displays:
    ├── summary
    ├── facts
    ├── calculations
    ├── strengths
    ├── weaknesses
    ├── risks
    ├── missing information
    ├── due-diligence questions
    ├── evidence
    ├── confidence
    └── freshness
```

## Failure paths

- minimum data missing → show required fields;
- entitlement missing → show upgrade path;
- provider outage → retry or partial result where allowed;
- invalid structured output → fail safely;
- stale source → reduce confidence and disclose;
- execution cancelled → preserve status.

## Success criteria

- analysis is asynchronous;
- progress is visible;
- no cross-household data is used;
- calculations come from backend;
- evidence and freshness are shown;
- no guaranteed outcome is claimed.

---

# 11. Journey 8 — Run prediction

## Goal

View a bounded forecast for an approved target.

## Flow

```text
[User] Opens prediction section
    ↓
[User] Selects target and horizon
    ↓
[Backend] Validates data completeness
    ↓
◇ Valid cached result available?
    ├── Yes → return cached prediction
    └── No → run validated prediction model
    ↓
[AI] Generates explanation from model output
    ↓
[Frontend] Shows lower, central, and upper estimates
    ↓
[Frontend] Shows confidence, assumptions, model version, and disclaimer
```

## Success criteria

- numeric forecast comes from validated model;
- six-hour cache is applied;
- range and horizon are visible;
- false precision is avoided;
- stale input reduces confidence.

---

# 12. Journey 9 — Run portfolio performance analysis

## Goal

Identify portfolio strengths, risks, and underperformance.

## Flow

```text
[User] Selects Analyse portfolio
    ↓
[Backend] Creates portfolio AI execution
    ↓
[AI] Loads strategy and latest portfolio snapshot
    ↓
[AI] Runs:
    ├── portfolio performance
    ├── risk
    ├── strategy alignment
    └── prediction where relevant
    ↓
[AI] Prioritises recommendations
    ↓
[Backend] Persists recommendations
    ↓
[Frontend] Displays:
    ├── health summary
    ├── outperformers
    ├── underperformers
    ├── concentration
    ├── leverage
    ├── cash-flow pressure
    └── suggested actions
```

## Success criteria

- each conclusion links to deterministic metrics;
- no property is labelled underperforming from one metric alone;
- user strategy is considered;
- user can acknowledge, dismiss, or create a scenario.

---

# 13. Journey 10 — Create sell, hold, or refinance scenario

## Goal

Compare strategic options without changing live records.

## Flow

```text
[User] Selects Create scenario
    ↓
[Frontend] Offers:
    ├── hold
    ├── sell
    ├── refinance
    ├── sell and repay another loan
    └── sensitivity
    ↓
[User] Selects scenario
    ↓
[Frontend] Loads current values as editable assumptions
    ↓
[User] Reviews or changes:
    ├── sale price
    ├── costs
    ├── interest rate
    ├── term
    ├── vacancy
    ├── growth
    └── target loan
    ↓
[Backend] Validates inputs
    ↓
[Backend] Runs deterministic calculation
    ↓
[Backend] Stores scenario run
    ↓
[Frontend] Shows:
    ├── assumptions
    ├── financial impact
    ├── cash-flow impact
    ├── debt impact
    ├── equity impact
    ├── risks
    └── missing tax or break-cost inputs
```

## Comparison path

```text
[User] Selects two or more scenarios
    ↓
[Backend] Normalises comparison
    ↓
[Frontend] Shows side-by-side outcomes
```

## Success criteria

- live data is unchanged;
- assumptions are explicit;
- tax exclusion is visible;
- missing break cost is visible;
- calculation version is stored;
- scenarios can be rerun.

---

# 14. Journey 11 — Create watchlist

## Goal

Define target property criteria.

## Flow

```text
[User] Opens Discover
    ↓
[User] Selects Create watchlist
    ↓
[Frontend] Collects:
    ├── suburbs
    ├── budget
    ├── property type
    ├── bedrooms
    ├── yield
    ├── growth preference
    ├── school or transport preferences
    ├── risk limits
    └── portfolio-fit preferences
    ↓
[Backend] Validates criteria
    ↓
[Backend] Saves watchlist version
    ↓
[Discovery] Matches active licensed listings
    ↓
[Frontend] Shows match results
```

## Success criteria

- prohibited demographic criteria are not supported;
- criteria are editable;
- match score is explainable;
- updates trigger re-matching.

---

# 15. Journey 12 — Review matched listing

## Goal

Decide whether to shortlist a listing.

## Flow

```text
[User] Opens listing match
    ↓
[Frontend] Shows:
    ├── listing facts
    ├── match score
    ├── qualifying reasons
    ├── disqualifiers
    ├── missing data
    ├── source
    └── update time
    ↓
[User] Selects:
    ├── shortlist
    ├── reject
    └── analyse
```

## Analyse path

```text
[Backend] Creates listing-analysis execution
    ↓
[AI] Treats listing text as untrusted
    ↓
[AI] Extracts facts and inconsistencies
    ↓
[Frontend] Shows questions and missing details
```

## Success criteria

- withdrawn listings are clearly marked;
- listing source rights are respected;
- embedded instructions cannot trigger tools;
- user can shortlist or reject.

---

# 16. Journey 13 — Generate EOI draft

## Goal

Create a user-editable expression-of-interest draft.

## Flow

```text
[User] Opens shortlisted listing
    ↓
[User] Selects Create EOI
    ↓
[Frontend] Collects:
    ├── offer amount
    ├── finance status
    ├── deposit
    ├── settlement preference
    ├── conditions
    ├── expiry
    └── recipient
    ↓
◇ Required field missing?
    ├── Yes → prompt user
    └── No → continue
    ↓
[Backend] Creates AI execution
    ↓
[AI] Generates draft only
    ↓
[Backend] Persists draft version
    ↓
[Frontend] Shows editable subject and body
```

## Success criteria

- finance status is not invented;
- recipient is not silently changed;
- draft remains unsent;
- missing fields are visible;
- draft version is tracked.

---

# 17. Journey 14 — Approve and send EOI

## Goal

Safely send the final user-approved EOI.

## Flow

```text
[Owner] Reviews final draft
    ↓
[Frontend] Requires recipient confirmation
    ↓
[Owner] Confirms subject, body, offer, conditions, and recipient
    ↓
[Backend] Creates approval for exact draft version
    ↓
[Owner] Selects Send
    ↓
[Frontend] Sends idempotency key
    ↓
[Backend] Validates:
    ├── owner permission
    ├── current approval
    ├── matching draft version
    ├── confirmed recipient
    ├── rate limit
    └── duplicate status
    ↓
[Backend] Queues send
    ↓
[Email Service] Sends through provider
    ↓
[Backend] Stores provider reference
    ↓
[Frontend] Shows sending or sent
    ↓
[Webhook] Updates delivered, bounced, or failed
```

## Approval invalidation

Any change to:

```text
subject
body
recipient
offer amount
finance status
conditions
```

requires a new approval.

## Success criteria

- unapproved draft cannot send;
- duplicate send request is safe;
- full final content snapshot is audited;
- delivery status is visible;
- AI never sends directly.

---

# 18. Journey 15 — Upload and analyse document

## Goal

Securely upload a document and receive a structured analysis.

## Flow

```text
[User] Selects Upload document
    ↓
[Frontend] Collects document type and file
    ↓
[Backend] Validates permission and metadata
    ↓
[Backend] Issues signed upload URL
    ↓
[Frontend] Uploads to private storage
    ↓
[Backend] Completes upload
    ↓
[Security] Validates type and malware status
    ↓
◇ Safe for analysis?
    ├── No → block and notify
    └── Yes → allow analysis request
    ↓
[User] Requests analysis
    ↓
[AI] Reads approved pages or excerpts
    ↓
[AI] Produces summary, risks, dates, obligations, and page references
    ↓
[Frontend] Shows extracted values for review
    ↓
[User] Confirms selected values before saving
```

## Success criteria

- file remains private;
- signed URL expires;
- malicious content cannot trigger tools;
- page references are present;
- extracted values do not overwrite records automatically;
- deletion removes derived artefacts.

---

# 19. Journey 16 — Track inspection

## Goal

Schedule, complete, and follow up a property inspection.

## Flow

```text
[User] Opens property management
    ↓
[User] Creates inspection
    ↓
[Frontend] Stores type, date, and property manager
    ↓
[User] Adds findings and media
    ↓
[User] Marks inspection complete
    ↓
◇ Follow-up required?
    ├── Yes → create maintenance request
    └── No → close
    ↓
[Backend] Schedules follow-up reminder where required
```

## Success criteria

- inspection history is preserved;
- findings are linked to media;
- viewer cannot edit;
- overdue follow-up is visible.

---

# 20. Journey 17 — Track maintenance request

## Goal

Manage a maintenance issue from creation to completion.

## Flow

```text
[User] Creates maintenance request
    ↓
[Frontend] Collects category, severity, description, media, and cost estimate
    ↓
[Backend] Creates request with open status
    ↓
[User/Admin] Updates status
    ↓
[Backend] Stores immutable status history
    ↓
◇ Completed?
    ├── Yes → record final cost and completion date
    └── No → continue tracking
    ↓
[Backend] Optionally creates linked expense
```

## Success criteria

- status history is preserved;
- final cost can link to expense;
- overdue state is visible;
- completion actor and time are recorded.

---

# 21. Journey 18 — Use investment tutor

## Goal

Learn a concept through an adaptive learning path.

## Flow

```text
[User] Opens Academy
    ↓
[Frontend] Shows learning paths
    ↓
[User] Selects path or assessment
    ↓
[Tutor] Reads knowledge level and progress
    ↓
[Tutor] Presents lesson and examples
    ↓
[User] Completes quiz
    ↓
[Backend] Saves attempt
    ↓
[Tutor] Provides feedback
    ↓
[Backend] Updates concept mastery
    ↓
[Frontend] Recommends next lesson
```

## Success criteria

- progress persists;
- lesson difficulty adapts;
- quiz answer and feedback are consistent;
- current facts use approved sources;
- user can reset or delete learning memory.

---

# 22. Journey 19 — Use property management tutor

## Goal

Receive practical property-management education based on context.

## Flow

```text
[User] Opens Property Management Tutor
    ↓
[User] Selects topic or asks question
    ↓
[Tutor] Loads approved property-management context
    ↓
[Tutor] Provides explanation, checklist, questions, and next steps
    ↓
◇ Current legal rule required?
    ├── Yes → retrieve approved current source or disclose limitation
    └── No → continue
    ↓
[User] Saves checklist or starts relevant workflow
```

## Success criteria

- no message is sent automatically;
- legal uncertainty is disclosed;
- user context is isolated;
- advice remains educational.

---

# 23. Journey 20 — Receive CIO briefing

## Goal

Review material portfolio changes and priorities.

## Flow

```text
[Scheduler] Starts briefing evaluation
    ↓
[Backend] Loads changes since last briefing
    ↓
[AI] Consumes specialist recommendations
    ↓
[AI] Applies materiality, deduplication, and user preferences
    ↓
◇ Material items exist?
    ├── No → create no-change or suppress notification
    └── Yes → create briefing
    ↓
[Backend] Persists briefing
    ↓
[Notification Service] Delivers according to preference
    ↓
[User] Opens briefing
    ↓
[Frontend] Shows:
    ├── what changed
    ├── why it matters
    ├── what to review
    ├── evidence
    └── confidence
```

## Success criteria

- duplicates are suppressed;
- dismissed items do not repeat without material change;
- no artificial urgency;
- user controls frequency and channel;
- no-change outcome is valid.

---

# 24. Journey 21 — Respond to recommendation

## Goal

Allow the user to acknowledge, dismiss, complete, or act on a recommendation.

## Flow

```text
[User] Opens recommendation
    ↓
[Frontend] Shows evidence, confidence, freshness, and suggested actions
    ↓
[User] Selects:
    ├── acknowledge
    ├── dismiss
    ├── mark completed
    ├── create scenario
    └── provide feedback
    ↓
[Backend] Stores decision
    ↓
[Backend] Updates deduplication and future prioritisation
```

## Success criteria

- decision is audited;
- dismissed recommendation is suppressed;
- materially changed recommendation may return with explanation;
- feedback is linked to recommendation version.

---

# 25. Journey 22 — Manage notifications

## Goal

Control notification channels, frequency, and quiet hours.

## Flow

```text
[User] Opens notification settings
    ↓
[Frontend] Shows categories and channels
    ↓
[User] Updates preferences
    ↓
[Backend] Validates and stores
    ↓
[Notification Service] Applies preferences to future delivery
```

## Success criteria

- opt-out is respected;
- quiet hours use user timezone;
- lock-screen content avoids sensitive details;
- device tokens can be removed.

---

# 26. Journey 23 — Upgrade subscription

## Goal

Purchase a plan and unlock entitlements.

## Flow

```text
[User] Opens upgrade screen
    ↓
[Frontend] Shows plans and entitlements
    ↓
[User] Selects plan
    ↓
[Backend] Creates checkout session
    ↓
[External Billing Provider] Processes payment
    ↓
[Webhook] Sends subscription event
    ↓
[Backend] Verifies signature and processes idempotently
    ↓
[Backend] Updates entitlements
    ↓
[Frontend] Refreshes subscription and usage
```

## Success criteria

- provider webhook is authoritative;
- duplicate event is safe;
- entitlements update correctly;
- role and permission checks still apply;
- payment failure has a clear recovery path.

---

# 27. Journey 24 — Export account or portfolio data

## Goal

Generate a secure export.

## Flow

```text
[User] Requests export
    ↓
[Backend] Validates permission and re-authentication where required
    ↓
[Backend] Creates export job
    ↓
[Worker] Collects authorised data
    ↓
[Worker] Applies provider export restrictions
    ↓
[Worker] Creates encrypted or protected export artefact
    ↓
[Backend] Creates short-lived download request
    ↓
[User] Downloads
```

## Success criteria

- no other household data is included;
- provider-restricted data is excluded or handled correctly;
- download expires;
- export is audited;
- temporary export artefact follows retention policy.

---

# 28. Journey 25 — Delete account or household

## Goal

Request and complete secure deletion.

## Flow

```text
[User] Opens privacy settings
    ↓
[User] Selects account or household deletion
    ↓
[Frontend] Explains impact and retention exceptions
    ↓
[Backend] Requires re-authentication
    ↓
[User] Confirms
    ↓
[Backend] Creates deletion request
    ↓
◇ Cooldown or cancellation period?
    ├── Yes → wait until execution date
    └── No → execute
    ↓
[Deletion Worker] Deletes or anonymises:
    ├── domain records
    ├── storage objects
    ├── AI memory
    ├── AI cache
    ├── embeddings
    ├── device tokens
    └── derived data where required
    ↓
[Backend] Retains permitted audit evidence
    ↓
[User] Loses access
```

## Success criteria

- owner permission is required for household deletion;
- cascade is complete;
- deletion status is traceable;
- orphaned files are detected;
- retention exceptions are documented.

---

# 29. Journey 26 — Recover from stale data

## Goal

Understand and resolve stale market or valuation information.

## Flow

```text
[Frontend] Detects stale status
    ↓
[Frontend] Shows source, age, and affected metrics
    ↓
[User] Selects Refresh or Continue
    ↓
◇ Refresh available?
    ├── Yes → backend requests refresh
    └── No → show source publication limitation
    ↓
[Backend/Data] Refreshes or confirms latest version
    ↓
[Frontend] Updates status
```

## Success criteria

- stale data is never hidden;
- user understands which result is affected;
- confidence is adjusted;
- refresh failure is handled.

---

# 30. Journey 27 — Operate during provider outage

## Goal

Provide safe degraded behaviour.

## Flow

```text
[External Provider] Becomes unavailable
    ↓
[Backend/Data/AI] Detects failure
    ↓
◇ Approved cached result within stale-use window?
    ├── Yes → return with degraded warning
    └── No → return controlled unavailable state
    ↓
[Observability] Emits alert
    ↓
[Frontend] Shows retry and status
```

## Success criteria

- no fabricated result;
- cache age is visible;
- side-effect operations fail closed;
- retry does not create duplicates;
- outage is observable.

---

# 31. Journey 28 — Handle permission denial

## Goal

Deny unauthorised access safely.

## Flow

```text
[User] Requests protected resource
    ↓
[Backend] Authenticates
    ↓
[Backend] Checks membership, role, resource scope, entitlement, and provider policy
    ↓
◇ Allowed?
    ├── Yes → continue
    └── No → return stable permission error
    ↓
[Security] Logs denial where appropriate
    ↓
[Frontend] Shows safe message and navigation option
```

## Success criteria

- no sensitive resource details leak;
- cross-household access is denied;
- frontend does not rely on hidden buttons alone;
- sensitive denial is auditable.

---

# 32. Journey 29 — Support investigation

## Goal

Allow support to investigate without unrestricted user-data access.

## Flow

```text
[User] Provides support reference
    ↓
[Support] Searches support tooling
    ↓
[Support] Sees:
    ├── release
    ├── request status
    ├── error code
    ├── trace status
    └── non-sensitive metadata
    ↓
◇ Elevated access required?
    ├── No → resolve
    └── Yes → approved elevated session
    ↓
[Security] Audits start and end
    ↓
[Support] Performs restricted investigation
```

## Success criteria

- no hidden impersonation;
- sensitive actions remain blocked;
- elevation is time-bound;
- all access is audited.

---

# 33. Journey state model

Every major journey must account for:

```text
not_started
in_progress
waiting_for_user
waiting_for_approval
waiting_for_provider
completed
partially_completed
failed
cancelled
expired
```

The frontend should not treat all non-complete states as generic loading.

---

# 34. Common UI states

Every primary screen must define:

- loading;
- empty;
- success;
- validation error;
- permission denied;
- provider unavailable;
- stale data;
- offline;
- partial result;
- retry;
- cancellation;
- unsupported feature;
- entitlement required.

---

# 35. Common recovery patterns

Use:

```text
retry
edit input
refresh data
resume
cancel
contact support
upgrade
request permission
```

The recovery option must match the failure.

---

# 36. Journey analytics

Track privacy-safe metrics.

Examples:

```text
onboarding_started
onboarding_completed
property_creation_started
property_creation_completed
financial_setup_completion
ai_analysis_requested
ai_analysis_completed
scenario_created
listing_shortlisted
eoi_draft_created
eoi_approved
eoi_sent
lesson_completed
recommendation_actioned
```

Do not include sensitive form content in analytics.

---

# 37. Journey accessibility

Each journey must support:

- screen reader;
- semantic headings;
- clear focus order;
- keyboard navigation on web;
- scalable text;
- non-colour-only status;
- accessible error summaries;
- adequate touch targets.

---

# 38. Journey security requirements

Every journey must:

- authenticate;
- authorise;
- validate;
- respect RLS;
- propagate trace ID;
- audit sensitive actions;
- redact logs;
- enforce provider restrictions;
- preserve approval boundaries;
- fail closed.

---

# 39. Journey testing requirements

Each journey requires:

- happy path;
- interrupted path;
- validation failure;
- permission denial;
- provider failure;
- stale-data path;
- duplicate submission;
- cancellation;
- retry;
- cross-device or reload recovery where relevant.

Critical journeys require end-to-end automation.

---

# 40. Priority journeys for MVP

The MVP must fully support:

1. onboarding;
2. household creation;
3. add property;
4. complete financial setup;
5. property dashboard;
6. portfolio dashboard;
7. AI property analysis;
8. portfolio analysis;
9. scenario creation and comparison;
10. document upload;
11. recommendation response;
12. notification preferences;
13. subscription upgrade;
14. export and deletion.

Discovery, EOI, tutors, and CIO may be phased but should follow the defined journeys.

---

# 41. Codex rules

Codex must:

1. implement journeys end to end;
2. preserve ownership across projects;
3. support resume and recovery;
4. implement all UI states;
5. enforce permissions at backend;
6. use asynchronous execution for long work;
7. show data freshness;
8. show AI evidence and confidence;
9. enforce approval before communication;
10. add journey analytics without sensitive content;
11. create end-to-end tests;
12. support trace correlation;
13. document deviations;
14. avoid dead-end screens;
15. not claim journey completion until acceptance tests pass.

---

# 42. Definition of done

A user journey is complete when:

- the user goal can be achieved;
- every step has a system owner;
- permissions are enforced;
- data and provider dependencies are handled;
- interruption and retry work;
- empty, loading, stale, error, offline, and success states exist;
- consequential actions require approval;
- events and metrics are emitted;
- security and accessibility requirements pass;
- end-to-end tests pass;
- the journey ends with a clear outcome or next action.

---

# 43. Final journey principle

For every TrackMyProps user journey, the platform must answer:

```text
What is the user trying to achieve?
What are the exact steps?
Which system owns each step?
What data and permission checks apply?
What can interrupt or fail?
How does the user recover?
What proves the journey succeeded?
```

A journey without clear answers to those questions is not ready for implementation.
