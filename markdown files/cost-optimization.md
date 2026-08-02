# TrackMyProps Cost Optimisation

## 1. Purpose

This document defines how TrackMyProps controls infrastructure, AI, data-provider, storage, and operational cost without compromising correctness, security, privacy, or reliability.

---

# 2. Principles

1. Cost is observable.
2. Optimise unit economics, not only total spend.
3. Do not trade away security or data integrity.
4. Cache only when safe.
5. Use managed autoscaling deliberately.
6. Stop runaway work automatically.
7. Provider contracts must match product value.
8. Delete data according to retention policy.
9. Review cost by feature and household.
10. Every material cost has an owner.

---

# 3. Cost categories

- Cloud Run;
- Cloud Run Jobs;
- Supabase;
- storage and egress;
- logging and monitoring;
- AI inference;
- embeddings and vector storage;
- commercial property data;
- maps and geocoding;
- email and notifications;
- billing fees;
- mobile build and distribution;
- support and operational tooling.

---

# 4. Core metrics

```text
monthly infrastructure cost
cost per active household
cost per active property
cost per AI execution
cost per completed analysis
cost per listing match
cost per document analysis
cost per useful recommendation
data-provider cost per active user
storage cost per household
```

---

# 5. Cloud Run

Controls:

- min instances only for critical low-latency services;
- max instances;
- right-sized CPU and memory;
- tuned concurrency;
- short startup;
- efficient images;
- request timeouts;
- scale-to-zero for non-critical services;
- separate jobs from API services.

Monitor:

- CPU;
- memory;
- instance time;
- cold starts;
- request concurrency;
- failed retries.

---

# 6. Cloud Run Jobs

- use bounded resources;
- batch work;
- checkpoint;
- avoid rerunning completed partitions;
- schedule at appropriate frequency;
- stop on quality failure;
- cap retries;
- delete old execution artefacts.

---

# 7. Supabase

Optimise:

- indexes;
- query plans;
- connection pooling;
- storage lifecycle;
- Realtime subscriptions;
- database size;
- backup tier;
- unused tables and indexes;
- historical partitioning.

Do not increase database tier before identifying query bottlenecks.

---

# 8. AI inference

Controls:

- model routing by task;
- prompt size limits;
- structured outputs;
- summarised context;
- per-agent token budgets;
- per-agent cache;
- batch embeddings;
- retries capped;
- stop conditions;
- quota by plan;
- cost-aware evaluation.

Use the smallest validated model that satisfies quality.

---

# 9. AI cache

Initial examples:

```text
Demographics:
    long TTL or event invalidation

Prediction:
    six hours

Final property synthesis:
    always fresh, but reuse approved specialist results
```

Track:

- hit rate;
- miss reason;
- stale rejection;
- cost saved;
- invalidation frequency.

---

# 10. Context control

Avoid sending:

- full portfolio history when summary is sufficient;
- unrelated document pages;
- duplicate market data;
- raw provider payloads;
- repeated system instructions.

Use:

- structured tool outputs;
- selected evidence;
- context compression;
- document chunk retrieval;
- token accounting.

---

# 11. Embeddings

Optimise:

- only approved document types;
- chunk deduplication;
- content hashes;
- batch requests;
- delete on document deletion;
- re-embed only when model or content changes;
- avoid embedding public data already queryable structurally.

---

# 12. Commercial data

Before procurement, measure:

- unique value;
- coverage;
- match rate;
- user outcome;
- overlap with other providers;
- API cost;
- display and storage rights.

Prefer one primary property provider initially.

Do not buy multiple overlapping feeds without evidence.

---

# 13. Maps and geocoding

- debounce address search;
- cache only allowed fields;
- restrict API key;
- use session tokens where provider supports;
- avoid repeated route calculations;
- select source based on actual use.

---

# 14. Storage

- private lifecycle rules;
- delete abandoned uploads;
- expire exports;
- remove orphaned files;
- compress where appropriate;
- avoid duplicate document copies;
- retain raw provider artefacts only when contract permits and value justifies.

---

# 15. Logging

- structured logs;
- sampling for high-volume low-value events;
- separate security retention;
- avoid debug logs in production;
- do not log payloads;
- set retention by class;
- use metrics instead of repeated verbose logs.

---

# 16. Notifications and email

- deduplicate;
- group low-priority alerts;
- respect user preferences;
- avoid sending unchanged briefings;
- use in-app notification where email adds little value;
- track bounce and inactive devices.

---

# 17. Data pipelines

- incremental ingestion;
- conditional requests;
- partitioned processing;
- source change detection;
- avoid full reload;
- publish only changed partitions;
- suspend broken sources;
- schedule according to real update frequency.

---

# 18. Frontend

- optimise image sizes;
- avoid excessive polling;
- use TanStack Query stale times;
- subscribe to realtime only when necessary;
- cache safe static content;
- reduce unnecessary API calls.

---

# 19. Budgets and alerts

Create:

- monthly platform budget;
- AI budget;
- provider budget;
- logging budget;
- per-environment budget.

Alerts:

```text
50%
75%
90%
100%
unexpected daily spike
```

---

# 20. Unit economics

Review by plan:

```text
revenue
payment fee
property data cost
AI cost
cloud cost
support cost
gross margin
```

Do not price subscriptions without measured usage assumptions.

---

# 21. Non-production cost

- scale to zero;
- schedule shutdown where possible;
- smaller tiers;
- synthetic data;
- limited provider calls;
- log retention reduction;
- no production duplicate feeds.

---

# 22. Cost anomaly runbook

1. identify source;
2. stop runaway process;
3. preserve evidence;
4. correct configuration;
5. assess abuse;
6. update guardrail;
7. review budget.

---

# 23. Review cadence

- weekly during active build;
- monthly after launch;
- before provider renewal;
- after major feature release;
- after cost incident.

---

# 24. Codex rules

Codex must:

1. attach cost metrics to AI and provider calls;
2. implement bounded retries;
3. use incremental pipelines;
4. add safe caching;
5. enforce quotas;
6. document resource assumptions;
7. avoid unbounded scans and uploads;
8. add storage lifecycle;
9. remove unused resources;
10. never weaken security or retention obligations solely to reduce cost.
