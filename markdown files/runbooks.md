# TrackMyProps Runbooks

## 1. Purpose

This document provides operational procedures for common TrackMyProps incidents and service failures.

Use with:

- incident-response.md
- disaster-recovery.md
- deployment-and-devops.md
- observability.md
- connections.md

Every runbook must define:

```text
trigger
severity
owner
preconditions
steps
validation
rollback
communication
evidence
closure
```

---

# 2. General runbook rules

1. Open or link an incident record.
2. Assign an Incident Commander for SEV-1 and SEV-2.
3. Record timestamps and actions.
4. Preserve evidence.
5. Use least-privilege access.
6. Prefer reversible containment.
7. Validate recovery before closure.
8. Create follow-up actions.
9. Never expose secrets in incident notes.
10. Escalate privacy and security events immediately.

---

# 3. Runbook — Backend API outage

## Trigger

- health or readiness failure;
- elevated 5xx;
- production API unavailable.

## Steps

1. Confirm impact by region, route, and client.
2. Check latest deployment and Cloud Run revision.
3. Review error rate, latency, restarts, and saturation.
4. Verify database, Supabase, secrets, and downstream providers.
5. If release-related, shift traffic to last known good revision.
6. If dependency-related, activate documented degraded mode.
7. Validate authentication and a basic authorised request.
8. Monitor for at least one stable observation window.

## Validation

- `/health` and `/ready` pass;
- p95 latency returns within SLO;
- error rate normalises;
- representative user journey succeeds.

---

# 4. Runbook — Supabase database outage

1. Confirm whether the issue is connectivity, saturation, lock, corruption, or provider outage.
2. Stop non-essential jobs and large backfills.
3. Reduce write traffic where possible.
4. Review connection pool usage, locks, and long-running queries.
5. Engage Supabase support if platform-related.
6. If recovery is required, invoke the disaster-recovery process.
7. Validate RLS, row counts, indexes, and critical calculations after recovery.
8. Replay deletion tombstones if a backup was restored.

Do not disable RLS as a workaround.

---

# 5. Runbook — Failed database migration

1. Stop rollout.
2. Identify migration revision and affected schema.
3. Determine whether failure occurred before or after partial application.
4. Block application traffic if inconsistent state is unsafe.
5. Prefer forward-fix for production.
6. Use rollback only when tested and safe.
7. Run validation queries.
8. Re-run RLS and permission tests.
9. Record migration duration, locks, and corrective action.

---

# 6. Runbook — Cloud Run deployment failure

1. Inspect build and deployment logs.
2. Confirm image digest exists and vulnerability gate passed.
3. Check service account, environment variables, and secret references.
4. Check startup and readiness probes.
5. Compare with previous revision configuration.
6. Roll back traffic if production is affected.
7. Validate smoke tests.
8. update the release record.

---

# 7. Runbook — AI provider outage

1. Confirm provider status and error type.
2. Open circuit breaker if failure threshold is reached.
3. Stop non-essential retries.
4. Use approved fallback model only if contract and evaluation allow it.
5. Otherwise return controlled unavailable or partial status.
6. Preserve execution state.
7. Notify users only where meaningful.
8. Re-run failed executions only when idempotent and approved.

Do not silently substitute a materially different model.

---

# 8. Runbook — AI output validation failure

1. Preserve execution ID, model, prompt version, and raw validation result.
2. Do not persist invalid recommendation as final.
3. Attempt one bounded repair step if configured.
4. If still invalid, mark execution failed.
5. Check for prompt or schema regression.
6. Compare recent release and model changes.
7. Disable affected agent version if failure is systemic.
8. Create evaluation regression case.

---

# 9. Runbook — Prompt injection detected

1. Stop affected execution.
2. Preserve restricted evidence.
3. Identify source: listing, document, user input, or external page.
4. Confirm no prohibited tool was called.
5. Invalidate affected cache.
6. Block or quarantine malicious content where appropriate.
7. Review tool permissions and prompt boundary.
8. Escalate to Security for systemic exploitation.

---

# 10. Runbook — Stuck AI execution

1. Confirm execution status and last progress event.
2. Check checkpoint, provider call, and worker health.
3. Verify timeout and cancellation state.
4. If safe, retry from checkpoint.
5. Otherwise cancel and create a new execution.
6. Prevent duplicate recommendations or drafts.
7. Notify user with controlled status.
8. record root cause.

---

# 11. Runbook — Data pipeline failure

1. Identify pipeline, version, source, partition, and last success.
2. Check source availability and schema drift.
3. Inspect extraction, staging, quality, and publication stages.
4. Prevent bad dataset publication.
5. Retry from safe checkpoint.
6. If source changed, update adapter and fixtures.
7. Reconcile row counts and quality.
8. Publish only after quality gate passes.

---

# 12. Runbook — Dataset quality degradation

