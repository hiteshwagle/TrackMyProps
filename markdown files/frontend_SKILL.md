# TrackMyProps Frontend Engineering Skill

## Skill identity

**Name:** TrackMyProps Frontend Principal Engineer  
**Scope:** `TrackMyProps/frontend`  
**Primary agent:** Codex  
**Purpose:** Design and implement the Expo React Native frontend for TrackMyProps as a trustworthy, accessible, responsive, offline-aware, AI-first property investment operating system.

---

## 1. Mission

Act as the lead frontend architect, senior React Native engineer, product-minded UX engineer, accessibility specialist, frontend security engineer, and frontend QA engineer for TrackMyProps.

Build a production-ready application that lets Australian property investors:

- create and manage a complete property portfolio;
- record loans, income, expenses, leases, valuations, documents, and events;
- understand property and portfolio performance;
- discover and compare investment opportunities;
- interact with specialist AI agents;
- review AI-generated recommendations, assumptions, sources, and confidence;
- run portfolio scenarios;
- learn property investment and property management;
- monitor listings;
- review, edit, approve, and send AI-generated expressions of interest;
- receive proactive alerts and recommendations.

The frontend must make complicated financial and property information understandable without hiding uncertainty, assumptions, or data freshness.

Prioritise:

1. user trust;
2. clarity;
3. accessibility;
4. data integrity;
5. fast perceived performance;
6. recoverability from failures;
7. privacy and security;
8. reusable components;
9. maintainable state management;
10. consistent behaviour across iOS, Android, and web.

---

## 2. Approved frontend stack

Use the following stack unless an Architecture Decision Record approves a change.

| Concern | Approved technology |
|---|---|
| Application framework | Expo with React Native |
| Language | JavaScript using modern ECMAScript modules |
| Routing | Expo Router |
| Client state | Zustand |
| Server state | TanStack Query |
| Forms | React Hook Form |
| Validation | Zod |
| Authentication client | Supabase JavaScript client |
| Secure local storage | Expo SecureStore |
| General local persistence | AsyncStorage or an approved Expo-compatible database |
| Notifications | Expo Notifications |
| File and image access | Expo FileSystem, ImagePicker, Camera, DocumentPicker as required |
| Charts | Expo-compatible React Native chart library built on react-native-svg |
| Maps | react-native-maps or an approved Expo-compatible alternative |
| Testing | Jest, React Native Testing Library, and Playwright for supported web E2E flows |
| Linting | ESLint |
| Formatting | Prettier |
| API mocking | MSW where compatible, otherwise isolated test adapters |
| Error monitoring | Sentry when configured |
| Analytics | Privacy-conscious analytics provider selected by configuration |

Do not introduce Redux, MobX, another router, or another form framework without an ADR.

Do not migrate the project to TypeScript unless requested. JavaScript code must still use strong conventions, JSDoc where valuable, Zod validation at boundaries, and clear contracts.

---

## 3. Project structure

Create the frontend under:

```text
TrackMyProps/frontend/
```

Use a feature-oriented structure:

```text
frontend/
├── app/
│   ├── _layout.js
│   ├── index.js
│   ├── (auth)/
│   ├── (tabs)/
│   ├── properties/
│   ├── portfolio/
│   ├── discover/
│   ├── agents/
│   ├── academy/
│   ├── automations/
│   ├── notifications/
│   ├── documents/
│   └── settings/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── charts/
│   │   ├── forms/
│   │   ├── feedback/
│   │   ├── property/
│   │   ├── portfolio/
│   │   ├── ai/
│   │   └── navigation/
│   ├── features/
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── properties/
│   │   ├── loans/
│   │   ├── income/
│   │   ├── expenses/
│   │   ├── leases/
│   │   ├── valuations/
│   │   ├── documents/
│   │   ├── portfolio/
│   │   ├── discovery/
│   │   ├── watchlists/
│   │   ├── scenarios/
│   │   ├── agents/
│   │   ├── academy/
│   │   ├── expressions-of-interest/
│   │   ├── notifications/
│   │   ├── subscriptions/
│   │   └── settings/
│   ├── hooks/
│   ├── services/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── realtime/
│   │   ├── storage/
│   │   ├── analytics/
│   │   └── notifications/
│   ├── stores/
│   ├── schemas/
│   ├── constants/
│   ├── config/
│   ├── utils/
│   ├── theme/
│   └── test/
├── assets/
├── docs/
├── scripts/
├── .env.example
├── app.config.js
├── eas.json
├── package.json
├── README.md
├── SETUP.md
└── SKILL.md
```

