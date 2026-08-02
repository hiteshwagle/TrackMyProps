# TrackMyProps Production Readiness

## 1. Purpose

This document is the final production gate for TrackMyProps services and features.

A release is production ready only when the applicable controls below are complete or an explicit, time-bound risk acceptance exists.

---

# 2. Governance

```text
[ ] Product owner identified
[ ] Technical owner identified
[ ] Operational owner identified
[ ] Support owner identified
[ ] Privacy and security reviewers identified
[ ] Architecture decisions recorded
[ ] Documentation current
```

---

# 3. Scope and user outcomes

```text
[ ] User problem is explicit
[ ] Acceptance criteria pass
[ ] Out-of-scope behaviour is blocked
[ ] User journey is complete
[ ] Empty, loading, error, stale, offline, and success states exist
[ ] Feature metrics are defined
```

---

# 4. Architecture

```text
[ ] Service boundary is correct
[ ] Connection is documented
[ ] API/event contracts are versioned
[ ] Ownership is clear
[ ] Long-running operations are asynchronous
[ ] Provider adapters isolate external volatility
[ ] No direct cross-service data mutation violates ownership
```

---

# 5. Security

```text
[ ] Threat model reviewed
[ ] Authentication enforced
[ ] Authorisation enforced
[ ] RLS tested
[ ] Cross-household negative tests pass
[ ] Service identity is least privilege
[ ] Secrets are externalised
[ ] Rate limits exist
[ ] Signed URLs expire
[ ] Sensitive logs are redacted
[ ] Security scans pass
[ ] Admin and support access are restricted
```

---

# 6. Privacy

```text
[ ] Collection purpose documented
[ ] Collection notice exists
[ ] Consent is versioned where needed
[ ] Data minimisation applied
[ ] Sensitivity and retention classes assigned
[ ] Data residency documented
[ ] Subprocessors reviewed
[ ] AI provider terms reviewed
[ ] Access, correction, export, and deletion work
[ ] Derived data is included in deletion
[ ] PIA complete for high-risk processing
```

---

# 7. Data

```text
[ ] Source and licence are approved
[ ] Provenance is preserved
[ ] Freshness is visible
[ ] Quality gates exist
[ ] Historical versions are preserved
[ ] Geography and units are compatible
[ ] Missing values are not converted to zero
[ ] Provider display/export restrictions are enforced
```

---

# 8. Calculations and AI

```text
[ ] Financial calculations are deterministic
[ ] Calculation version is stored
[ ] AI output schema is validated
[ ] Evidence and confidence are shown
[ ] Missing information is explicit
[ ] Prompt-injection tests pass
[ ] Agent/tool permissions are narrow
[ ] Cache scope and TTL are correct
[ ] No general training on user data
[ ] Model fallback behaviour is approved
[ ] AI cost limits exist
```

---

# 9. Communication safety

```text
[ ] Draft and send are separate
[ ] Exact content and recipient approval exists
[ ] Editing invalidates approval
[ ] Idempotency prevents duplicate sends
[ ] Webhook signatures are verified
[ ] Non-production recipient safeguards exist
[ ] Delivery and failure state are visible
```

---

# 10. Reliability and performance

```text
[ ] SLOs are defined
[ ] p95 latency meets target
[ ] Load and spike tests pass
[ ] Database pool is sized
[ ] Timeouts are configured
[ ] Retries are bounded
[ ] Circuit breakers exist for critical providers
[ ] Queue lag is monitored
[ ] Graceful degradation is defined
[ ] Cost budgets and alerts exist
```

---

# 11. Deployment

```text
[ ] CI passes
[ ] Immutable artefact built
[ ] Container scan passes
[ ] Environment variables documented
[ ] Staging deployment verified
[ ] Migration rehearsal passed
[ ] Feature flags configured
[ ] Canary or rollout plan exists
[ ] Rollback tested
[ ] Release metadata recorded
```

---

# 12. Database

```text
[ ] Migration is backward compatible
[ ] Expand-and-contract plan exists
[ ] Locks and duration assessed
[ ] Backfill is bounded and resumable
[ ] Validation queries exist
[ ] RLS policies included
[ ] Backup or recovery point verified
[ ] Forward-fix or rollback plan exists
```

---

# 13. Observability

```text
[ ] Logs are structured
[ ] Trace IDs propagate
[ ] Metrics exist
[ ] Dashboards exist
[ ] Alerts are actionable
[ ] Release version is attached
[ ] Sensitive values are redacted
[ ] Synthetic or smoke monitoring exists
```

---

# 14. Operations

```text
[ ] Runbook exists
[ ] Incident severity is defined
[ ] Support diagnostics are available
[ ] Provider escalation path exists
[ ] On-call ownership is clear
[ ] Backup is healthy
[ ] Restore test is current
[ ] Disaster-recovery dependency is documented
```

---

# 15. Billing and commercial

```text
[ ] Production provider contract is active
[ ] Sandbox and production are isolated
[ ] Entitlements are backend enforced
[ ] Webhooks are reconciled
[ ] Quotas are defined
[ ] Usage and cost are observable
[ ] Provider renewal and expiry are tracked
```

---

# 16. Mobile and client readiness

```text
[ ] Supported mobile versions are documented
[ ] Old supported client works with new backend
[ ] Minimum-version response is tested
[ ] Runtime version is correct
[ ] Store metadata and privacy declarations are current
[ ] Phased release plan exists
[ ] Backend feature flag can protect slow mobile rollout
```

---

# 17. Release approval

Required sign-off depends on risk.

Typical approvers:

- product;
- engineering;
- security;
- privacy;
- data;
- operations.

High-risk examples:

- EOI send;
- billing;
- new AI provider;
- property data provider;
- ownership or permission changes;
- destructive migration;
- automated decision support.

---

# 18. Risk acceptance

A temporary exception must include:

```text
risk
impact
likelihood
mitigation
owner
approved_by
expiry
remediation
```

No permanent “temporary” exception.

---

# 19. Go/no-go

## Go

All critical gates pass and residual risk is accepted.

## No-go

Block when:

- cross-household tests fail;
- backup is unavailable;
- rollback is absent;
- privacy or provider rights are unresolved;
- migration cannot be validated;
- critical alerts are disabled;
- communication approval can be bypassed;
- AI output validation is failing;
- production secrets are exposed.

---

# 20. Definition of done

Production readiness is complete when the feature or service can be deployed, operated, monitored, supported, rolled back, recovered, and retired without relying on undocumented knowledge.
