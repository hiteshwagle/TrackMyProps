# TrackMyProps AI Governance

## 1. Purpose

This document defines governance for AI models, agents, prompts, tools, evaluations, risk, release, monitoring, incident handling, and retirement.

---

# 2. Governance principles

1. AI supports decisions; it does not hide uncertainty.
2. Deterministic systems own financial calculations.
3. AI cannot perform unrestricted external actions.
4. Evidence, confidence, and freshness are required.
5. Models, prompts, tools, and schemas are versioned.
6. User data is not used for general model training by default.
7. High-risk use requires human review.
8. Provider changes require evaluation.
9. AI quality is measured continuously.
10. Unsafe systems can be disabled quickly.

---

# 3. AI use classifications

## Low risk

- educational explanation;
- summarisation of approved content;
- formatting;
- non-consequential drafting.

## Medium risk

- property analysis;
- portfolio recommendations;
- risk summaries;
- scenario explanation;
- listing analysis.

## High risk

- offer or negotiation content;
- automated decisions affecting rights;
- financial, lending, legal, or tax conclusions;
- external communication;
- user-specific predictions with material consequences.

High-risk outputs require stronger review and controls.

---

# 4. AI inventory

Maintain:

```text
agent_id
purpose
owner
risk_class
model
provider
prompt_version
tool_versions
input_schema
output_schema
cache_policy
data_categories
evaluation_suite
status
```

Statuses:

```text
experimental
internal
pilot
production
suspended
retired
```

---

# 5. Model approval

Before production:

- provider contract reviewed;
- privacy reviewed;
- training and retention terms known;
- security reviewed;
- latency measured;
- cost measured;
- quality evaluated;
- fallback defined;
- region and subprocessor handling documented.

---

# 6. Prompt governance

Every prompt requires:

```text
prompt_id
version
owner
purpose
risk_class
change log
evaluation result
release date
```

Prompt changes use pull requests and tests.

Do not edit production prompts without versioning.

---

# 7. Tool governance

Every tool defines:

- narrow purpose;
- permission;
- input schema;
- output schema;
- timeout;
- retry;
- audit;
- version;
- allowed agents.

Prohibited:

```text
query_any_sql
call_any_http
send_any_email
modify_any_property
```

---

# 8. Human review

Required for:

- EOI and negotiation communication;
- material external communication;
- unresolved conflicting financial data;
- outputs presented as professional conclusions;
- automated decisions with significant effect;
- high-risk exception handling.

---

# 9. Output requirements

Production AI outputs should include:

```text
summary
facts
assumptions
evidence
confidence
freshness
missing_information
risks
limitations
suggested_next_steps
agent_version
```

---

# 10. Hallucination controls

- retrieval from approved sources;
- structured tools;
- deterministic calculations;
- citation/evidence checks;
- schema validation;
- missing-data disclosure;
- conflict detection;
- no invented finance status;
- no invented provider facts;
- no invented legal certainty.

---

# 11. Evaluation framework

Evaluate:

- factual correctness;
- calculation fidelity;
- evidence support;
- completeness;
- safety;
- uncertainty calibration;
- relevance;
- consistency;
- tool-use correctness;
- prompt-injection resistance;
- cost;
- latency.

---

# 12. Evaluation datasets

Use:

- synthetic portfolios;
- public and licensed test data;
- edge cases;
- stale and missing data;
- conflicting sources;
- adversarial listings and documents;
- permission scenarios;
- calculation fixtures.

Avoid production user data unless specifically approved and minimised.

---

# 13. Release thresholds

Each agent must define:

- minimum correctness;
- maximum unsupported-claim rate;
- maximum schema failure;
- maximum unsafe-action rate;
- latency budget;
- cost budget.

Thresholds vary by risk class.

---

# 14. Shadow and canary release

New agent/model versions may use:

- offline evaluation;
- shadow execution;
- internal pilot;
- small canary;
- staged rollout;
- rollback.

Do not compare outputs using identifiable user data without governance approval.

---

# 15. Model fallback

Fallback must be pre-evaluated.

Rules:

- same task suitability;
- compatible schema;
- known privacy terms;
- explicit monitoring;
- no silent quality downgrade for high-risk tasks.

---

# 16. Caching governance

Each agent declares:

- scope;
- TTL;
- invalidation events;
- source versions;
- user/household isolation.

Final property synthesis remains fresh.

Prediction cache is six hours unless changed by approved ADR.

---

# 17. Memory governance

AI memory must be:

- purpose limited;
- reviewable;
- correctable;
- deletable;
- scoped;
- retention controlled.

Do not store hidden chain-of-thought or secrets.

---

# 18. Privacy

Default:

```text
AI_TRAINING_USE_ENABLED=false
```

Minimise:

- tenant data;
- full account numbers;
- unrelated document pages;
- personal identifiers;
- communication recipients.

---

# 19. Bias and fairness

Review:

- suburb and demographic use;
- prohibited discriminatory criteria;
- school and crime interpretation;
- advisor and tenant contexts;
- language and accessibility.

Do not infer investment suitability from protected characteristics.

---

# 20. Automated decisions

TrackMyProps should initially remain decision support.

Any move toward decisions that significantly affect rights or interests requires:

- legal review;
- privacy-policy transparency;
- human review;
- appeal or correction;
- explanation;
- stronger monitoring.

---

# 21. Monitoring

Track:

```text
execution success
schema failure
unsupported claim
tool error
provider error
cache hit
latency
tokens
cost
user feedback
safety incident
prompt injection
drift
```

---

# 22. Drift

Monitor:

- model behaviour;
- provider model updates;
- source-data shifts;
- output distribution;
- evaluation regression;
- user feedback.

A provider alias change can still cause behaviour drift.

---

# 23. AI incidents

Examples:

- unsafe recommendation;
- invented financial data;
- cross-household context;
- prohibited tool call;
- prompt injection;
- systemic schema failure;
- unexpected model change.

Response:

- suspend version;
- preserve evidence;
- invalidate cache;
- rollback;
- assess users;
- add regression tests.

---

# 24. Provider change

Requires:

- contract review;
- data handling review;
- benchmark;
- cost comparison;
- latency comparison;
- schema compatibility;
- canary;
- ADR.

---

# 25. Retirement

Retire an agent or model when:

- quality is inadequate;
- provider ends support;
- cost is unjustified;
- privacy terms are unacceptable;
- product no longer needs it;
- replacement is approved.

Preserve historical result versions.

---

# 26. AI governance board

Recommended participants:

- Product;
- AI Platform;
- Backend;
- Security;
- Privacy;
- Data;
- Legal adviser when required.

Review high-risk launches and material model/provider changes.

---

# 27. Documentation

Maintain:

```text
docs/ai-governance/
├── inventory.md
├── model-approvals.md
├── prompt-changelog.md
├── evaluation-policy.md
├── release-thresholds.md
├── incident-register.md
└── retirement-register.md
```

---

# 28. Codex rules

Codex must:

1. version prompts, models, tools, and schemas;
2. use deterministic calculations;
3. include evidence and uncertainty;
4. implement output validation;
5. create evaluation fixtures;
6. prevent unrestricted actions;
7. enforce cache scope;
8. support rapid disable and rollback;
9. avoid general training on user data;
10. document AI risk and evaluation status.
