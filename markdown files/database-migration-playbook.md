# TrackMyProps Database Migration Playbook

## 1. Purpose

This document defines safe PostgreSQL and Supabase database-change practices.

---

# 2. Principles

1. Every change uses a migration.
2. Production migrations are reviewed.
3. Prefer expand-and-contract.
4. Avoid long blocking transactions.
5. Backfills are separate from schema deployment when large.
6. RLS is part of the migration.
7. Every migration has validation.
8. Prefer forward-fix in production.
9. Historical data is not rewritten casually.
10. Application revisions may overlap during rollout.

---

# 3. Migration types

- additive schema;
- index;
- constraint;
- RLS policy;
- function;
- data backfill;
- destructive cleanup;
- enum evolution;
- partitioning;
- performance tuning.

---

# 4. Expand-and-contract

```text
Expand schema
    ↓
Deploy compatible application
    ↓
Backfill
    ↓
Move reads/writes
    ↓
Observe
    ↓
Remove old contract later
```

Never combine destructive removal with the first deployment of its replacement.

---

# 5. Add column

Safe default:

- add nullable column;
- deploy application that writes both or handles absence;
- backfill;
- add constraint after validation;
- stop old writes;
- remove old column later.

Avoid adding a non-null column with expensive default to a large table without testing.

---

# 6. Rename column

Do not rename directly for active clients.

Use:

1. add new column;
2. dual write;
3. backfill;
4. switch reads;
5. stop old writes;
6. remove old column in later release.

---

# 7. Change data type

Use a new column when conversion is risky.

Requirements:

- conversion query;
- rejected-record handling;
- comparison;
- cutover;
- rollback plan.

---

# 8. Add index

Use concurrent index creation where supported and appropriate.

Before:

- inspect table size;
- inspect query plan;
- estimate duration;
- monitor storage.

After:

- confirm index use;
- remove redundant indexes only later.

---

# 9. Constraints

Add constraints safely:

- validate existing data first;
- use not-valid/validate pattern where supported;
- avoid broad table locks;
- provide remediation query.

---

# 10. Enum changes

Adding value may be compatible.

Renaming or removing value is breaking.

Prefer lookup tables when lifecycle changes frequently.

---

# 11. RLS migration

Every RLS migration requires tests for:

- owner;
- admin;
- member;
- viewer;
- advisor;
- inactive membership;
- cross-household denial;
- service identity.

Never disable RLS in production for convenience.

---

# 12. Function and trigger changes

- version functions;
- fix `search_path`;
- avoid unsafe dynamic SQL;
- test privileges;
- document trigger ordering;
- ensure idempotency.

---

# 13. Backfills

Large backfills require:

```text
job_id
batch size
checkpoint
retry
pause/resume
progress
reconciliation
```

Rules:

- small transactions;
- bounded runtime;
- avoid API request path;
- do not overwhelm replicas or provider limits;
- record failed rows.

---

# 14. Online migration compatibility

During canary, old and new revisions coexist.

Therefore:

- both schemas must work;
- writes must not corrupt old readers;
- new enums must have fallback;
- cache keys should be versioned;
- events must remain compatible.

---

# 15. Pre-production checklist

```text
[ ] Migration reviewed
[ ] Empty-database install passes
[ ] Upgrade from previous version passes
[ ] Staging rehearsal passes
[ ] Duration measured
[ ] Lock risk assessed
[ ] Disk growth assessed
[ ] RLS tests pass
[ ] Validation queries exist
[ ] Backfill plan exists
[ ] Recovery point exists
```

---

# 16. Deployment order

Typical:

```text
1. Backup/recovery point
2. Expand migration
3. Deploy compatible backend
4. Start backfill
5. Validate
6. Switch feature flag/read path
7. Observe
8. Contract in later release
```

---

# 17. Failure handling

If migration fails:

1. stop rollout;
2. preserve error and revision;
3. determine partial application;
4. prevent incompatible traffic;
5. forward-fix or rollback;
6. validate;
7. rerun permission tests;
8. record incident if production impact occurred.

---

# 18. Validation queries

Every migration should provide queries for:

- expected row count;
- null count;
- duplicate count;
- invalid enum values;
- orphaned references;
- RLS behaviour;
- backfill parity;
- index state.

---

# 19. Destructive changes

Require:

- explicit approval;
- deprecation period;
- usage telemetry;
- export/retention review;
- tested restore;
- final backup;
- proof no supported client depends on data.

---

# 20. Data deletion migrations

Privacy deletion is not a schema migration.

Use controlled deletion jobs that cover:

- database;
- storage;
- AI cache;
- memory;
- embeddings;
- exports;
- provider deletion.

---

# 21. Migration ownership

Each migration records:

```text
owner
reviewer
risk
estimated duration
affected tables
RLS impact
application dependencies
rollback/forward-fix
validation
```

---

# 22. Codex rules

Codex must:

1. generate migrations, not direct production SQL;
2. use expand-and-contract;
3. add RLS tests;
4. separate large backfills;
5. provide validation queries;
6. preserve mixed-version compatibility;
7. avoid destructive changes without deprecation;
8. document locks and performance;
9. use Decimal-safe conversions;
10. update database and data dictionary documentation.
