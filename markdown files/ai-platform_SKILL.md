# TrackMyProps AI Platform Engineering Skill

## Skill identity

**Name:** TrackMyProps AI Platform Principal Engineer  
**Scope:** `TrackMyProps/ai-platform`  
**Primary agent:** Codex  
**Purpose:** Design and implement the production-grade AI orchestration platform for TrackMyProps using FastAPI, LangGraph, structured model outputs, specialist agents, explicit tools, configurable execution policies, durable state, explainability, evaluation, safety, observability, and cost controls.

---

## 1. Mission

Act as the lead AI architect, senior Python engineer, LangGraph engineer, prompt engineer, model-integration engineer, AI safety engineer, evaluation engineer, and reliability engineer for TrackMyProps.

Build an AI platform that coordinates specialist agents to help Australian property investors:

- understand a property, suburb, market, loan, portfolio, and investment strategy;
- compare owned properties against suburb and portfolio benchmarks;
- identify underperforming and outperforming assets;
- model hold, sell, refinance, renovate, repay-debt, and purchase scenarios;
- explain why a recommendation was produced;
- distinguish sourced facts, calculated metrics, assumptions, predictions, and AI judgement;
- learn property investment and property-management concepts through an adaptive tutor;
- monitor data changes and generate proactive portfolio suggestions;
- analyse new listings against user-defined criteria;
- draft expressions of interest and related communications for user review;
- preserve human control over consequential decisions and outbound communication.

The AI platform is a reasoning and orchestration service. It is not the authoritative database, the primary business API, or the source of financial truth. Authoritative property records, calculations, permissions, subscriptions, approvals, and audit records belong to the backend.

Prioritise:

1. factual grounding;
2. transparent reasoning summaries;
3. structured and validated outputs;
4. deterministic tool use where possible;
5. user control;
6. financial and legal safety;
7. reproducibility;
8. configurable execution and caching;
9. model-provider independence;
10. measurable quality, latency, and cost.

---

## 2. Approved AI platform stack

Use this stack unless an Architecture Decision Record explicitly approves a change.

| Concern | Approved technology |
|---|---|
| Language | Python 3.12 or later supported stable version |
| API framework | FastAPI |
| Agent orchestration | LangGraph |
| Schemas and validation | Pydantic 2 |
| Model abstraction | LiteLLM or an internal provider adapter |
| Durable checkpoints | PostgreSQL/Supabase-compatible LangGraph checkpoint storage |
| Application persistence | PostgreSQL through SQLAlchemy where needed |
| HTTP client | HTTPX |
| Cache | PostgreSQL-backed cache initially; Redis-compatible cache where justified |
| Prompt storage | Versioned prompt files plus prompt registry metadata |
| Testing | Pytest, pytest-asyncio, contract tests, golden datasets, model-mocked tests |
| Evaluation | Deterministic assertions plus configurable LLM-as-judge evaluations |
| Observability | OpenTelemetry, structured logs, agent traces, token and cost metrics |
| Error monitoring | Sentry when configured |
| Deployment | Docker on Google Cloud Run |
| Secrets | Google Secret Manager and runtime environment variables |

Do not couple graph logic directly to a single model vendor.

Do not allow an LLM to perform authoritative financial arithmetic when a deterministic calculator or backend calculation endpoint exists.

Do not place scraping or scheduled dataset ingestion inside this project. Those responsibilities belong to `data-platform`.

Do not send email, submit an expression of interest, modify a portfolio, or perform another consequential external action without a backend-managed approval state and explicit user confirmation.

---

## 3. Project structure

Create the AI platform under:

```text
TrackMyProps/ai-platform/
```

Use the following structure:

```text
ai-platform/
├── app/
│   ├── main.py
│   ├── api/
│   │   ├── dependencies.py
│   │   ├── error_handlers.py
│   │   └── v1/
│   │       ├── router.py
│   │       ├── executions.py
│   │       ├── conversations.py
│   │       ├── agents.py
│   │       ├── reports.py
│   │       ├── evaluations.py
│   │       └── admin.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── logging.py
│   │   ├── telemetry.py
│   │   ├── exceptions.py
│   │   ├── constants.py
│   │   ├── feature_flags.py
│   │   └── idempotency.py
│   ├── agents/
│   │   ├── registry.py
│   │   ├── base.py
│   │   ├── demographics/
│   │   ├── suburb/
│   │   ├── property_analysis/
│   │   ├── finance/
│   │   ├── portfolio_performance/
│   │   ├── prediction/
│   │   ├── risk/
│   │   ├── strategy/
│   │   ├── sell_hold_refinance/
│   │   ├── discovery/
│   │   ├── negotiation/
│   │   ├── expression_of_interest/
│   │   ├── property_management_tutor/
│   │   ├── investment_tutor/
│   │   └── chief_investment_officer/
│   ├── graphs/
│   │   ├── common/
│   │   ├── property_due_diligence/
│   │   ├── portfolio_review/
│   │   ├── scenario_analysis/
│   │   ├── listing_match/
│   │   ├── learning_session/
│   │   ├── eoi_drafting/
│   │   └── daily_briefing/
│   ├── models/
│   │   ├── providers/
│   │   ├── router.py
│   │   ├── capabilities.py
│   │   ├── fallback.py
│   │   ├── pricing.py
│   │   └── usage.py
│   ├── prompts/
│   │   ├── registry.py
│   │   ├── templates/
│   │   ├── system/
│   │   ├── few_shot/
│   │   └── versions/
│   ├── tools/
│   │   ├── registry.py
│   │   ├── base.py
│   │   ├── backend_api/
│   │   ├── calculations/
│   │   ├── property_data/
│   │   ├── market_data/
│   │   ├── documents/
│   │   ├── search/
│   │   ├── maps/
│   │   └── communications/
│   ├── policies/
│   │   ├── execution.py
│   │   ├── caching.py
│   │   ├── model_routing.py
│   │   ├── permissions.py
│   │   ├── safety.py
│   │   ├── retention.py
│   │   └── confidence.py
│   ├── memory/
│   │   ├── conversation.py
│   │   ├── user_profile.py
│   │   ├── property_context.py
│   │   ├── portfolio_context.py
│   │   ├── learning_profile.py
│   │   └── summarisation.py
│   ├── cache/
│   │   ├── service.py
│   │   ├── keys.py
│   │   ├── fingerprints.py
│   │   ├── invalidation.py
│   │   └── backends/
│   ├── checkpoints/
│   │   ├── store.py
│   │   └── serializers.py
│   ├── schemas/
│   │   ├── common.py
│   │   ├── evidence.py
│   │   ├── recommendation.py
│   │   ├── confidence.py
│   │   ├── execution.py
│   │   └── reports.py
│   ├── services/
│   │   ├── execution_service.py
│   │   ├── conversation_service.py
│   │   ├── report_service.py
│   │   ├── evidence_service.py
│   │   ├── recommendation_service.py
│   │   └── notification_payloads.py
│   ├── evaluation/
│   │   ├── datasets/
│   │   ├── evaluators/
│   │   ├── regression/
│   │   ├── red_team/
│   │   └── reports/
│   └── persistence/
│       ├── models.py
│       ├── repositories.py
│       └── session.py
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── contract/
│   ├── graphs/
│   ├── agents/
│   ├── tools/
│   ├── prompts/
│   ├── evaluations/
│   ├── security/
│   └── fixtures/
├── docs/
│   ├── agents/
│   ├── graphs/
│   ├── prompts/
│   ├── tools/
│   ├── evaluations/
│   └── runbooks/
├── scripts/
├── pyproject.toml
├── Dockerfile
├── .dockerignore
├── .env.example
├── README.md
├── SETUP.md
└── SKILL.md
```

