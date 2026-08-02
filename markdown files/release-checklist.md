# TrackMyProps Release Checklist

## 1. Purpose

Use this checklist for every production release.

---

# 2. Release metadata

```text
Release ID:
Date:
Components:
Version:
Commit SHA:
Artifact digest:
Migration revision:
Release owner:
Approver:
Rollout strategy:
```

---

# 3. Pre-release

```text
[ ] Scope is approved
[ ] PRs are merged
[ ] CI passes
[ ] Unit tests pass
[ ] Integration tests pass
[ ] Contract tests pass
[ ] RLS tests pass
[ ] Security scans pass
[ ] Documentation updated
[ ] ADR updated where needed
[ ] Feature flags documented
[ ] Provider changes approved
```

---

# 4. Database

```text
[ ] Migration reviewed
[ ] Staging migration succeeded
[ ] Lock risk assessed
[ ] Backfill tested
[ ] Validation queries prepared
[ ] Backup/recovery point confirmed
[ ] Rollback or forward-fix ready
```

---

# 5. Privacy and security

```text
[ ] No secrets in code or image
[ ] Environment secrets available
[ ] Data collection change reviewed
[ ] Retention and deletion updated
[ ] Subprocessor review complete
[ ] Permission changes tested
[ ] Cross-household denial passes
[ ] Sensitive logs checked
```

---

# 6. AI and data

```text
[ ] Agent and prompt versions recorded
[ ] Output schema tests pass
[ ] Evaluation threshold passes
[ ] Cache policy verified
[ ] Model/provider fallback approved
[ ] Dataset quality passes
[ ] Dataset/source versions recorded
[ ] Licence constraints enforced
```

---

# 7. Mobile and frontend

```text
[ ] App version/build number correct
[ ] Runtime version correct
[ ] API compatibility checked
[ ] Minimum supported version reviewed
[ ] Web build succeeds
[ ] Accessibility smoke test passes
[ ] Store release notes prepared
```

---

# 8. Deployment

```text
[ ] Immutable artifact exists
[ ] Image scan passes
[ ] Staging accepted
[ ] Smoke tests pass
[ ] Monitoring dashboards open
[ ] Alerts enabled
[ ] Canary thresholds defined
[ ] Rollback revision identified
[ ] Support informed
```

---

# 9. Production rollout

```text
[ ] Deploy canary
[ ] Verify health and readiness
[ ] Verify authentication
[ ] Verify authorised read/write
[ ] Verify migration
[ ] Verify AI execution if affected
[ ] Verify data job if affected
[ ] Verify billing/email if affected
[ ] Monitor errors, latency, cost, and security
[ ] Promote to full traffic
```

---

# 10. Post-release

```text
[ ] Production verification complete
[ ] Release record updated
[ ] Metrics stable
[ ] No new critical alerts
[ ] Feature flags correct
[ ] Deprecated usage monitored
[ ] Support notified of completion
[ ] Follow-up issues created
```

---

# 11. Emergency release

```text
[ ] Incident reference exists
[ ] Scope is minimal
[ ] Reviewer assigned
[ ] Essential tests pass
[ ] Rollback is ready
[ ] Incident Commander approves
[ ] Monitoring is continuous
[ ] Post-release review scheduled
```

---

# 12. Rollback trigger examples

Rollback when:

- critical security or privacy regression;
- elevated 5xx beyond threshold;
- material latency increase;
- failed migration validation;
- duplicate communication;
- incorrect financial calculations;
- systemic AI output failure;
- entitlement or billing regression;
- data-quality publication failure.

---

# 13. Release closure

A release closes only after:

- full rollout or rollback;
- verification;
- release record;
- incidents linked;
- documentation updated;
- owners assigned to follow-up work.