Rules:

- Keep route files thin.
- Put reusable feature logic inside `src/features`.
- Put API calls in service modules, never directly in screen components.
- Put shared visual primitives in `src/components/ui`.
- Avoid a generic `helpers.js` dumping ground.
- Keep files focused and reasonably sized.
- Do not import across feature internals when a feature public API can be exposed.

---

## 4. State-management architecture

Use three separate categories of state.

### 4.1 Server state — TanStack Query

TanStack Query owns remote data such as:

- properties;
- loans;
- income and expenses;
- portfolio metrics;
- valuations;
- watchlists;
- property analyses;
- agent jobs;
- notifications;
- subscription entitlements;
- learning progress;
- expressions of interest.

Each feature must define:

- query keys;
- query functions;
- mutation functions;
- invalidation behaviour;
- optimistic-update rules;
- stale time;
- retry policy;
- pagination strategy;
- offline behaviour where applicable.

Do not copy server responses into Zustand unless there is a documented need.

Use canonical query-key factories, for example:

```javascript
export const propertyKeys = {
  all: ['properties'],
  lists: () => [...propertyKeys.all, 'list'],
  list: (filters) => [...propertyKeys.lists(), filters],
  details: () => [...propertyKeys.all, 'detail'],
  detail: (propertyId) => [...propertyKeys.details(), propertyId],
};
```

### 4.2 Client state — Zustand

Zustand owns cross-screen client state such as:

- selected portfolio;
- comparison basket;
- temporary scenario inputs;
- UI preferences;
- onboarding progress not yet submitted;
- active agent conversation context;
- draft filter state;
- local feature-tour progress;
- connectivity and sync indicators.

Use small domain-specific stores, not one global store.

Every persisted Zustand store must define:

- what is persisted;
- why it is persisted;
- migration/version handling;
- reset-on-logout behaviour;
- sensitive-data restrictions.

Never store access tokens, secrets, or private financial documents in plain AsyncStorage.

### 4.3 Local component state

Use React component state for ephemeral UI state such as:

- modal visibility;
- active tab inside a screen;
- input focus;
- accordion expansion;
- temporary animation state.

Do not promote local state globally without a demonstrated cross-screen requirement.

---

## 5. User experience architecture

Design for users with different levels of property knowledge.

Every complex screen should offer:

- a plain-English summary;
- detailed metrics for advanced users;
- definitions or tooltips;
- source and freshness information;
- assumptions;
- next recommended actions;
- clear error and empty states.

Use progressive disclosure. Do not show every field and metric at once.

Important product states must be explicit:

- loading;
- refreshing;
- partially loaded;
- offline;
- queued for sync;
- calculating;
- AI processing;
- awaiting approval;
- failed but retryable;
- failed and requires correction;
- stale data;
- complete.

Do not display a generic spinner for long AI or data workflows. Show meaningful progress steps whenever the backend provides them.

---

## 6. Navigation and principal product areas

The primary navigation must support the following areas.

### 6.1 Home

The home experience should provide:

- portfolio value;
- debt;
- equity;
- cash flow;
- upcoming actions;
- alerts;
- recent portfolio changes;
- new matching listings;
- CIO-agent briefing;
- quick actions.

Do not overload the home screen. Prioritise actions and exceptions over static data.

### 6.2 Portfolio

The portfolio area should support:

- portfolio summary;
- portfolio health score;
- property list;
- chart and table views;
- performance comparison;
- debt and equity views;
- income and expense trends;
- risk and concentration views;
- scenario modelling;
- recommendations and alerts.

### 6.3 Properties

Each owned property must have a dedicated workspace with:

- overview;
- ownership details;
- purchase details;
- loans and loan splits;
- income;
- expenses;
- leases and tenancy;
- valuations;
- documents;
- maintenance;
- tasks and reminders;
- AI insights;
- timeline;
- scenario analysis;
- performance history.

### 6.4 Discover

The discovery area should support:

- structured filters;
- natural-language property search;
- saved searches;
- map and list views;
- property detail;
- watchlists;
- comparison;
- new-listing alerts;
- expression-of-interest workflow.

### 6.5 AI workspace

The AI area should expose specialist agents without presenting them as unexplained magic.

Potential agents include:

- Chief Investment Officer;
- property analysis;
- market;
- demographics;
- finance;
- cash-flow;
- loan and refinancing;
- risk;
- strategy;
- exit and sell-versus-hold;
- opportunity cost;
- negotiation;
- renovation;
- property management;
- learning tutor.

Each agent result must display:

- status;
- agent identity;
- generated time;
- relevant data dates;
- confidence or data-completeness indicator;
- key findings;
- evidence and sources;
- assumptions;
- limitations;
- suggested actions;
- refresh behaviour;
- ability to ask follow-up questions.

### 6.6 Academy

The academy should support:

- adaptive learning paths;
- lessons;
- examples;
- quizzes;
- progress;
- bookmarks;
- AI tutor conversations;
- contextual education from other screens.

A user should be able to tap a metric such as LVR, net yield, depreciation, or offset account and open a concise explanation in context.

### 6.7 Automations

Users should be able to configure and understand automations such as:

- saved-search monitoring;
- new-listing analysis;
- EOI draft generation;
- valuation reminders;
- loan-expiry alerts;
- rent-review reminders;
- insurance-renewal reminders;
- portfolio-health alerts;
- suburb-change alerts.

Every automation must clearly show:

- trigger;
- action;
- current status;
- last execution;
- next expected execution if known;
- approval requirement;
- failure state;
- pause/resume control.

---

## 7. Owned-property data capture

The application must allow manual entry, import, and later integration-based population of property data.

### 7.1 Property identity

Capture:

- address;
- suburb;
- state;
- postcode;
- country;
- property type;
- bedrooms;
- bathrooms;
- car spaces;
- land size;
- floor area;
- year built;
- title details where appropriate;
- ownership percentage;
- ownership entity;
- acquisition status.

Use address autocomplete when configured, but always allow manual correction.

### 7.2 Purchase and acquisition

Capture:

- purchase price;
- contract date;
- settlement date;
- deposit;
- stamp duty;
- legal and conveyancing fees;
- building and pest inspection fees;
- buyer's agent fees;
- lender fees;
- initial repairs;
- other acquisition costs;
- source of funds;
- notes and supporting documents.

### 7.3 Loans

Support multiple loans and splits per property.

Capture:

- lender;
- account nickname;
- original loan amount;
- current balance;
- available redraw;
- offset balance;
- interest rate;
- fixed or variable;
- fixed-rate expiry;
- principal-and-interest or interest-only;
- interest-only expiry;
- repayment amount;
- repayment frequency;
- remaining term;
- loan purpose;
- secured properties;
- refinance history;
- statements and documents.

Do not assume one loan maps to exactly one property.

### 7.4 Income

Support recurring and one-off income:

- rent;
- parking;
- storage;
- solar feed-in;
- insurance proceeds;
- grants;
- reimbursements;
- other income.

Capture:

- amount;
- frequency;
- start and end dates;
- payer or source;
- tax category;
- notes;
- evidence.

### 7.5 Expenses

Support recurring and one-off expenses:

- council rates;
- water;
- strata or body corporate;
- insurance;
- property management;
- repairs;
- maintenance;
- gardening;
- pest control;
- smoke-alarm compliance;
- land tax;
- accounting;
- legal;
- utilities paid by owner;
- cleaning;
- advertising;
- letting fees;
- loan fees;
- interest;
- capital improvements;
- depreciation-related records;
- other expenses.

Capture:

- category;
- amount;
- frequency;
- incurred date;
- paid date;
- supplier;
- tax treatment supplied by backend;
- property allocation;
- loan allocation if relevant;
- receipt or invoice;
- notes.

### 7.6 Leases and tenants

Capture:

- lease start and end;
- rent amount and frequency;
- bond;
- property manager;
- tenant reference identifier without unnecessary personal details;
- rent-review date;
- vacancy periods;
- management agreement;
- inspection schedule;
- notices;
- lease documents.

Privacy-sensitive tenant information must be minimised and access controlled.

### 7.7 Valuations and performance

Support:

- user-entered valuations;
- lender valuations;
- agent appraisals;
- automated valuation estimates;
- valuation ranges;
- valuation source;
- confidence;
- effective date;
- comparable evidence;
- historical valuation chart.

Clearly distinguish estimates from confirmed transaction values.

---

## 8. Portfolio intelligence UX

The frontend must translate backend calculations into understandable decisions.

### 8.1 Portfolio health

Present a portfolio health score with component scores such as:

- cash flow;
- debt and serviceability;
- growth;
- yield;
- concentration;
- liquidity;
- interest-rate exposure;
- vacancy exposure;
- data completeness.

Never present a score without explaining how it was derived.

### 8.2 Underperformance and outperformance

For every property, show comparisons against:

- suburb;
- comparable property segment;
- state or region;
- user portfolio;
- user-selected benchmark.

Present:

- absolute performance;
- relative performance;
- time period;
- confidence;
- data freshness;
- likely causes;
- recommended investigation steps.

Do not turn an underperformance flag into an automatic sell recommendation.

### 8.3 Sell, hold, refinance, or repay scenarios

Support guided scenarios including:

- sell one property;
- repay another loan;
- refinance;
- release equity;
- increase rent;
- change repayment type;
- make a lump-sum repayment;
- redirect offset funds;
- buy another property;
- model interest-rate changes;
- model vacancy;
- model capital-growth assumptions.

Scenario UX must display:

- baseline;
- proposed change;
- before/after metrics;
- assumptions;
- estimated transaction costs;
- tax disclaimer;
- risk and sensitivity;
- reversible draft state;
- save and compare capability.

All authoritative calculations come from backend APIs.

---

## 9. AI interaction requirements

### 9.1 Agent execution behaviour

The frontend must not assume all agents use the same cache policy.

The backend response should expose execution metadata such as:

- `execution_policy`;
- `cache_status`;
- `generated_at`;
- `valid_until`;
- `source_data_as_of`;
- `refresh_available`;
- `job_id`;
- `agent_version`;
- `prompt_version`;
- `model_provider` when appropriate.

Examples:

- demographics agent: return cached result when valid;
- property analysis agent: execute each time using current inputs;
- prediction agent: reuse for six hours, then recompute;
- background-refresh agent: show cached result and indicate refresh in progress.

The UI must communicate these differences clearly.

### 9.2 Long-running jobs

For long-running AI requests:

1. submit the request;
2. receive a job identifier;
3. show step-based progress;
4. subscribe via realtime or poll with backoff;
5. allow the user to leave the screen;
6. restore job state when returning;
7. notify on completion when permitted;
8. provide retry and support paths on failure.

Do not keep a fragile single HTTP request open for long-running analysis when the backend supports asynchronous jobs.

### 9.3 Trust and safety

Every material recommendation must include:

- educational/informational positioning;
- limitations;
- user-editable assumptions where possible;
- data freshness;
- source attribution;
- confidence or data completeness;
- prompts to consult licensed professionals for tax, legal, lending, or financial advice where appropriate.

Do not use manipulative urgency or imply certainty where none exists.

---

## 10. Property-management learning agent

Provide an adaptive tutor for users who want to learn:

- how to evaluate investment properties;
- how loans and offsets work;
- how to assess yield and cash flow;
- how to research suburbs;
- how to choose and manage a property manager;
- how to inspect a property;
- how to review expenses;
- how to plan maintenance;
- how to understand leases and rent reviews;
- how to prepare for purchase and settlement;
- how to monitor performance;
- how to think about holding and exit decisions.

The frontend must support:

- beginner, intermediate, and advanced pathways;
- user-selected goals;
- short and long explanations;
- worked examples;
- quizzes;
- saved lessons;
- contextual links from portfolio screens;
- progress tracking;
- resuming a lesson;
- asking follow-up questions;
- marking content as unclear or unhelpful.

The tutor must distinguish education from personalised regulated advice.

---

## 11. Expression-of-interest workflow

The application may monitor approved listing sources and generate an expression-of-interest draft when a matching new listing appears.

Required user flow:

```text
New matching listing detected
→ Property summary and fit score displayed
→ User reviews listing and key risks
→ AI generates EOI draft
→ User reviews and edits recipient, subject, price, conditions, settlement, finance clauses, and message
→ User explicitly approves
→ Backend sends email through the configured provider
→ Delivery status and reply tracking are shown
```

Hard requirements:

- Never send an EOI without explicit user approval unless a future, legally reviewed feature introduces narrowly scoped pre-authorisation.
- Default to draft-only.
- Clearly show that an EOI may have legal or commercial implications.
- Do not invent agent email addresses.
- Show source of recipient details.
- Validate required fields before enabling send.
- Preserve an immutable sent-message record.
- Show send status and failure reason.
- Allow the user to copy or export the draft when sending is unavailable.
- Make offer price, conditions, and settlement terms visually prominent before approval.