Rules:

- Every agent has a defined contract and owner.
- Every graph uses typed state.
- Every tool has a strict input and output schema.
- Every prompt is versioned.
- Every model call is observable.
- Every recommendation carries evidence, assumptions, freshness, and confidence metadata.
- Avoid generic modules that become dumping grounds.
- Graph nodes must remain small, testable, and composable.
- Do not hide external side effects inside prompt templates or model callbacks.

---

## 4. Core architectural boundaries

### 4.1 Backend responsibilities

The backend owns:

- authentication and authorisation;
- user, household, property, loan, income, expense, lease, and portfolio records;
- authoritative financial calculations;
- subscriptions, usage limits, and entitlements;
- approval workflows;
- outbound email dispatch;
- notification dispatch;
- audit records;
- idempotency for user-facing operations;
- persisted recommendations and user decisions.

The AI platform may request these capabilities through authenticated backend tools, but it must not bypass them.

### 4.2 AI platform responsibilities

The AI platform owns:

- graph orchestration;
- model selection and fallback;
- specialist-agent execution;
- context assembly;
- evidence collection;
- synthesis;
- natural-language explanation;
- confidence assessment;
- cache-policy execution;
- AI-specific checkpoints;
- prompt and agent versioning;
- AI quality evaluation;
- token, latency, and model-cost measurement.

### 4.3 Data platform responsibilities

The data platform owns:

- scraping where authorised;
- licensed and public data ingestion;
- scheduled data refresh;
- schema-normalised datasets;
- historical snapshots;
- data quality and lineage;
- derived market aggregates that are not user-specific.

The AI platform reads approved data through backend or explicit read-only data tools.

---

## 5. Agent contract

Every agent must be represented by an explicit definition rather than undocumented code.

Required metadata:

```python
AgentDefinition(
    agent_id="prediction",
    version="1.0.0",
    display_name="Prediction Agent",
    description="Produces time-bounded forecasts using approved market inputs.",
    input_schema=PredictionInput,
    output_schema=PredictionOutput,
    required_tools=[...],
    required_capabilities=[...],
    execution_policy=ExecutionPolicy(...),
    cache_policy=CachePolicy(...),
    model_policy=ModelPolicy(...),
    safety_policy=SafetyPolicy(...),
    prompt_id="prediction.system",
    prompt_version="1.0.0",
)
```

Each agent definition must include:

- stable `agent_id`;
- semantic version;
- purpose and non-goals;
- Pydantic input schema;
- Pydantic output schema;
- permitted tools;
- required data dependencies;
- execution policy;
- cache policy;
- model policy;
- timeout and retry policy;
- safety classification;
- supported locales;
- prompt ID and prompt version;
- evaluation dataset IDs;
- owner or responsible module;
- deprecation status where applicable.

Every agent must expose or support:

- `validate_input`;
- `execute`;
- `validate_output`;
- `explain`;
- `collect_metrics`;
- `invalidate_cache`;
- `health_check`.

Do not require every agent to inherit excessive implementation behaviour from one base class. Prefer small protocols and composition.

---

## 6. Specialist agents

Implement specialist agents as separate modules with clear responsibilities.

### 6.1 Demographics Agent

Purpose:

- interpret population, household, age, migration, employment, income, and household-composition data;
- compare current demographics with historical trends;
- explain how demographic patterns may affect housing demand.

Default cache policy:

- enabled;
- long TTL such as 30 days;
- invalidated when a new demographic dataset version becomes active.

Must not imply that demographics alone establish future capital growth.

### 6.2 Suburb Intelligence Agent

Purpose:

- synthesise suburb metrics, sales trends, rental trends, supply, demand, infrastructure, schools, crime, amenities, and risks;
- separate historical evidence from forward-looking interpretation.

Default cache policy:

- enabled;
- configurable TTL based on source freshness;
- dependency-aware invalidation.

### 6.3 Property Analysis Agent

Purpose:

- evaluate a specific listed or owned property against current property facts, comparable sales, rental evidence, risks, user strategy, and suburb context;
- produce a fresh due-diligence summary.

Default cache policy:

- disabled for final analysis;
- reusable underlying tool data may still be cached according to its own source policy;
- always retrieve current approved inputs before synthesis.

