
# TrackMyProps Incident Response

## 1. Purpose

This document defines the operational incident-response framework for TrackMyProps.

It covers:

- security incidents
- privacy incidents
- platform outages
- AI incidents
- data-quality incidents
- third-party provider failures
- communication
- recovery
- post-incident reviews

Applies to:

- frontend
- backend
- AI platform
- data platform
- infrastructure

---

# 2. Objectives

The incident process must:

- detect incidents quickly
- contain impact
- protect users
- preserve evidence
- restore service safely
- satisfy legal and contractual obligations
- capture lessons learned

---

# 3. Incident severity

## SEV-1 Critical

Examples:

- cross-household data exposure
- complete production outage
- ransomware
- credential compromise with production access
- active data exfiltration

Target:

- acknowledge within 15 minutes
- engineering engaged immediately
- executive notification
- continuous updates until resolved

---

## SEV-2 High

Examples:

- AI producing dangerous outputs
- payment failures
- partial production outage
- storage failure
- provider outage affecting major features

Target:

- acknowledge within 30 minutes

---

## SEV-3 Medium

Examples:

- degraded performance
- failed scheduled jobs
- notification failures
- intermittent API errors

Target:

- acknowledge within 2 hours

---

## SEV-4 Low

Examples:

- cosmetic bugs
- documentation issues
- isolated user problems

---

# 4. Incident types

- Security
- Privacy
- Availability
- Performance
- AI
- Data Quality
- Infrastructure
- Third-party
- Billing
- Deployment

---

# 5. Incident roles

## Incident Commander

Coordinates response.

## Technical Lead

Owns investigation.

## Communications Lead

Handles internal and external updates.

## Privacy Lead

Assesses Privacy Act and OAIC obligations.

## Security Lead

Coordinates security response.

## Scribe

Maintains timeline.

---

# 6. Detection sources

Incidents may originate from:

- monitoring
- logs
- alerts
- synthetic monitoring
- users
- support
- providers
- security tooling
- anomaly detection

---

# 7. Response workflow

```text
Detect
 ↓
Validate
 ↓
Assign severity
 ↓
Contain
 ↓
Investigate
 ↓
Mitigate
 ↓
Recover
 ↓
Monitor
 ↓
Post-incident review
```

---

# 8. Containment examples

Security:

- revoke credentials
- disable accounts
- rotate secrets
- isolate workloads

Privacy:

- disable affected APIs
- revoke signed URLs
- stop exports

AI:

- disable agent
- disable tool
- rollback prompt version
- disable cache

Infrastructure:

- rollback deployment
- fail over
- scale services

---

# 9. Evidence

Preserve:

- logs
- traces
- metrics
- audit events
- deployment IDs
- provider references
- screenshots where useful

Never alter evidence.

---

# 10. Communication

Internal updates should include:

- summary
- impact
- affected services
- current status
- ETA if known
- owner
- next update time

External updates should:

- avoid speculation
- describe impact honestly
- explain work underway
- avoid exposing sensitive details

---

# 11. Privacy incidents

Immediately determine:

- personal information involved
- number of users
- countries
- sensitivity
- likelihood of serious harm

Escalate to the Privacy Lead.

---

# 12. AI incidents

Examples:

- hallucinated financial advice
- incorrect recommendation
- prompt injection
- tool misuse
- unsafe output

Actions:

- disable affected agent
- preserve execution
- invalidate cache
- notify engineering

---

# 13. Third-party incidents

Possible providers:

- Supabase
- Google Cloud
- AI provider
- email provider
- billing provider
- property-data provider

Document:

- provider status
- workaround
- fallback
- user impact

---

# 14. Recovery validation

Before closing:

- health checks pass
- monitoring green
- no active alerts
- user validation completed
- backlog created for follow-up

---

# 15. Post-incident review

Complete within five business days for SEV-1 and SEV-2.

Include:

- timeline
- root cause
- contributing factors
- customer impact
- detection quality
- response quality
- corrective actions
- preventative actions
- owners
- due dates

---

# 16. Incident record

Every incident stores:

```text
incident_id
severity
category
status
opened_at
closed_at
commander
summary
timeline
affected_services
affected_users
root_cause
corrective_actions
```

---

# 17. Metrics

Track:

- MTTD
- MTTA
- MTTR
- incident count
- repeat incidents
- escaped defects
- privacy incidents
- security incidents

---

# 18. Required runbooks

Maintain runbooks for:

- database outage
- Supabase outage
- Cloud Run outage
- AI provider outage
- payment outage
- storage failure
- webhook failure
- secret rotation
- compromised account
- privacy breach
- ransomware
- rollback

---

# 19. Testing

Run:

- tabletop exercises
- backup restore tests
- secret rotation drills
- failover testing
- privacy breach simulations
- AI abuse simulations

At least annually.

---

# 20. Release gates

Production releases must not proceed if:

- critical incident unresolved
- monitoring disabled
- backups failing
- security alerts ignored
- rollback unavailable

---

# 21. Codex rules

Codex must:

1. create structured incident models
2. emit audit events
3. preserve trace IDs
4. avoid deleting evidence
5. support feature flags
6. implement graceful degradation
7. support rollback
8. generate structured logs
9. expose health endpoints
10. create incident-response tests

---

# 22. Definition of done

Incident response is complete when:

- service restored
- impact understood
- users informed where required
- legal obligations completed
- root cause identified
- actions assigned
- review completed
- documentation updated