Suggested draft fields:

- listing/property identifier;
- recipient name;
- recipient email;
- subject;
- introduction;
- buyer context;
- proposed price or price range;
- finance condition;
- building and pest condition;
- due-diligence condition;
- settlement preference;
- expiry time;
- requested next step;
- user signature details;
- disclaimer or non-binding wording where legally appropriate.

The frontend must not make legal claims about whether a draft is binding. Display wording supplied by the backend/legal configuration.

---

## 12. Offline and synchronisation behaviour

Support offline-aware workflows for property inspections and data entry.

Candidate offline actions:

- create inspection notes;
- capture photos;
- record voice notes;
- create draft expenses;
- add maintenance tasks;
- update a checklist;
- draft an EOI without sending.

Every offline mutation must have:

- local identifier;
- creation timestamp;
- sync status;
- retry count;
- conflict strategy;
- user-visible resolution when automatic merge is unsafe.

Never claim data is saved to the server while it is only local. Use labels such as `Saved on this device` and `Synced`.

Sensitive data must not be cached offline unless necessary and protected.

---

## 13. Forms and validation

Use React Hook Form and Zod.

Every form must include:

- client-side validation for user feedback;
- server-side validation as authority;
- clear field labels;
- units and currency;
- examples where helpful;
- accessible errors;
- preservation of input after recoverable failure;
- confirmation for destructive or high-impact actions.

Use Australian conventions by default:

- AUD currency;
- Australian address formats;
- day/month/year display;
- local time zones;
- property terminology used in Australia.

Store canonical values independent of display formatting.

For money:

- avoid floating-point arithmetic for authoritative values;
- send decimal strings or integer minor units according to API contract;
- display rounding clearly;
- never silently convert currencies.

---

## 14. Design system

Create a reusable design system with:

- colour tokens;
- typography tokens;
- spacing tokens;
- radius tokens;
- shadows;
- breakpoints;
- motion rules;
- semantic status colours;
- light and dark mode readiness;
- accessibility contrast checks.

Core components should include:

- Button;
- IconButton;
- TextField;
- CurrencyField;
- PercentageField;
- DateField;
- Select;
- Checkbox;
- Radio;
- Switch;
- Card;
- MetricCard;
- DataFreshnessBadge;
- ConfidenceBadge;
- StatusBadge;
- EmptyState;
- ErrorState;
- Skeleton;
- Alert;
- BottomSheet;
- Modal;
- Tabs;
- Accordion;
- DataTable;
- ChartContainer;
- AgentResultCard;
- ProgressTimeline;
- SourceList;
- AssumptionList;
- ApprovalPanel.

Do not create one-off visual styles for every screen.

---

## 15. Responsive behaviour

The application must work on:

- phones;
- tablets;
- desktop web;
- narrow and wide browser windows.

Use responsive composition, not only scaled dimensions.

Examples:

- phone: stacked cards and bottom tabs;
- tablet: split panes where helpful;
- desktop: sidebar navigation, wider tables, persistent comparison panels.

Tables must degrade gracefully on small screens through cards, horizontal scrolling, column selection, or summaries.

Do not assume hover is available.

---

## 16. Accessibility

Target WCAG 2.2 AA where applicable.

Requirements:

- semantic labels;
- keyboard navigation on web;
- screen-reader support;
- visible focus states;
- sufficient colour contrast;
- touch targets of suitable size;
- reduced-motion support;
- charts with textual summaries;
- errors not conveyed by colour alone;
- accessible modal focus management;
- accessible form instructions;
- meaningful button names.

Every chart must have a plain-text interpretation.

---

## 17. Authentication and session handling

Use Supabase Auth through a dedicated auth service abstraction.

Support configuration-ready flows for:

- email and password;
- magic link if enabled;
- Google;
- Apple;
- password reset;
- email verification;
- logout;
- account deletion;
- session refresh;
- multi-factor authentication when introduced.

Rules:

- Store sensitive session material only in approved secure storage.
- Reset private Zustand stores and query caches on logout.
- Prevent previous-user data from flashing after account switching.
- Handle expired sessions gracefully.
- Do not log tokens.
- Do not expose service-role keys to the frontend.

---

## 18. API client standards

Create a central API client with:

- base URL from environment configuration;
- authentication headers;
- request IDs;
- timeout handling;
- cancellation support;
- JSON parsing;
- standard error mapping;
- retry rules;
- idempotency keys for supported mutations;
- safe logging with redaction.

Normalise backend errors into a frontend shape such as:

```javascript
{
  code: 'PROPERTY_NOT_FOUND',
  message: 'The property could not be found.',
  fieldErrors: {},
  retryable: false,
  requestId: '...'
}
```

Do not display raw stack traces or provider errors to users.

---

## 19. Realtime and notifications

Use Supabase Realtime or the approved backend channel for:

- AI-job progress;
- report completion;
- notification updates;
- collaborative or multi-device updates where required.

Push notifications may include:

- report ready;
- new matching listing;
- loan fixed-rate expiry;
- lease or rent review;
- insurance renewal;
- portfolio-health change;
- relevant suburb change;
- automation failure.

Every notification type must support:

- user preference;
- deep link;
- read/unread state;
- permission handling;
- privacy-safe lock-screen content;
- deduplication.

---

## 20. Documents and media

Support upload and management of:

- contracts;
- statements;
- valuation reports;
- leases;
- receipts;
- invoices;
- insurance documents;
- inspection photos;
- maintenance photos;
- depreciation reports;
- generated reports;
- voice notes.

Requirements:

- upload progress;
- cancellation;
- retry;
- file type and size validation;
- virus/malware scanning status from backend when available;
- signed URL handling;
- expiry handling;
- redaction-aware previews;
- delete confirmation;
- audit history;
- privacy labels.

Never make a private storage bucket public to simplify frontend access.

---

## 21. Charts and financial visualisation

Required chart candidates include:

- portfolio value over time;
- debt and equity over time;
- property valuation history;
- income versus expenses;
- monthly cash flow;
- yield comparison;
- growth comparison;
- loan balance projection;
- interest-rate sensitivity;
- suburb versus property performance;
- portfolio concentration;
- scenario comparison.

Rules:

- chart data comes from backend contracts;
- label time period and units;
- handle missing periods;
- show source and freshness;
- provide accessible summary;
- avoid misleading axes;
- distinguish actual, estimated, and forecast values;
- allow users to inspect data points;
- do not imply precision beyond the source data.

---

## 22. Security and privacy

The frontend must follow secure-by-default principles.

Never include in the app bundle:

- Supabase service-role key;
- database password;
- backend private key;
- provider secret;
- SMTP credential;
- unrestricted third-party API secret.

Public client identifiers and publishable keys may be included only when designed for client use and protected by provider restrictions.

Additional rules:

- redact sensitive data from logs;
- prevent screenshots of highly sensitive screens only when product requirements justify it;
- minimise stored tenant information;
- warn users before uploading highly sensitive documents;
- use secure deep-link validation;
- validate file names and MIME types;
- treat listing content and documents as untrusted input;
- protect against unsafe HTML rendering;
- never render AI-generated HTML directly without sanitisation;
- do not expose internal IDs unnecessarily.

---

## 23. Performance

Performance goals must be measured, not assumed.

Apply:

- lazy loading;
- route-level code splitting where supported;
- image resizing and caching;
- paginated lists;
- list virtualisation;
- memoisation only when measured or clearly beneficial;
- query prefetching for likely next screens;
- optimistic updates for low-risk mutations;
- skeleton states;
- cancellation of obsolete requests;
- bundle-size monitoring.

Avoid:

- loading an entire portfolio history when a summary is sufficient;
- rendering large unvirtualised lists;
- shipping large icon libraries unnecessarily;
- excessive global re-renders;
- duplicate API calls caused by unstable query keys.

---

## 24. Error handling and resilience

Create central error boundaries and feature-level recovery states.

Every failure should answer:

- what happened in user-friendly language;
- whether data was saved;
- whether retry is safe;
- what the user can do next;
- how to reference the failure for support.

Support:

- retry;
- cancel;
- resume;
- draft preservation;
- offline queue;
- fallback view;
- status page or support link when configured.

Never use `Something went wrong` as the only information when a more useful message is available.

---

## 25. Analytics and product telemetry

Track product behaviour without collecting unnecessary private data.

Potential events:

- onboarding completed;
- property added;
- loan added;
- expense recorded;
- analysis requested;
- analysis completed;
- recommendation opened;
- scenario created;
- EOI draft generated;
- EOI approved;
- lesson completed;
- alert acted on.

Rules:

- centralise event names;
- document event properties;
- avoid addresses, document text, financial details, and AI prompts in analytics unless explicitly approved and protected;
- honour consent and privacy settings;
- support analytics disablement;
- separate operational logs from product analytics.

---

## 26. Testing requirements

### 26.1 Unit tests

Test:

- formatters;
- validation schemas;
- query-key factories;
- Zustand stores;
- reducers or state transitions;
- financial display utilities;
- permission logic;
- feature flags;
- error normalisation.

### 26.2 Component tests

Test:

- form validation;
- loading states;
- error states;
- accessibility labels;
- agent-result rendering;
- approval workflow;
- offline status;
- destructive confirmation.

### 26.3 Integration tests

Test feature flows with mocked APIs:

- sign in and logout;
- add property;
- add loan;
- add income and expense;
- request analysis;
- monitor job progress;
- create scenario;
- generate and edit EOI;
- update notification preferences.

### 26.4 End-to-end tests

Cover critical journeys:

1. new user onboarding;
2. portfolio creation;
3. owned property setup;
4. first AI property analysis;
5. underperformance review;
6. sell-and-repay scenario;
7. learning lesson;
8. EOI draft and approval;
9. subscription-gated action;
10. account deletion.

Do not use production credentials or real user data in tests.

---

## 27. Feature flags and entitlements

The frontend must support server-driven feature flags and subscription entitlements.

Examples:

- beta agents;
- advanced forecasting;
- number of portfolios;
- number of owned properties;
- AI request limits;
- automation limits;
- EOI generation;
- report export;
- premium academy modules.

The backend is authoritative. Frontend gating improves UX but is not security enforcement.

Avoid scattering plan-name checks throughout components. Use a central entitlement service and hooks.

---

## 28. Environment configuration

Create `.env.example` with placeholders only.

Expected public frontend variables may include:

```dotenv
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_APP_NAME=TrackMyProps
EXPO_PUBLIC_API_BASE_URL=
EXPO_PUBLIC_AI_API_BASE_URL=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_WEB_APP_URL=
EXPO_PUBLIC_DEEP_LINK_SCHEME=trackmyprops
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_ANALYTICS_PROVIDER=
EXPO_PUBLIC_ANALYTICS_WRITE_KEY=
EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY=
EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY=
EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY=
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=
EXPO_PUBLIC_SUPPORT_EMAIL=
EXPO_PUBLIC_PRIVACY_POLICY_URL=
EXPO_PUBLIC_TERMS_URL=
EXPO_PUBLIC_FEATURE_FLAG_PROVIDER=
```

Not every variable must be enabled initially. Document which are required, optional, platform-specific, or future.

Never place private values in an `EXPO_PUBLIC_*` variable.

---

## 29. Setup documentation requirements

Generate `frontend/SETUP.md` that states exactly what the developer must configure.

Include:

### Local development

- Node.js version;
- package manager and version;
- Expo CLI usage;
- iOS/Android prerequisites;
- install command;
- start command;
- test command;
- lint command;
- environment setup.

### Supabase

- project URL;
- anon key;
- allowed redirect URLs;
- deep-link callback URLs;
- enabled auth providers;
- storage bucket names;
- realtime channels used.

### Expo and EAS

- Expo account;
- project ID;
- app slug;
- owner;
- bundle identifier;
- Android package name;
- EAS build profiles;
- credentials configuration;
- notification credentials;
- store listing prerequisites.

### OAuth

- Google iOS client ID;
- Google Android client ID;
- Google web client ID;
- Apple service ID;
- Apple team ID;
- Apple key ID;
- callback URLs.

### Maps

- enabled APIs;
- platform keys;
- application restrictions;
- billing requirement;
- attribution requirements.

### Monitoring and analytics

- Sentry project and DSN;
- release configuration;
- source-map upload;
- analytics provider values;
- consent configuration.

### Payments

- RevenueCat project;
- app identifiers;
- entitlements;
- products and offerings;
- Stripe publishable key if web checkout is used;
- test versus production configuration.

### Legal and support

- privacy policy URL;
- terms URL;
- financial/general advice disclaimer source;
- support email;
- account deletion process;
- data export process.

---

## 30. Coding standards

Use:

- functional React components;
- hooks;
- named exports for reusable modules unless framework conventions require default exports;
- async/await;
- explicit error handling;
- JSDoc for public utilities and complex contracts;
- descriptive names;
- immutable state updates;
- small composable components;
- dependency injection through adapters where testing benefits.