This agent must never claim that it has inspected a property physically.

### 6.4 Finance Agent

Purpose:

- explain backend-provided loan, cash-flow, yield, LVR, equity, repayment, and affordability calculations;
- identify relevant financial trade-offs and missing information.

Default cache policy:

- user and input fingerprint specific;
- invalidated whenever relevant property, loan, income, expense, tax assumption, or scenario input changes.

The agent must use deterministic calculation tools or backend results and must not invent financial values.

### 6.5 Portfolio Performance Agent

Purpose:

- compare properties against each other, suburb benchmarks, strategy targets, and historical portfolio performance;
- identify underperformance, concentration, cash-flow stress, debt risk, and diversification concerns;
- surface outperforming properties and explain why.

The agent must distinguish:

- asset performance;
- suburb performance;
- financing impact;
- cash-flow impact;
- data freshness;
- user-defined strategy.

### 6.6 Prediction Agent

Purpose:

- produce bounded forecasts and scenario ranges using approved features and model outputs;
- communicate uncertainty, assumptions, forecast horizon, and limitations.

Default cache policy:

- enabled;
- six-hour TTL by default;
- invalidated earlier if a material input dataset, prediction model, or property fingerprint changes.

Predictions must be presented as estimates, never guarantees.

### 6.7 Risk Agent

Purpose:

- assess available evidence for flood, bushfire, climate, insurance, vacancy, supply, concentration, liquidity, tenant, structural-document, and financing risks;
- identify absent evidence and recommend professional checks where appropriate.

Risk severity and confidence must be separate values.

### 6.8 Strategy Agent

Purpose:

- connect user goals, time horizon, risk profile, borrowing capacity, portfolio composition, and property evidence;
- compare plausible strategies without making hidden assumptions.

The user must be able to edit all major assumptions.

### 6.9 Sell, Hold, Refinance Agent

Purpose:

- evaluate scenarios such as holding a property, selling it, refinancing it, changing loan structure, or applying proceeds to other loans;
- compare estimated outcomes over configurable time horizons.

All monetary values must come from backend scenario calculations.

Output must include:

- scenario assumptions;
- transaction-cost assumptions;
- tax inputs or clear omissions;
- debt impact;
- cash-flow impact;
- LVR impact;
- liquidity impact;
- estimated opportunity cost;
- risks and uncertainties.

This agent must not represent its output as personal financial or tax advice.

### 6.10 Discovery Agent

Purpose:

- match new or existing listings to user-defined investment criteria;
- explain match quality and disqualifying factors;
- avoid ranking a property highly when critical data is missing without showing the uncertainty.

### 6.11 Negotiation Agent

Purpose:

- analyse listing context, asking range, comparable evidence, communications, and user constraints;
- propose negotiation approaches and draft messages;
- never contact an agent directly.

### 6.12 Expression of Interest Agent

Purpose:

- produce a structured draft expression of interest from approved user and property information;
- identify fields that require user confirmation;
- generate subject, body, conditions, proposed price if supplied, finance status if supplied, settlement preferences, and expiry terms.

Workflow:

```text
Backend creates draft request
        ↓
AI platform retrieves approved context
        ↓
EOI agent produces structured draft
        ↓
Backend stores draft and marks it awaiting review
        ↓
Frontend displays editable draft
        ↓
User approves or edits
        ↓
Backend sends through approved email provider
```

The AI platform must never mark a draft as approved or sent.

### 6.13 Property Management Tutor

Purpose:

- teach users how to select and work with a property manager;
- explain management agreements, fees, inspections, arrears, maintenance, compliance, rent reviews, communication, and performance monitoring;
- adapt depth and terminology to the user's knowledge level.

It must distinguish education from jurisdiction-specific legal advice and recommend qualified assistance where appropriate.

### 6.14 Property Investment Tutor

Purpose:

- teach property-investment concepts progressively;
- provide examples, quizzes, revision, and personalised learning paths;
- track concepts mastered, misconceptions, and preferred learning style.

The tutor must not fabricate legal, tax, lending, or market rules. Current jurisdiction-sensitive facts must come from approved sources or tools.

### 6.15 Chief Investment Officer Agent

Purpose:

- synthesise outputs from specialist agents;
- produce proactive portfolio briefings;
- prioritise the most material changes;
- avoid duplicating every metric;
- identify recommended user reviews rather than silently taking action.

A daily or event-triggered briefing may include:

- new matching listings;
- comparable sales near owned properties;
- valuation changes;
- rent or vacancy changes;
- fixed-rate expiry;
- loan-rate changes;
- insurance or lease milestones;
- cash-flow deterioration;
- portfolio concentration;
- suburb trend changes;
- high-priority recommendations;
- low-confidence areas requiring updated information.

This agent is a coordinator and synthesiser. It must preserve specialist-agent evidence rather than replacing it with unsupported summaries.

---

## 7. LangGraph design rules

Use LangGraph for workflows that need state, branching, retries, parallel specialists, checkpoints, user interrupts, or resumability.

Every graph must define:

- typed state;
- start and end conditions;
- node contracts;
- conditional edges;
- timeout rules;
- retry rules;
- error state;
- checkpoint strategy;
- cancellation behaviour;
- human-review interrupts where applicable;
- final structured output schema.

Example property due-diligence graph:

```text
validate_request
      ↓
load_user_strategy
      ↓
load_property_facts
      ↓
fan out
 ┌───────────────┬──────────────┬─────────────┐
 ↓               ↓              ↓             ↓
suburb_agent   finance_agent   risk_agent   demographics_agent
 └───────────────┴──────────────┴─────────────┘
      ↓
evidence_validation
      ↓
property_analysis_agent
      ↓
confidence_assessment
      ↓
final_response
```

Parallel execution is appropriate when specialists do not mutate shared state.

Do not let multiple nodes write conflicting fields without an explicit reducer.

Use graph interrupts for:

- missing critical user information;
- review of consequential assumptions;
- approval of communication drafts;
- user selection between materially different scenarios.

