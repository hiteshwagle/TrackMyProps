
# TrackMyProps Disaster Recovery

## 1. Purpose

This document defines the Disaster Recovery (DR) strategy for TrackMyProps.

Scope:

- Frontend
- Backend
- AI Platform
- Data Platform
- Supabase
- Google Cloud
- Third-party providers

It complements:

- deployment-and-devops.md
- incident-response.md
- observability.md
- security.md

---

# 2. Objectives

The DR strategy ensures:

- critical services can be restored
- data loss is minimised
- recovery is repeatable
- responsibilities are clear
- recovery is regularly tested

---

# 3. Recovery objectives

| Component | Target RTO | Target RPO |
|-----------|-----------:|-----------:|
| Frontend | 8 hours | Last approved release |
| Backend APIs | 4 hours | 15 minutes |
| AI Platform | 8 hours | 1 hour |
| Supabase Database | 4 hours | 15 minutes |
| Data Platform | 24 hours | Last successful dataset |

These targets should be reviewed annually.

---

# 4. Disaster scenarios

Major scenarios include:

- regional cloud outage
- accidental database deletion
- database corruption
- storage loss
- secret compromise
- ransomware
- Cloud Run failure
- Supabase outage
- AI provider outage
- email provider outage
- DNS failure
- certificate expiry
- infrastructure misconfiguration
- malicious deployment

---

# 5. Critical assets

Recover in this order:

1. Secrets
2. Infrastructure
3. Database
4. Backend APIs
5. AI Platform
6. Data Platform
7. Frontend
8. Monitoring
9. Scheduled jobs

---

# 6. Recovery workflow

```text
Detect
 ↓
Declare disaster
 ↓
Assemble response team
 ↓
Assess scope
 ↓
Recover infrastructure
 ↓
Restore data
 ↓
Restore services
 ↓
Validate
 ↓
Communicate
 ↓
Close
```

---

# 7. Database recovery

Recover using:

- managed backups
- point-in-time recovery where supported
- migration replay
- validation scripts

After recovery:

- verify row counts
- verify RLS
- verify indexes
- replay deletion tombstones if required

---

# 8. Infrastructure recovery

Infrastructure must be recreated from Infrastructure as Code.

Do not rebuild production manually unless approved.

Recover:

- Cloud Run
- Jobs
- Scheduler
- IAM
- networking
- monitoring
- Artifact Registry references

---

# 9. Secret recovery

Secrets come from Secret Manager.

Recovery steps:

- restore references
- rotate compromised secrets
- invalidate old credentials
- verify applications

---

# 10. Storage recovery

Recover:

- uploaded documents
- generated exports
- thumbnails
- AI artefacts where retained

Validate checksums where available.

---

# 11. AI recovery

Recover:

- prompts
- agent registry
- model configuration
- cache policy
- feature flags

Do not restore expired cache entries.

---

# 12. Data platform recovery

Recover:

- raw metadata
- canonical datasets
- publication pointers

If necessary:

- rerun ingestion
- rerun quality checks
- republish datasets

---

# 13. Third-party outage strategy

For each provider define:

- impact
- fallback
- degraded mode
- communication
- recovery criteria

---

# 14. Communication

During a disaster:

Internal updates include:

- impact
- ETA
- owner
- next update

External updates should be factual and avoid speculation.

---

# 15. Validation checklist

After recovery verify:

- authentication
- API health
- AI execution
- scheduled jobs
- uploads
- notifications
- dashboards
- monitoring
- billing
- backups

---

# 16. Disaster exercises

Run at least annually:

- tabletop exercise
- backup restore
- regional outage simulation
- secret compromise drill
- ransomware scenario

Record findings and corrective actions.

---

# 17. Documentation

Maintain:

```text
docs/dr/
├── disaster-recovery.md
├── recovery-runbooks.md
├── backup-policy.md
├── restore-checklists.md
├── provider-failover.md
└── exercise-reports/
```

---

# 18. Codex rules

Codex must:

1. keep services stateless where practical
2. support immutable deployments
3. avoid manual configuration drift
4. automate recovery steps
5. document dependencies
6. verify restore success
7. support recovery testing
8. never assume backups are valid without restore tests

---

# 19. Definition of done

DR readiness exists when:

- backups are healthy
- restores are tested
- infrastructure is reproducible
- runbooks exist
- RTO/RPO are monitored
- exercises are completed
- gaps are tracked