Avoid:

- deeply nested ternaries;
- business logic inside JSX;
- unhandled promises;
- broad `catch` blocks that hide errors;
- silent failures;
- hardcoded URLs;
- magic numbers;
- duplicated query logic;
- direct database access from the frontend;
- direct calls to private AI provider APIs;
- unrestricted use of `any`-style unvalidated objects.

Use Zod to validate critical API responses at boundaries when a malformed response could create financial or workflow risk.

---

## 31. Required implementation phases

Codex must work in the following order.

### Phase 1 — Foundation

- initialise Expo project;
- create folder structure;
- configure linting and formatting;
- configure environment loading;
- create theme and UI primitives;
- set up testing;
- set up API client;
- set up TanStack Query;
- set up Zustand;
- create auth shell;
- create navigation shell.

### Phase 2 — Authentication and onboarding

- authentication flows;
- profile creation;
- investment goals;
- experience level;
- risk preferences;
- notification preferences;
- privacy and consent.

### Phase 3 — Portfolio core

- portfolio dashboard;
- property CRUD;
- loans;
- income;
- expenses;
- leases;
- valuations;
- documents;
- timeline.

### Phase 4 — Portfolio intelligence

- health score;
- comparisons;
- underperformance;
- recommendations;
- scenario modelling;
- alerts.

### Phase 5 — AI workspace

- agent catalogue;
- conversations;
- job progress;
- agent result components;
- source and assumption views;
- refresh and cache metadata;
- feedback.

### Phase 6 — Discovery and watchlists

- property search;
- natural-language search;
- property detail;
- watchlist;
- comparisons;
- listing alerts.

### Phase 7 — Academy

- learning paths;
- lessons;
- quizzes;
- AI tutor;
- progress.

### Phase 8 — EOI workflow

- matching-listing notification;
- AI draft;
- editing;
- review and approval;
- send status;
- audit history.

### Phase 9 — Offline and notifications

- offline inspection notes;
- queued sync;
- push notifications;
- deep linking;
- conflict handling.

### Phase 10 — Hardening

- performance review;
- accessibility review;
- security review;
- test coverage;
- observability;
- release documentation;
- EAS configuration.

Do not claim a phase is complete until its acceptance criteria and tests pass.

---

## 32. Definition of done

A frontend feature is complete only when:

- the user flow is implemented;
- loading, empty, error, offline, and success states exist;
- input is validated;
- permissions and entitlements are handled;
- analytics are added where approved;
- accessibility is reviewed;
- automated tests exist;
- API contracts are documented;
- secrets are not hardcoded;
- setup documentation is updated;
- no high-severity lint, test, or security issue remains;
- the feature works on intended platforms;
- user-facing assumptions and data freshness are visible when relevant.

---

## 33. Codex operating instructions

When working inside `TrackMyProps/frontend`:

1. Read the parent `../SKILL.md` first.
2. Read this file before changing code.
3. Inspect existing code and documentation before generating replacements.
4. Preserve approved architecture unless an ADR justifies a change.
5. Implement vertical slices that can be run and tested.
6. Do not fabricate backend endpoints. Define missing contracts in documentation and use mock adapters until they exist.
7. Do not hardcode production values.
8. Never commit secrets.
9. Keep a running `SETUP.md` containing every value the owner must provide.
10. Keep `README.md` current with commands and project status.
11. Record material decisions in `../docs/adr/`.
12. Add or update tests with every feature.
13. Run tests, linting, and supported platform checks before reporting completion.
14. Clearly report incomplete integrations and required external configuration.
15. Prefer a safe, transparent partial implementation over invented functionality.

At the end of each major implementation phase, output:

- completed capabilities;
- files created or changed;
- tests run and results;
- known limitations;
- backend contracts required;
- environment values still required;
- next recommended phase.

---

## 34. Initial deliverables

Before building feature screens, Codex must create:

- `README.md`;
- `SETUP.md`;
- `.env.example`;
- `app.config.js`;
- `eas.json`;
- design tokens;
- navigation map;
- query-key conventions;
- API-client conventions;
- error model;
- analytics event catalogue;
- accessibility checklist;
- test strategy;
- initial ADRs for Expo, JavaScript, Zustand, TanStack Query, and Expo Router.

The initial implementation must run with mocked APIs when backend services are not available, while making the replacement points explicit.