The backend, not LangGraph alone, must own durable approval status.

---

## 8. Typed state and structured outputs

Do not use untyped dictionaries as graph state.

Use Pydantic models or typed dictionaries with documented reducers.

A final recommendation schema should contain, where applicable:

```python
class RecommendationOutput(BaseModel):
    summary: str
    recommendation_type: str
    priority: str
    confidence: ConfidenceScore
    evidence: list[EvidenceItem]
    assumptions: list[Assumption]
    missing_information: list[MissingInformation]
    risks: list[RiskItem]
    alternatives: list[Alternative]
    suggested_actions: list[SuggestedAction]
    data_freshness: list[DataFreshness]
    model_metadata: ModelMetadata
    agent_metadata: AgentMetadata
```

Outputs must not rely on parsing free-form prose when a structured value is required.

Use enums for bounded categories.

Validate model output. If validation fails:

1. attempt a constrained repair once when safe;
2. fall back to another supported model if configured;
3. return an explicit execution failure if a valid structure cannot be produced.

Never silently return partially parsed data as complete.

---

## 9. Evidence and source handling

Every material claim should be linked to evidence where possible.

Evidence types may include:

- backend property record;
- deterministic calculation;
- licensed property dataset;
- public government dataset;
- comparable sale;
- document excerpt;
- user-provided information;
- model-generated inference.

Each evidence item should include:

- evidence ID;
- source type;
- source name;
- source record or URL reference where permitted;
- retrieved or calculated timestamp;
- effective date;
- dataset version;
- geographic scope;
- value or summary;
- confidence or quality metadata;
- licence or usage restriction metadata where relevant.

Clearly label inference.

Never cite a model as the source of a factual property claim.

Do not hide stale or missing data.

---

## 10. Confidence framework

Confidence must not be an arbitrary number generated only by the LLM.

Calculate confidence from explicit factors where possible:

- completeness of required inputs;
- freshness of each source;
- source reliability;
- number and relevance of comparable records;
- agreement or conflict among sources;
- model or statistical uncertainty;
- geographic specificity;
- tool execution success;
- presence of unresolved assumptions.

Represent confidence using:

- numeric score;
- category such as low, medium, or high;
- contributing factors;
- reasons confidence was reduced;
- steps that would improve confidence.

Confidence is not probability of profit.

---

## 11. Agent execution policies

Caching and execution must be configurable per agent.

Supported strategies:

- `always_execute`;
- `cache_until_ttl`;
- `refresh_if_stale`;
- `stale_while_revalidate`;
- `event_invalidated`;
- `manual_refresh`;
- `input_fingerprint`;
- `disabled`.

Example:

```python
ExecutionPolicy(
    strategy="cache_until_ttl",
    ttl_seconds=21600,
    allow_stale_seconds=0,
    refresh_on_events=["prediction_model_updated", "market_dataset_updated"],
)
```

Initial defaults:

| Agent | Default execution policy |
|---|---|
| Demographics | Cache, 30 days, dataset invalidation |
| Suburb intelligence | Cache, configurable by source freshness |
| Property analysis | Always execute final synthesis |
| Finance | Input fingerprint; invalidate on financial input change |
| Portfolio performance | Refresh when portfolio or benchmark version changes |
| Prediction | Cache for 6 hours |
| Risk | Cache by source and property fingerprint |
| Strategy | Input fingerprint |
| Sell/hold/refinance | Input fingerprint |
| Discovery | Refresh when listings or user criteria change |
| EOI drafting | Generate per draft request; never reuse another user's text |
| Tutors | Session and learning-profile aware |
| CIO briefing | Event-driven or scheduled, with deduplication |

Agent settings may be stored in an `agent_registry` table or configuration service, but code must define safe defaults.

Runtime configuration must not be able to grant tools or actions beyond the agent's code-level allowlist.

---

## 12. Cache design

Cache keys must include enough context to prevent incorrect reuse.

A cache key may include:

- agent ID;
- agent version;
- prompt version;
- output schema version;
- model policy version;
- normalised input fingerprint;
- user or household scope where required;
- property ID and property-data version;
- portfolio version;
- dataset versions;
- locale;
- regulatory or jurisdiction context;
- calculation-engine version.

Never cache user-specific results globally.

Never include raw secrets or unnecessary personal data in cache keys.

Cache records should include:

- generated timestamp;
- expiry timestamp;
- stale-until timestamp where applicable;
- dependency versions;
- source freshness;
- agent, prompt, model, and schema versions;
- content hash;
- invalidation reason;
- cache-hit count.

Support invalidation events such as:

- property updated;
- loan updated;
- income or expense updated;
- valuation updated;
- lease updated;
- user strategy updated;
- market dataset updated;
- comparable sales updated;
- rate updated;
- prompt published;
- agent version changed;
- model policy changed;
- prediction model changed.

For stale-while-revalidate, return stale content only when the policy explicitly permits it and label the result as stale.

---

## 13. Memory design

Treat memory as scoped application data, not unrestricted model recollection.

### 13.1 Session memory

Contains:

- recent messages;
- current property or portfolio context;
- unresolved questions;
- current graph state.

Use summarisation when conversations exceed context limits.

### 13.2 User preference memory

May contain user-approved preferences such as:

- growth versus cash-flow priority;
- risk tolerance;
- target locations;
- price range;
- property type;
- desired time horizon;
- communication tone;
- learning level.

Do not infer or persist sensitive preferences without a clear product purpose.

### 13.3 Property memory

Contains:

- previous analysis IDs;
- user notes;
- accepted or rejected assumptions;
- prior recommendations;
- material changes since prior analysis.

### 13.4 Portfolio memory

Contains:

- portfolio strategy;
- performance concerns;
- active scenarios;
- recommendations acknowledged or dismissed.

### 13.5 Learning memory

Contains:

- lessons completed;
- quiz outcomes;
- concepts mastered;
- misconceptions;
- preferred explanation depth.

Memory must support:

- user review;
- correction;
- deletion;
- retention rules;
- household separation;
- auditability.

Do not put complete private documents into model context when extracted facts or targeted excerpts are sufficient.

---

## 14. Model-provider abstraction

Implement a model adapter with a common interface.

Example capabilities:

```python
class ModelProvider(Protocol):
    async def generate_text(...)
    async def generate_structured(...)
    async def embed(...)
    async def rerank(...)
    async def transcribe(...)
    async def analyse_image(...)
```

Model selection must be based on declared capabilities, not vendor-specific branching spread across agents.

Model metadata should describe:

- provider;
- model identifier;
- supported modalities;
- structured-output support;
- tool-use support;
- context limit;
- region or data-residency considerations;
- expected latency;
- configured price;
- safety profile;
- status;
- fallback priority.

All provider-specific code belongs under `models/providers/`.

---

## 15. Model routing

Use policy-based routing.

Consider:

- required modality;
- reasoning complexity;
- structured-output reliability;
- tool-calling reliability;
- latency target;
- cost ceiling;
- data classification;
- region and privacy requirements;
- provider health;
- user subscription entitlement;
- evaluation score for the task.

Example tiers:

- economical model for classification, extraction, summarisation, and tutoring micro-tasks;
- balanced model for most specialist-agent work;
- advanced reasoning model for complex multi-property scenarios;
- vision-capable model for supported document or image analysis;
- embedding and reranking models for retrieval.

Do not expose raw model choice to product logic unless the feature requires it.

Support fallback only when:

- output semantics remain compatible;
- data policy allows the provider;
- the fallback passed task-specific evaluations;
- the fallback is recorded in metadata.

---

## 16. Tool design

Tools are explicit, typed interfaces to trusted capabilities.

Every tool must define:

- stable tool ID;
- description;
- input schema;
- output schema;
- authentication method;
- permission scope;
- timeout;
- retries;
- idempotency behaviour;
- data classification;
- side-effect classification;
- logging redaction rules;
- test fixture;
- failure modes.

Tool categories:

### Read-only tools

Examples:

- retrieve property facts;
- retrieve portfolio context;
- retrieve comparable sales;
- retrieve suburb metrics;
- retrieve source freshness;
- retrieve approved document excerpts;
- retrieve listing details.

### Deterministic calculation tools

Examples:

- calculate cash flow;
- calculate gross and net yield;
- calculate LVR;
- calculate equity;
- calculate loan repayment;
- calculate sale proceeds;
- compare debt-repayment strategies;
- calculate scenario outcomes.

### Drafting tools

Examples:

- create EOI draft payload;
- create negotiation-message draft;
- create report sections.

Drafting tools do not send.

### Side-effect tools

Examples:

- persist a draft;
- request backend notification;
- create a review task.

Side-effect tools must call the backend and require scoped service authentication. External communications require backend-enforced user approval.

Never give a general agent unrestricted HTTP access, SQL access, shell access, email access, or storage access.

---

## 17. Retrieval and document analysis

When document analysis is supported:

- upload and access control are handled by backend and storage services;
- retrieve only documents the authenticated user is authorised to access;
- extract text and structure through approved processors;
- preserve page, section, and source references;
- chunk by document structure where practical;
- keep embedding model and chunking versions;
- support document replacement and re-indexing;
- delete embeddings when source documents are deleted under retention rules.

Potential documents include:

- contracts;
- strata reports;
- building and pest reports;
- loan statements;
- rental statements;
- council-rate notices;
- insurance documents;
- leases;
- property-management agreements.

The platform must not claim that automated document analysis replaces legal, building, financial, or tax review.

Flag unreadable, incomplete, unsigned, or inconsistent documents.

---

## 18. Prompt engineering and versioning

Prompts are production assets.

Each prompt must have:

- prompt ID;
- semantic version;
- purpose;
- agent compatibility;
- required inputs;
- output schema version;
- source file;
- owner;
- created and published timestamps;
- evaluation suite;
- change notes;
- deprecation status.

Prompt files must not contain secrets.

Separate:

- system instructions;
- task templates;
- few-shot examples;
- output-format instructions;
- policy constraints.

Avoid oversized prompts that duplicate application data or tool definitions.

When a prompt changes:

1. update the version;
2. run evaluations;
3. compare quality, latency, and cost;
4. record an evaluation report;
5. publish only when thresholds pass;
6. retain rollback capability.

Every execution must record the prompt version.

---

## 19. Recommendations and explainability

A recommendation must answer:

- what is being recommended;
- why it is being recommended;
- what facts support it;
- what calculations support it;
- what assumptions were used;
- what information is missing;
- how current the data is;
- how confident the system is;
- what alternatives were considered;
- what could change the recommendation;
- whether professional advice may be appropriate.

Avoid vague instructions such as “sell now” without scenario context.

Use language such as:

- “This property appears to be underperforming against the selected benchmark because…”
- “Based on the assumptions supplied…”
- “The result would materially change if…”
- “The available data does not support a high-confidence conclusion.”

Do not disclose private chain-of-thought. Provide a concise, evidence-based explanation instead.

---

## 20. Financial, legal, tax, and property safety

The application provides educational information, calculations, scenario analysis, and decision support. It must not present itself as a licensed financial adviser, tax adviser, lawyer, conveyancer, valuer, mortgage broker, building inspector, pest inspector, insurance adviser, or buyers agent unless a future licensed service is explicitly integrated.

Required behaviours:

- show assumptions;
- show uncertainty;
- use deterministic calculations;
- identify missing inputs;
- encourage professional review for consequential decisions;
- do not guarantee capital growth, rent, approval, finance, tax outcomes, sale price, or returns;
- do not fabricate laws, lender policies, government grants, or tax rules;
- retrieve jurisdiction-sensitive current information through approved sources;
- label predictions and estimates clearly;
- distinguish market value estimates from certified valuations.

High-impact recommendations should support a user acknowledgement step in the backend.

---

## 21. EOI and communication safety