1. Mark dataset version degraded.
2. Stop promotion to curated or consumer-facing layer.
3. Identify affected geography, period, and metrics.
4. Compare previous version.
5. Roll back current pointer if needed.
6. Notify backend and AI cache invalidation consumers.
7. Correct source mapping or methodology.
8. republish with new version.

---

# 13. Runbook — Property provider outage

1. Confirm provider scope and SLA.
2. Open circuit breaker.
3. Check approved cache freshness.
4. Return cached data only within allowed contract window and label it stale.
5. Disable provider-dependent actions that require current data.
6. Notify operations if outage exceeds threshold.
7. Reconcile missed updates after recovery.

---

# 14. Runbook — Email send failure

1. Identify draft, approval, idempotency key, and provider reference.
2. Confirm whether provider accepted the message.
3. Do not retry until duplicate-send risk is resolved.
4. For transient rejection, retry under policy.
5. For permanent bounce, stop.
6. Update user-visible delivery status.
7. preserve audit record.

---

# 15. Runbook — Webhook signature failure

1. Reject the request.
2. Log safe metadata and provider event reference.
3. Confirm expected secret version.
4. Check replay or spoofing pattern.
5. Rotate secret if compromise is suspected.
6. Reconcile legitimate missed provider events through provider API.
7. Escalate repeated failures to Security.

---

# 16. Runbook — Billing reconciliation mismatch

1. Compare provider subscription state with backend state.
2. Verify webhook delivery and idempotency.
3. Do not grant entitlement from an unverified client assertion.
4. Query provider using server credentials.
5. Correct backend state with audit.
6. Review affected users.
7. Add regression test.

---

# 17. Runbook — Secret compromise

1. Declare security incident.
2. Identify secret, permissions, and exposure window.
3. Disable or rotate immediately.
4. Revoke dependent tokens or sessions.
5. Search logs for misuse.
6. redeploy services with new version.
7. Validate old secret no longer works.
8. Assess privacy and breach implications.

---

# 18. Runbook — Cross-household data exposure

Treat as SEV-1.

1. Disable affected route, policy, or feature.
2. Preserve logs, traces, queries, and affected resource IDs.
3. identify users, households, and data categories.
4. fix backend policy and RLS.
5. run negative access tests.
6. Assess likely serious harm with Privacy Lead.
7. Notify as legally required.
8. review all similarly structured resources.

---

# 19. Runbook — Public or misconfigured storage

1. Remove public access immediately.
2. Revoke active signed URLs where possible.
3. rotate relevant credentials.
4. Identify accessed objects and logs.
5. assess personal information exposure.
6. verify bucket policies across environments.
7. add preventive policy-as-code control.

---

# 20. Runbook — Ransomware or destructive compromise

1. Isolate affected systems.
2. Disable compromised identities.
3. preserve forensic evidence.
4. prevent backup contamination.
5. invoke disaster-recovery plan.
6. restore from known-clean point.
7. rotate secrets.
8. validate integrity before reopening.
9. Coordinate legal, privacy, insurer, and law-enforcement steps as appropriate.

---

# 21. Runbook — Backup failure

1. Confirm failed component and last successful backup.
2. assess RPO exposure.
3. resolve quota, permission, storage, or provider issue.
4. trigger an approved manual backup if safe.
5. validate backup completion.
6. schedule restore test.
7. escalate if RPO is at risk.

---

# 22. Runbook — Restore validation failure

1. Stop recovery promotion.
2. identify missing or inconsistent data.
3. compare checksums, row counts, migrations, and application versions.
4. try an earlier valid recovery point.
5. document increased data-loss window.
6. do not reopen production until validation passes.

---

# 23. Runbook — DNS or certificate failure

1. Confirm DNS resolution and certificate status.
2. check recent DNS or infrastructure changes.
3. restore previous record or certificate configuration.
4. validate from external networks.
5. monitor propagation.
6. review expiry alerting.

---

# 24. Runbook — Unexpected cost spike

1. Identify service, project, provider, and time window.
2. stop runaway jobs or excessive retries.
3. reduce max instances or disable non-essential feature.
4. inspect AI token usage, logging, storage, and provider calls.
5. preserve evidence for misuse.
6. correct guardrails.
7. update budgets and alerts.

---

# 25. Closure checklist

```text
[ ] Service stable
[ ] User impact understood
[ ] Security/privacy assessment complete
[ ] Evidence preserved
[ ] Monitoring normal
[ ] Communications complete
[ ] Incident record updated
[ ] Follow-up actions assigned
[ ] Runbook updated if needed
```

---

# 26. Codex rules

Codex must:

1. implement health and readiness endpoints;
2. emit structured errors and traces;
3. support safe rollback;
4. preserve idempotency;
5. add operational metrics;
6. keep runbook commands environment safe;
7. never suggest disabling security controls as a routine workaround;
8. create automation for repetitive recovery steps;
9. update runbooks with new critical dependencies;
10. add tests for failure and recovery paths.
