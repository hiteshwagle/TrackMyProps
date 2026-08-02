# TrackMyProps Support Operations

## 1. Purpose

This document defines customer-support processes, support access, escalation, privacy, tooling, and service-quality expectations.

---

# 2. Principles

1. Support uses minimum necessary data.
2. The user remains informed.
3. Support does not bypass security.
4. Sensitive actions require escalation.
5. Diagnostics use trace IDs and safe metadata.
6. Every support case has ownership.
7. Product defects feed engineering prioritisation.
8. Privacy and security reports are escalated immediately.

---

# 3. Support tiers

## Tier 1

- account guidance;
- navigation;
- billing FAQs;
- known issues;
- basic data-entry help.

## Tier 2

- execution status;
- integration and provider issues;
- reproducible product defects;
- entitlement reconciliation;
- document-processing issues.

## Tier 3

- engineering investigation;
- database or service incidents;
- AI regressions;
- security;
- privacy;
- data-quality defects.

---

# 4. Case fields

```text
case_id
user_id
household_id
category
priority
status
summary
created_at
owner
trace_id
affected_feature
release
privacy_flag
security_flag
resolution
```

Do not copy unnecessary sensitive content into tickets.

---

# 5. Priority

## P1

- active security/privacy issue;
- total inability to access account;
- duplicate or unauthorised communication;
- billing harm affecting many users.

## P2

- major feature unavailable;
- repeated AI or data failure;
- export/deletion failure;
- material calculation defect.

## P3

- isolated defect;
- degraded experience;
- incorrect non-critical display.

## P4

- question;
- feature request;
- cosmetic issue.

---

# 6. Response targets

Targets should be finalised commercially.

Suggested starting point:

| Priority | Initial response |
|---|---:|
| P1 | 30 minutes during staffed coverage |
| P2 | 4 business hours |
| P3 | 1 business day |
| P4 | 2 business days |

Do not promise resolution times without evidence.

---

# 7. Support access

Default support view may include:

- account ID;
- subscription;
- app version;
- environment;
- trace status;
- error code;
- AI execution status;
- provider status;
- non-sensitive metadata.

Default support must not include:

- full loan details;
- full documents;
- full EOI content;
- access tokens;
- tenant details;
- raw model prompts;
- unrestricted SQL.

---

# 8. Elevated support access

Requires:

- approved reason;
- time limit;
- named user;
- MFA;
- audit;
- read-only by default;
- blocked communication and billing side effects;
- visible session status where appropriate.

---

# 9. Identity verification

Before sensitive account support:

- authenticated session;
- re-authentication;
- verified email;
- targeted account verification.

Avoid requesting new identity documents unless necessary.

---

# 10. Common support workflows

## Account access

- verify identity;
- check Auth status;
- review session and account flags;
- never ask for password;
- revoke compromised sessions.

## Missing property data

- verify household and property scope;
- check latest API request;
- inspect data freshness;
- distinguish user input, provider, and derived data.

## AI execution failed

- obtain execution ID;
- inspect safe status and error code;
- retry only when allowed;
- escalate repeated validation or provider failure.

## Document analysis issue

- verify upload and scan status;
- check parser and agent version;
- do not ask user to email sensitive document unless approved secure channel exists.

## Billing issue

- check backend and provider state;
- verify webhook;
- do not accept screenshot as authoritative payment state;
- escalate refunds according to policy.

## EOI send issue

- inspect draft version, approval, idempotency, and provider reference;
- prevent duplicate resend;
- escalate unauthorised or wrong-recipient cases immediately.

---

# 11. Privacy requests

Requests for:

- access;
- correction;
- export;
- deletion;
- complaint;
- consent withdrawal

must enter the privacy workflow and not be handled informally.

---

# 12. Security reports

Immediately escalate:

- cross-household data;
- exposed document;
- account takeover;
- phishing;
- secret exposure;
- unauthorised communication;
- suspicious payment activity.

Preserve evidence and do not speculate.

---

# 13. Communication style

Support responses should be:

- clear;
- factual;
- respectful;
- specific about what is known;
- honest about limitations;
- explicit about next action.

Avoid:

- blaming the user;
- unsupported legal claims;
- guaranteed resolution dates;
- revealing internal security details.

---

# 14. Escalation

Escalate based on:

- severity;
- user harm;
- privacy;
- security;
- repeated defect;
- financial impact;
- provider outage;
- unresolved support target.

Link support cases to incident records when systemic.

---

# 15. Known-issue management

Maintain:

```text
issue_id
summary
affected_versions
workaround
status
owner
linked_incident
fixed_version
```

Do not publish a workaround that weakens security.

---

# 16. Support tooling

Required capabilities:

- case management;
- trace search;
- execution status;
- release lookup;
- provider health;
- entitlement view;
- safe audit view;
- elevation workflow;
- canned responses;
- escalation.

---

# 17. Quality assurance

Review samples for:

- accuracy;
- privacy;
- tone;
- correct escalation;
- resolution;
- unnecessary data access;
- documentation quality.

---

# 18. Metrics

```text
first response time
time to resolution
reopen rate
escalation rate
case volume by category
defect recurrence
user satisfaction
privacy cases
security cases
elevated-access use
```

---

# 19. Feedback loop

Support insights feed:

- roadmap;
- defect backlog;
- documentation;
- onboarding;
- AI evaluations;
- provider review;
- product copy;
- runbooks.

---

# 20. Training

Support staff require:

- product training;
- privacy;
- security;
- AI limitations;
- billing;
- EOI approval boundaries;
- incident escalation;
- communication standards.

---

# 21. Codex rules

Codex must:

1. expose safe support diagnostics;
2. require trace IDs;
3. restrict support access;
4. audit elevation;
5. block side effects during impersonation;
6. provide stable user-facing error codes;
7. link cases to incidents;
8. avoid sensitive payloads in tickets;
9. support privacy workflows;
10. document new support-relevant features.