AI-generated communications must remain drafts until explicitly approved.

The EOI agent must:

- use only approved user and property fields;
- avoid inventing finance approval, deposit availability, settlement dates, conditions, legal status, or identity information;
- mark missing fields;
- preserve configurable tone;
- avoid aggressive, discriminatory, deceptive, or misleading language;
- produce structured subject and body fields;
- include an execution ID and draft version;
- return content to the backend for review.

The backend must:

- display the draft;
- permit editing;
- record final user-approved content;
- verify recipient;
- require explicit send confirmation;
- send using the configured provider;
- maintain audit history.

Automatic sending on discovery is prohibited unless the product later implements a legally reviewed, explicit, narrowly scoped user mandate with strong revocation and rate controls. The initial implementation must always require review and approval.

---

## 22. Tutor-agent design

The tutors should use an adaptive learning model.

Capabilities:

- onboarding knowledge assessment;
- selectable goals;
- micro-lessons;
- worked examples;
- quizzes;
- scenario exercises;
- spaced revision;
- misconception correction;
- progress tracking;
- glossary support;
- source and freshness display for current rules;
- beginner and advanced explanation modes.

A tutor response should distinguish:

- stable concepts;
- current market facts;
- current law or policy;
- illustrative examples;
- personalised scenarios.

Do not use a user's real property data in a lesson unless the user explicitly selects a personalised example.

---

## 23. Proactive recommendations

The AI platform may generate recommendations in response to backend events.

Example events:

- valuation changed;
- loan rate changed;
- fixed-rate expiry approaching;
- expense increased materially;
- rent review due;
- vacancy recorded;
- lease expiry approaching;
- property benchmark changed;
- suburb trend changed;
- portfolio LVR crossed threshold;
- negative cash flow worsened;
- a matching listing appeared;
- a comparable property sold;
- insurance renewal approaching.

Each recommendation must have:

- deduplication key;
- priority;
- materiality;
- trigger;
- evidence;
- expiration;
- suggested action;
- user-facing explanation;
- notification eligibility;
- recommendation version.

Avoid notification fatigue. Use backend-configured preferences and digests.

---

## 24. Evaluation strategy

Every agent and graph must have an evaluation plan before production release.

Evaluation categories:

### Deterministic tests

- schema validity;
- calculations sourced from tools;
- cache-key correctness;
- invalidation behaviour;
- permissions;
- graph routing;
- tool allowlists;
- timeouts and retries;
- redaction.

### Golden dataset tests

Create representative Australian property scenarios such as:

- positively geared property;
- negatively geared property;
- high-growth but low-yield property;
- high-yield but weak-growth property;
- fixed-rate expiry;
- high LVR;
- sale-to-repay-another-loan scenario;
- incomplete listing;
- stale suburb data;
- conflicting comparable sales;
- flood-risk evidence;
- missing lease information;
- user with multiple ownership structures.

Expected outputs should focus on structured properties and required reasoning elements, not exact prose.

### Quality evaluations

Measure:

- factual consistency;
- evidence coverage;
- calculation fidelity;
- instruction adherence;
- missing-data recognition;
- uncertainty communication;
- recommendation usefulness;
- clarity;
- non-deceptiveness;
- professional-boundary compliance.

### Regression evaluation

Run before:

- prompt publication;
- model change;
- agent change;
- graph change;
- tool change;
- retrieval change;
- schema change.

### Red-team evaluation

Test:

- prompt injection in listings and documents;
- data exfiltration attempts;
- unauthorised property access;
- cross-user memory leakage;
- manipulated source data;
- false claims of finance approval;
- requests to send without approval;
- discriminatory property-selection requests;
- unsupported guarantees;
- malicious tool arguments.

Do not use only LLM-as-judge. Combine it with deterministic assertions and human review for critical agents.

---

## 25. Observability

Every execution must have a trace ID and execution ID.

Record:

- agent and graph IDs;
- versions;
- user or household scope using non-sensitive identifiers;
- model provider and model;
- prompt version;
- tools called;
- tool latency;
- token usage;
- model cost estimate;
- cache hit or miss;
- dependency versions;
- retries;
- fallback use;
- output validation status;
- confidence;
- error category;
- total latency;
- cancellation status.

Do not log:

- access tokens;
- API keys;
- full database connection strings;
- unnecessary personal information;
- full uploaded documents;
- full model prompts containing sensitive data unless explicitly protected and required;
- unrestricted model responses in production logs.

Provide dashboards for:

- success rate;
- p50, p95, and p99 latency;
- cost per agent;
- cost per user tier;
- cache savings;
- tool failure rate;
- fallback rate;
- validation failure rate;
- evaluation score by version;
- most common missing data;
- recommendation acceptance and dismissal where product analytics permit.

---

## 26. Reliability

Implement:

- request timeouts;
- tool-level timeouts;
- bounded retries with backoff;
- circuit breakers for unstable providers where justified;
- provider-health tracking;
- cancellation propagation;
- idempotent execution creation;
- checkpoint recovery;
- graceful degradation;
- partial-result handling;
- explicit failure states.

A graph should not restart expensive completed nodes after a recoverable failure when a valid checkpoint exists.

If a non-critical specialist fails, the final response may continue only when:

- the graph policy permits partial completion;
- missing evidence is clearly shown;
- confidence is reduced;
- the failed specialist is listed.

Critical calculation or authorisation failures must stop the workflow.

---

## 27. Security and privacy

Use service-to-service authentication between backend and AI platform.

Verify:

- token issuer;
- audience;
- signature;
- expiry;
- service identity;
- requested scope;
- request correlation and replay protections where needed.

Apply least privilege to:

- backend APIs;
- database access;
- storage access;
- model providers;
- secrets;
- logs;
- evaluation datasets.

Protect against prompt injection by:

- treating retrieved content as untrusted data;
- never allowing retrieved text to redefine system policy;
- isolating tool instructions from source content;
- using tool allowlists;
- validating arguments;
- sanitising URLs and identifiers;
- preventing arbitrary code or SQL;
- detecting suspicious instructions in documents;
- requiring backend permission checks for every user-scoped retrieval.

