# TrackMyProps Business Continuity

## 1. Purpose

This document defines how TrackMyProps continues essential operations during prolonged disruption.

Disaster recovery focuses on technology restoration. Business continuity covers the wider business.

---

# 2. Objectives

- protect users;
- maintain critical services;
- preserve legal and contractual obligations;
- sustain support and communications;
- prioritise limited resources;
- recover normal operations.

---

# 3. Disruption scenarios

- cloud or Supabase outage;
- AI or data provider loss;
- key staff unavailable;
- cyber incident;
- legal or regulatory restriction;
- cash-flow or funding pressure;
- commercial-data contract termination;
- mobile-store suspension;
- email or billing outage;
- office or regional emergency;
- pandemic or widespread illness;
- supplier insolvency.

---

# 4. Critical business functions

Priority 1:

- authentication and account security;
- access to stored portfolio data;
- data protection;
- incident response;
- billing integrity;
- privacy requests;
- user communication.

Priority 2:

- property and portfolio dashboards;
- deterministic calculations;
- document access;
- support.

Priority 3:

- AI analysis;
- listing discovery;
- enrichment;
- learning;
- non-critical notifications.

---

# 5. Maximum tolerable disruption

Each function must define:

```text
maximum_tolerable_outage
minimum_service_level
manual_workaround
owner
dependencies
recovery criteria
```

---

# 6. Continuity modes

## Normal

All services available.

## Degraded

Core portfolio access available; selected providers or AI disabled.

## Essential-only

Authentication, read access, privacy, support, and incident communication.

## Suspended

Access restricted to protect users or comply with legal/security needs.

---

# 7. Staff continuity

Maintain:

- role backups;
- documented credentials process;
- runbooks;
- emergency contacts;
- succession for key technical and business roles;
- vendor contacts;
- access revocation and transfer procedures.

No critical process should depend on one person’s undocumented knowledge.

---

# 8. Supplier continuity

For critical suppliers define:

- contract owner;
- support contact;
- outage process;
- export capability;
- termination rights;
- replacement option;
- migration effort;
- data return/deletion;
- financial exposure.

---

# 9. Data-provider continuity

If a commercial provider terminates access:

1. stop prohibited use;
2. preserve data only as contract allows;
3. disable affected feature;
4. notify users honestly;
5. activate approved alternative or manual input;
6. migrate canonical references;
7. remove restricted data on schedule.

---

# 10. AI-provider continuity

- maintain provider abstraction;
- pre-evaluate fallback for selected tasks;
- allow essential product operation without AI;
- preserve user domain data independently;
- avoid making AI a prerequisite for basic portfolio access.

---

# 11. Billing continuity

If billing provider fails:

- do not duplicate charges;
- preserve entitlement grace policy;
- continue core access for a defined period;
- reconcile after recovery;
- communicate material impact.

---

# 12. Mobile-store continuity

If app release is delayed or removed:

- maintain web access where possible;
- keep backend compatible with installed clients;
- use feature flags;
- communicate supported versions;
- avoid forced upgrade unless necessary.

---

# 13. Manual workarounds

Potential controlled workarounds:

- manual provider reconciliation;
- manual user entitlement correction;
- manual export generation;
- manual support notification;
- scheduled-job invocation;
- temporary read-only mode.

Manual actions must be audited.

---

# 14. Communications

Maintain templates for:

- service disruption;
- security incident;
- provider outage;
- delayed report;
- billing issue;
- privacy incident;
- recovery complete.

Messages must be factual and approved.

---

# 15. Financial continuity

Monitor:

- cash runway;
- provider commitments;
- cloud spend;
- data-contract minimums;
- refund exposure;
- incident costs;
- insurance.

Prioritise security, privacy, core service, and data export obligations.

---

# 16. Legal and regulatory continuity

Maintain access to:

- legal adviser;
- privacy owner;
- security contacts;
- insurance;
- contracts;
- incident records;
- regulator-notification process.

---

# 17. Records

Continuity records include:

```text
event
mode activated
decision owner
services disabled
manual workarounds
communications
supplier status
recovery date
follow-up actions
```

---

# 18. Exercises

At least annually:

- key-person absence;
- cloud/provider outage;
- billing outage;
- data-provider termination;
- security incident;
- extended essential-only mode.

---

# 19. Review triggers

Review after:

- major incident;
- provider change;
- staff change;
- funding change;
- legal change;
- international expansion;
- new critical product dependency.

---

# 20. Codex rules

Codex must:

1. support feature-level disablement;
2. preserve core operation without AI;
3. provide read-only/degraded modes;
4. document critical dependencies;
5. automate safe manual-workaround controls;
6. keep data export available where possible;
7. avoid single-person operational dependencies;
8. update continuity documentation with new critical suppliers.