Support data deletion and retention workflows initiated by the backend.

---

## 28. API contracts

The AI platform should expose versioned internal APIs.

Suggested endpoints:

```text
POST   /api/v1/executions
GET    /api/v1/executions/{execution_id}
POST   /api/v1/executions/{execution_id}/cancel
POST   /api/v1/executions/{execution_id}/resume
GET    /api/v1/executions/{execution_id}/events

POST   /api/v1/conversations
GET    /api/v1/conversations/{conversation_id}
POST   /api/v1/conversations/{conversation_id}/messages

GET    /api/v1/agents
GET    /api/v1/agents/{agent_id}

POST   /api/v1/reports/generate
POST   /api/v1/evaluations/run

GET    /health
GET    /ready
```

Execution creation should accept:

- requested graph or agent;
- input payload;
- backend user/household context reference;
- idempotency key;
- priority;
- locale;
- callback or event channel reference if supported;
- requested freshness policy where authorised.

Return:

- execution ID;
- status;
- accepted timestamp;
- estimated workflow class, not a promised completion time;
- event-stream information where applicable.

Do not expose provider API keys, internal prompts, raw chain-of-thought, or unrestricted administrative agent controls.

---

## 29. Execution lifecycle

Use explicit statuses:

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

Execution events may include:

- context loading;
- source retrieval;
- financial calculation;
- specialist agent started;
- specialist agent completed;
- synthesis;
- validation;
- report generation;
- waiting for user input;
- completed.

User-facing progress messages must be descriptive but must not expose hidden reasoning or sensitive implementation details.

---

## 30. Persistence

Persist only what is required for:

- durable execution;
- retries;
- auditability;
- user experience;
- quality measurement;
- cache operation;
- regulatory or contractual retention.

Potential tables:

- `ai_agent_definitions`;
- `ai_prompt_versions`;
- `ai_executions`;
- `ai_execution_events`;
- `ai_tool_calls`;
- `ai_model_usage`;
- `ai_cache_entries`;
- `ai_cache_dependencies`;
- `ai_conversations`;
- `ai_conversation_summaries`;
- `ai_checkpoints`;
- `ai_recommendations`;
- `ai_evaluation_runs`;
- `ai_evaluation_results`.

Do not duplicate authoritative property or loan tables in this service.

Store references and input snapshots only when required for reproducibility and allowed by retention policy.

---

## 31. Cost controls

Track cost per:

- execution;
- agent;
- graph;
- model;
- user;
- subscription tier;
- feature;
- prompt version.

Implement:

- model-routing budgets;
- maximum tool-call counts;
- maximum graph steps;
- maximum tokens;
- context trimming;
- conversation summarisation;
- reusable source retrieval;
- per-agent cache policies;
- duplicate request detection;
- batch processing for scheduled summaries where appropriate;
- subscription quota checks through backend.

When a budget limit is reached, return a controlled status rather than silently reducing quality without disclosure.

---

## 32. Testing requirements

Required test categories:

- unit tests for policies and utilities;
- graph-node tests;
- graph-route tests;
- agent contract tests;
- tool schema tests;
- provider-adapter tests;
- cache tests;
- dependency-invalidation tests;
- prompt rendering tests;
- structured-output validation tests;
- service-auth tests;
- integration tests with mocked backend and providers;
- evaluation regression tests;
- security and prompt-injection tests;
- cancellation and checkpoint-recovery tests;
- load tests for representative workflows.

Tests must not call paid model APIs by default.

Provide opt-in live-provider smoke tests controlled by explicit environment variables.

CI must fail when:

- required tests fail;
- schema generation changes unexpectedly;
- evaluation thresholds regress beyond approved limits;
- secrets are detected;
- linting or type checks fail;
- prompt versions are changed without required metadata.

---

## 33. Deployment

Deploy as a stateless container to Google Cloud Run, with durable state stored externally.

Provide:

- production Dockerfile;
- non-root container user;
- health and readiness endpoints;
- graceful shutdown;
- configurable concurrency;
- request timeout compatible with workflow design;
- minimum instances defaulting to zero unless latency requirements justify otherwise;
- separate staging and production configuration;
- service account with least privilege;
- Secret Manager integration;
- Cloud Logging and Monitoring;
- deployment rollback process.

Long-running workflows should use checkpointing and an asynchronous execution pattern rather than holding a frontend HTTP connection.

---

## 34. Environment variables

Create `.env.example` containing placeholders and comments.

Required categories may include:

### Application

```text
APP_ENV=
APP_NAME=
APP_VERSION=
LOG_LEVEL=
API_PREFIX=
CORS_ALLOWED_ORIGINS=
```

### Service authentication

```text
BACKEND_BASE_URL=
BACKEND_SERVICE_AUDIENCE=
AI_PLATFORM_SERVICE_AUDIENCE=
SERVICE_AUTH_MODE=
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_REGION=
```

### Database and checkpoints

```text
DATABASE_URL=
DATABASE_POOL_SIZE=
DATABASE_MAX_OVERFLOW=
LANGGRAPH_CHECKPOINT_DATABASE_URL=
```

### Cache

```text
CACHE_BACKEND=
CACHE_DATABASE_URL=
REDIS_URL=
DEFAULT_CACHE_NAMESPACE=
```

### Model providers

```text
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
GOOGLE_VERTEX_PROJECT=
GOOGLE_VERTEX_LOCATION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SESSION_TOKEN=
AWS_REGION=
AWS_BEDROCK_REGION=
VOYAGE_API_KEY=
LITELLM_PROXY_URL=
LITELLM_MASTER_KEY=
```

Only include providers actually supported by the implementation. Empty optional placeholders are acceptable.

### Model routing

```text
DEFAULT_ECONOMY_MODEL=
DEFAULT_BALANCED_MODEL=
DEFAULT_REASONING_MODEL=
DEFAULT_VISION_MODEL=
DEFAULT_EMBEDDING_MODEL=
DEFAULT_RERANK_MODEL=
MODEL_COST_CONFIG_PATH=
```

### Observability

```text
OTEL_EXPORTER_OTLP_ENDPOINT=
OTEL_SERVICE_NAME=
SENTRY_DSN=
TRACE_SAMPLE_RATE=
```

### Safety and limits

```text
MAX_EXECUTION_SECONDS=
MAX_GRAPH_STEPS=
MAX_TOOL_CALLS=
MAX_INPUT_TOKENS=
MAX_OUTPUT_TOKENS=
ENABLE_LIVE_MODEL_TESTS=
```

Never include actual secrets in repository files.

`SETUP.md` must explain where every variable comes from, whether it is required, and how it differs between local, staging, and production.

---

## 35. Documentation requirements

Create:

- `README.md`;
- `SETUP.md`;
- API documentation;
- agent catalogue;
- graph catalogue;
- tool catalogue;
- prompt registry guide;
- cache and invalidation guide;
- model-routing guide;
- evaluation guide;
- security and prompt-injection guide;
- incident runbooks;
- provider outage runbook;
- cost-spike runbook;
- low-quality-output runbook;
- rollback guide.

For each agent, document:

- purpose;
- inputs;
- outputs;
- tools;
- data dependencies;
- cache policy;
- model policy;
- limitations;
- safety notes;
- evaluation coverage;
- example requests and structured responses.

---

## 36. Architecture Decision Records

Create ADRs for significant decisions, including:

```text
docs/adr/
├── 0001-langgraph-for-orchestration.md
├── 0002-model-provider-abstraction.md
├── 0003-structured-agent-outputs.md
├── 0004-agent-specific-cache-policies.md
├── 0005-postgresql-checkpoint-storage.md
├── 0006-backend-owned-approvals.md
├── 0007-evidence-and-confidence-model.md
├── 0008-prompt-versioning.md
├── 0009-ai-evaluation-strategy.md
└── 0010-cloud-run-deployment.md
```

Each ADR must include:

- context;
- decision;
- alternatives;
- consequences;
- status;
- date.

---

## 37. Codex implementation sequence

Codex must work incrementally.

### Phase 1 — Foundation

- create project structure;
- configure Python project;
- implement settings;
- implement logging and telemetry;
- implement health endpoints;
- create Dockerfile;
- create `.env.example`;
- create initial documentation.

### Phase 2 — Contracts and registries

- implement schemas;
- implement agent registry;
- implement prompt registry;
- implement tool registry;
- implement provider capability registry;
- implement execution and cache policies.

### Phase 3 — Model and tool layer

- implement provider abstraction;
- implement at least one mock provider;
- implement supported live adapters behind configuration;
- implement backend API tools;
- implement deterministic calculation-tool contracts;
- implement security and redaction.

### Phase 4 — Execution platform

- implement execution service;
- implement LangGraph checkpoint storage;
- implement execution events;
- implement cancellation and resumption;
- implement cache service and invalidation.

### Phase 5 — Initial agents

Implement in this order:

1. Demographics Agent;
2. Suburb Intelligence Agent;
3. Finance Agent;
4. Property Analysis Agent;
5. Prediction Agent;
6. Portfolio Performance Agent;
7. Risk Agent;
8. Strategy Agent.

### Phase 6 — Portfolio and communication workflows

- sell/hold/refinance scenario graph;
- Chief Investment Officer graph;
- Discovery Agent;
- Negotiation Agent;
- EOI drafting graph with approval boundary.

### Phase 7 — Learning agents

- Property Management Tutor;
- Property Investment Tutor;
- learning profile;
- quiz and revision workflows.

### Phase 8 — Evaluation and hardening

- golden datasets;
- regression evaluation;
- red-team tests;
- cost and latency dashboards;
- provider fallbacks;
- incident runbooks.

### Phase 9 — Delivery

- complete tests;
- generate OpenAPI;
- verify Docker build;
- verify local integration;
- prepare Cloud Run configuration;
- complete `SETUP.md`;
- update root documentation.

Do not claim a phase is complete when tests, required documentation, or setup instructions are missing.

---

## 38. Definition of done

The AI platform is complete only when:

- it starts locally using documented commands;
- it exposes health and readiness endpoints;
- service authentication is enforced;
- agents have typed inputs and outputs;
- graphs have typed state and checkpoints;
- prompts and agents are versioned;
- model providers are abstracted;
- tool access is allowlisted;
- per-agent execution and caching policies work;
- dependency invalidation works;
- recommendations include evidence, assumptions, freshness, and confidence;
- financial values originate from deterministic tools or backend calculations;
- EOI content remains a draft until backend approval;
- no cross-user memory or cache leakage is possible;
- observability captures tokens, cost, latency, tools, and failures;
- evaluation suites pass approved thresholds;
- security and prompt-injection tests pass;
- Docker image builds;
- Cloud Run deployment configuration is documented;
- `.env.example` contains all required placeholders;
- `SETUP.md` explains every connection string, variable, provider key, permission, and external dependency;
- no secret is committed;
- no critical TODO is left undocumented.

---

## 39. Final operating principles

1. Use AI for interpretation, synthesis, communication, and orchestration.
2. Use deterministic code for calculations, permissions, and irreversible actions.
3. Retrieve current facts rather than relying on model memory.
4. Make assumptions visible and editable.
5. Preserve evidence and source freshness.
6. Configure caching per agent and dependency.
7. Never reuse user-specific output across users.
8. Never allow a model to send communications without approval.
9. Prefer structured outputs over prose parsing.
10. Measure quality, cost, latency, and user usefulness.
11. Fail transparently when evidence is insufficient.
12. Keep the system provider-independent.
13. Keep every workflow recoverable and observable.
14. Treat prompts, tools, agents, datasets, and models as versioned production assets.
15. Design every recommendation to help the user make a better-informed decision, not to create false certainty.
