# TrackMyProps Permissions Matrix

## 1. Purpose

This document defines the permissions model for TrackMyProps.

It applies to:

```text
TrackMyProps/
├── frontend/
├── backend/
├── ai-platform/
└── data-platform/
```

It covers:

- user roles;
- household membership;
- resource-level actions;
- service identities;
- row-level security;
- internal API access;
- approval boundaries;
- support and administrative access;
- billing and entitlement checks;
- data-provider restrictions;
- audit requirements;
- security testing.

The permissions model must remain consistent with:

```text
security.md
database.md
api-design.md
contracts.md
event-catalogue.md
```

---

# 2. Core principles

1. Authentication is not authorisation.
2. Frontend controls do not grant permission.
3. Backend and database enforce access.
4. Every protected record belongs to a household, user, or system scope.
5. Access is denied by default.
6. Roles grant only minimum required access.
7. Sensitive actions require explicit permission.
8. Consequential actions may require approval in addition to permission.
9. Service identities receive narrower permissions than human users.
10. Support access is exceptional, visible, and audited.
11. Cross-household access is prohibited unless explicitly approved by policy.
12. Entitlements do not override security permissions.
13. Data-provider licence restrictions may further reduce access.
14. Permissions must be testable.
15. All role and permission changes are audited.

---

# 3. Role model

Primary household roles:

```text
owner
admin
member
viewer
advisor
```

Operational roles:

```text
support
system_admin
security_admin
billing_admin
data_operator
```

Service identities:

```text
backend_service
ai_service
data_ingest_service
data_publish_service
scheduler_service
deployment_service
notification_service
email_service
```

---

# 4. Household role definitions

## 4.1 Owner

The owner has the broadest household authority.

May:

- manage household settings;
- manage members and roles;
- manage properties and portfolio data;
- manage billing where policy allows;
- approve consequential actions;
- request export;
- request deletion;
- send approved communications;
- configure notifications;
- manage documents;
- create and run AI analyses;
- manage scenarios;
- manage learning preferences.

Restrictions:

- cannot bypass provider restrictions;
- cannot bypass legal or system security controls;
- cannot access other households;
- cannot directly access internal service APIs.

---

## 4.2 Admin

May:

- manage most household operational data;
- manage properties;
- manage loans, income, expenses, leases, valuations, and documents;
- create AI analyses and scenarios;
- approve communications where policy allows;
- manage selected members;
- configure notifications.

Restrictions:

- may not transfer household ownership;
- may not delete the household unless explicitly allowed;
- may not manage billing ownership unless granted;
- may not change owner role;
- may not access other households.

---

## 4.3 Member

May:

- view household portfolio;
- create and edit operational property data;
- create scenarios;
- request AI analysis;
- create communication drafts;
- upload documents;
- manage inspections and maintenance;
- update learning progress.

Restrictions:

- cannot manage household membership;
- cannot manage billing;
- cannot delete household;
- cannot approve or send communication unless explicitly granted;
- cannot change security-sensitive settings.

---

## 4.4 Viewer

May:

- view authorised household data;
- view properties;
- view financial summaries;
- view recommendations;
- view documents where permitted;
- view scenarios;
- view learning content.

Restrictions:

- read-only;
- cannot request consequential operations;
- cannot upload, edit, delete, approve, or send;
- cannot create AI executions if usage incurs cost unless explicitly permitted by entitlement policy.

---

## 4.5 Advisor

Purpose:

- accountant;
- mortgage broker;
- financial adviser;
- buyer’s agent;
- other approved professional.

May:

- view explicitly assigned household or resource scope;
- view selected property, financial, and document data;
- create notes or recommendations if enabled;
- participate in scenarios where approved.

Restrictions:

- no default access to all household data;
- no member management;
- no billing access;
- no external communication sending;
- no deletion;
- no access to unrelated personal information;
- access must be time-bound or reviewable where possible.

---

# 5. Operational role definitions

## 5.1 Support

May:

- view account metadata;
- view non-sensitive diagnostics;
- view support references;
- inspect request and execution status;
- access selected support tools.

Restrictions:

- no default access to full property, financial, or document content;
- no password or token access;
- no direct database access;
- no role changes;
- no sending on behalf of user;
- no hidden impersonation.

Any elevated support session must be visible and audited.

---

## 5.2 System administrator

May:

- manage infrastructure and operational configuration;
- manage deployment and service status;
- access restricted administrative tools.

Restrictions:

- should not automatically access user data;
- must use separate administrative identity;
- MFA required;
- all sensitive actions audited;
- least privilege applies.

---

## 5.3 Security administrator

May:

- review security alerts;
- review restricted audit events;
- manage incident response;
- manage security configuration;
- revoke sessions or credentials.

Restrictions:

- access to user content only when required for incident investigation;
- access must be documented and audited.

---

## 5.4 Billing administrator

May:

- review subscription and payment status;
- manage billing configuration;
- review billing webhooks and reconciliation.

Restrictions:

- no default access to detailed property records;
- no AI prompt or document access.

---

## 5.5 Data operator

May:

- run approved data pipelines;
- review data quality;
- inspect lineage;
- replay approved jobs;
- manage dataset publication.

Restrictions:

- no household financial data;
- no unrestricted provider access;
- no bypass of source licence controls.

---

# 6. Service identities

## 6.1 Backend service

May:

- read and write backend-owned schemas;
- validate user access;
- execute deterministic calculations;
- manage communication approvals;
- create audit records;
- call AI platform;
- read curated data;
- generate signed URLs;
- send notifications and email through approved services.

Must not:

- bypass household permissions without system reason;
- expose service credentials;
- use unrestricted provider access.

---

## 6.2 AI service

May:

- read approved backend tool responses;
- read approved curated data;
- write AI execution state;
- write AI cache and memory;
- create recommendations and drafts through backend tools;
- call approved model providers.

Must not:

- directly update property, loan, lease, valuation, billing, or approval tables;
- send communications;
- access arbitrary database tables;
- query another household;
- use unrestricted HTTP or SQL.

---

## 6.3 Data ingest service

May:

- call approved source endpoints;
- store raw artefacts;
- write staging data;
- write pipeline metadata;
- create quality results.

Must not:

- publish directly to frontend-facing tables unless explicitly designed;
- access household financial records;
- use source credentials outside assigned source.

---

## 6.4 Data publish service

May:

- write canonical and curated schemas;
- publish dataset versions;
- create lineage;
- emit data events.

Must not:

- access user documents or communications;
- modify backend household domain records.

---

## 6.5 Scheduler service

May:

- invoke approved jobs and internal endpoints;
- create scheduled execution requests.

Must not:

- contain plaintext secrets in schedules;
- invoke arbitrary endpoints.

---

## 6.6 Deployment service

May:

- build and push images;
- deploy services;
- update jobs;
- use runtime service accounts.

Must not:

- access production user data;
- read all secrets;
- run as runtime service identity.

---

# 7. Permission notation

Use:

```text
C = create
R = read
U = update
D = delete
A = approve
S = send or execute consequential action
M = manage permissions or configuration
```

Additional values:

```text
Scoped = limited to explicit assignment
Conditional = depends on policy, entitlement, or approval
No = denied
```

---

# 8. Household resource matrix

| Resource / Action | Owner | Admin | Member | Viewer | Advisor |
|---|---|---|---|---|---|
| View household | R | R | R | R | Scoped |
| Update household | U | U | No | No | No |
| Delete household | Conditional | No | No | No | No |
| Manage members | M | Conditional | No | No | No |
| Change owner | Conditional | No | No | No | No |
| View billing | R | Conditional | No | No | No |
| Manage billing | M | Conditional | No | No | No |
| Export household | C/R | Conditional | No | No | No |
| Request household deletion | C | No | No | No | No |

---

# 9. Property matrix

| Action | Owner | Admin | Member | Viewer | Advisor |
|---|---|---|---|---|---|
| List properties | R | R | R | R | Scoped |
| Create property | C | C | C | No | No |
| View property | R | R | R | R | Scoped |
| Update property | U | U | U | No | No |
| Archive property | U | U | Conditional | No | No |
| Restore property | U | U | Conditional | No | No |
| Delete property | D | Conditional | No | No | No |
| View property history | R | R | R | R | Scoped |
| View audit history | R | R | Conditional | No | No |

---

# 10. Acquisition and ownership matrix

| Action | Owner | Admin | Member | Viewer | Advisor |
|---|---|---|---|---|---|
| View acquisition | R | R | R | R | Scoped |
| Create/update acquisition | C/U | C/U | C/U | No | Conditional |
| Delete acquisition | D | Conditional | No | No | No |
| View ownership | R | R | R | R | Scoped |
| Create ownership record | C | C | Conditional | No | No |
| Update ownership | U | U | Conditional | No | No |
| Delete ownership | D | Conditional | No | No | No |

Ownership changes may require owner approval depending on product policy.

---

# 11. Loan and finance matrix

| Action | Owner | Admin | Member | Viewer | Advisor |
|---|---|---|---|---|---|
| View loans | R | R | R | R | Scoped |
| Create loan | C | C | C | No | Conditional |
| Update loan | U | U | U | No | Conditional |
| Delete loan | D | Conditional | No | No | No |
| View offset/redraw | R | R | R | R | Scoped |
| Update offset/redraw | U | U | U | No | Conditional |
| View income | R | R | R | R | Scoped |
| Create/update income | C/U | C/U | C/U | No | Conditional |
| Delete income | D | D | Conditional | No | No |
| View expenses | R | R | R | R | Scoped |
| Create/update expenses | C/U | C/U | C/U | No | Conditional |
| Delete expenses | D | D | Conditional | No | No |
| View calculations | R | R | R | R | Scoped |
| Trigger recalculation | S | S | S | No | Conditional |

---

# 12. Lease matrix

| Action | Owner | Admin | Member | Viewer | Advisor |
|---|---|---|---|---|---|
| View leases | R | R | R | R | Scoped |
| Create lease | C | C | C | No | Conditional |
| Update lease | U | U | U | No | Conditional |
| End lease | S | S | Conditional | No | No |
| Delete lease | D | Conditional | No | No | No |
| Add rent review | C | C | C | No | Conditional |
| View vacancy history | R | R | R | R | Scoped |

---

# 13. Valuation matrix

| Action | Owner | Admin | Member | Viewer | Advisor |
|---|---|---|---|---|---|
| View valuations | R | R | R | R | Scoped |
| Add user valuation | C | C | C | No | Conditional |
| Request external valuation | S | S | Conditional | No | Conditional |
| Update valuation | U | U | Conditional | No | No |
| Select preferred valuation | S | S | Conditional | No | No |
| Delete valuation | D | Conditional | No | No | No |

External valuation access may also depend on subscription entitlement and provider licence.

---

# 14. Portfolio matrix

| Action | Owner | Admin | Member | Viewer | Advisor |
|---|---|---|---|---|---|
| View portfolio | R | R | R | R | Scoped |
| View portfolio performance | R | R | R | R | Scoped |
| View risk summary | R | R | R | R | Scoped |
| Trigger portfolio recalculation | S | S | S | No | Conditional |
| View historical snapshots | R | R | R | R | Scoped |
| Export portfolio | C | Conditional | No | No | No |

---

# 15. Scenario matrix

| Action | Owner | Admin | Member | Viewer | Advisor |
|---|---|---|---|---|---|
| View scenarios | R | R | R | R | Scoped |
| Create scenario | C | C | C | No | Conditional |
| Update scenario | U | U | U | No | Conditional |
| Run scenario | S | S | S | No | Conditional |
| Compare scenarios | S | S | S | No | Conditional |
| Delete scenario | D | D | Conditional | No | No |
| Share scenario internally | Conditional | Conditional | Conditional | No | No |

Scenario output does not itself grant permission to change financial records.

---

# 16. AI execution matrix

| Action | Owner | Admin | Member | Viewer | Advisor |
|---|---|---|---|---|---|
| View AI executions | R | R | R | Conditional | Scoped |
| Create AI execution | C | C | C | Conditional | Conditional |
| Cancel own execution | S | S | S | No | Conditional |
| Retry execution | S | S | S | No | Conditional |
| Submit requested input | U | U | U | No | Conditional |
| View execution cost | R | R | Conditional | No | No |
| View raw internal trace | No | No | No | No | No |

Entitlement and quota checks apply in addition to role permissions.

---

# 17. Recommendation matrix

| Action | Owner | Admin | Member | Viewer | Advisor |
|---|---|---|---|---|---|
| View recommendations | R | R | R | R | Scoped |
| Acknowledge | S | S | S | Conditional | Conditional |
| Dismiss | S | S | S | Conditional | Conditional |
| Mark completed | S | S | S | No | Conditional |
| Provide feedback | C | C | C | C | Conditional |
| Delete recommendation | No | No | No | No | No |

Recommendations should usually be expired or archived rather than manually deleted.

---

# 18. Listing and watchlist matrix

| Action | Owner | Admin | Member | Viewer | Advisor |
|---|---|---|---|---|---|
| View watchlists | R | R | R | R | Scoped |
| Create watchlist | C | C | C | No | Conditional |
| Update watchlist | U | U | U | No | Conditional |
| Delete watchlist | D | D | Conditional | No | No |
| View listings | R | R | R | R | Scoped |
| Shortlist listing | S | S | S | Conditional | Conditional |
| Reject listing | S | S | S | Conditional | Conditional |
| Request listing analysis | C | C | C | Conditional | Conditional |

Provider display and export restrictions apply.

---

# 19. Communication matrix

| Action | Owner | Admin | Member | Viewer | Advisor |
|---|---|---|---|---|---|
| View drafts | R | R | R | Conditional | Scoped |
| Create draft | C | C | C | No | Conditional |
| Edit draft | U | U | U | No | Conditional |
| Approve draft | A | Conditional | No | No | No |
| Send draft | S | Conditional | No | No | No |
| Cancel draft | S | S | Conditional | No | No |
| View sent messages | R | R | R | Conditional | Scoped |
| Retry failed send | S | Conditional | No | No | No |

Default initial policy:

```text
Only owner may approve and send EOI or negotiation messages.
```

A future household setting may allow admin approval.

Member approval must not be enabled by default.

---

# 20. Document matrix

| Action | Owner | Admin | Member | Viewer | Advisor |
|---|---|---|---|---|---|
| View document metadata | R | R | R | R | Scoped |
| Download document | R | R | R | Conditional | Scoped |
| Upload document | C | C | C | No | Conditional |
| Request analysis | C | C | C | Conditional | Conditional |
| View analysis | R | R | R | R | Scoped |
| Delete document | D | D | Conditional | No | No |
| Export document | R | Conditional | No | No | Scoped |

Some document types may require stronger restrictions.

Examples:

- contracts;
- loan statements;
- tenant-related documents;
- identity records.

---

# 21. Inspection and maintenance matrix

| Action | Owner | Admin | Member | Viewer | Advisor |
|---|---|---|---|---|---|
| View inspections | R | R | R | R | Scoped |
| Create inspection | C | C | C | No | Conditional |
| Update inspection | U | U | U | No | Conditional |
| Add finding | C | C | C | No | Conditional |
| Upload inspection media | C | C | C | No | Conditional |
| Create maintenance request | C | C | C | No | Conditional |
| Update maintenance request | U | U | U | No | Conditional |
| Complete maintenance request | S | S | Conditional | No | No |

---

# 22. Learning matrix

| Action | Owner | Admin | Member | Viewer | Advisor |
|---|---|---|---|---|---|
| View learning content | R | R | R | R | R |
| Start learning path | C | C | C | C | C |
| Submit quiz | C | C | C | C | C |
| View own progress | R | R | R | R | R |
| View another member’s progress | Conditional | Conditional | No | No | No |
| Reset own progress | U | U | U | U | U |

Learning progress is user-scoped unless household sharing is explicitly enabled.

---

# 23. Notification matrix

| Action | Owner | Admin | Member | Viewer | Advisor |
|---|---|---|---|---|---|
| View own notifications | R | R | R | R | R |
| Mark own notification read | U | U | U | U | U |
| Manage own preferences | U | U | U | U | U |
| Manage household-wide defaults | M | Conditional | No | No | No |
| Register own device | C | C | C | C | C |
| Remove own device | D | D | D | D | D |

---

# 24. Billing and entitlement matrix

| Action | Owner | Admin | Member | Viewer | Advisor |
|---|---|---|---|---|---|
| View subscription | R | Conditional | No | No | No |
| Manage subscription | M | Conditional | No | No | No |
| View usage | R | Conditional | Conditional | No | No |
| Create checkout | C | Conditional | No | No | No |
| Open billing portal | C | Conditional | No | No | No |
| View invoices | R | Conditional | No | No | No |

Entitlement governs availability, but role still governs resource access.

---

# 25. Export and deletion matrix

| Action | Owner | Admin | Member | Viewer | Advisor |
|---|---|---|---|---|---|
| Export own profile | C | C | C | C | C |
| Export household | C | Conditional | No | No | No |
| Export property | C | Conditional | No | No | No |
| Request own account deletion | C | C | C | C | C |
| Request household deletion | C | No | No | No | No |
| Cancel deletion request | Conditional | No | No | No | No |

Deletion requires re-authentication where appropriate.

---

# 26. Audit matrix

| Action | Owner | Admin | Member | Viewer | Advisor |
|---|---|---|---|---|---|
| View selected household audit | R | R | Conditional | No | No |
| View security audit | No | No | No | No | No |
| Export audit | Conditional | No | No | No | No |
| Modify audit records | No | No | No | No | No |

Audit records are append-only.

---

# 27. RLS mapping

Every user-facing table must resolve access through:

```text
auth.uid()
    ↓
household_membership
    ↓
household_id
    ↓
resource
```

Typical read policy:

```sql
exists (
  select 1
  from backend.household_memberships hm
  where hm.household_id = resource.household_id
    and hm.user_id = auth.uid()
    and hm.status = 'active'
)
```

Write policies must also check role and resource-specific permission.

---

# 28. RLS helper functions

Recommended helpers:

```text
is_household_member(household_id)
has_household_role(household_id, allowed_roles)
can_read_property(property_id)
can_update_property(property_id)
can_manage_household(household_id)
```

Security-definer functions must:

- use fixed search path;
- avoid dynamic SQL;
- have minimal grants;
- be version controlled;
- be tested.

---

# 29. Backend authorisation

Backend authorisation should use a central policy layer.

Example policy check:

```python
permission_service.require(
    actor=user,
    action="property.update",
    resource=property_record,
)
```

Avoid scattered inline role checks.

---

# 30. Permission naming

Use stable permission identifiers.

Examples:

```text
household.read
household.update
household.members.manage
property.create
property.read
property.update
property.delete
loan.manage
scenario.run
ai.execute
communication.approve
communication.send
document.download
billing.manage
```

Roles map to permissions.

Do not hardcode role names as the only long-term policy model.

---

# 31. Attribute-based checks

Role alone is insufficient.

Additional attributes may include:

- resource household;
- assigned property;
- document sensitivity;
- user entitlement;
- communication type;
- approval status;
- ownership state;
- account status;
- environment;
- provider licence;
- feature flag.

Example:

```text
admin may approve general household email
but only owner may approve an EOI
```

---

# 32. Approval versus permission

Permission means the actor may request or perform the action.

Approval means the action has passed an explicit review boundary.

Example:

```text
member has permission to create EOI draft
owner must approve
backend may send only after valid approval
```

Approval records must contain:

```text
actor
resource
version
recipient
content snapshot
approved_at
expires_at
```

---

# 33. Communication approval invalidation

Approval becomes invalid when:

- subject changes;
- body changes;
- recipient changes;
- offer amount changes;
- finance status changes;
- conditions change;
- approval expires;
- listing changes materially where policy requires.

The backend must enforce this.

---

# 34. Advisor scope

Advisor access must include explicit assignments.

Example:

```text
advisor_assignment
├── user_id
├── household_id
├── property_ids
├── permission_set
├── valid_from
├── valid_until
└── status
```

Advisor access should not automatically expand when new properties are added.

---

# 35. Support access

Support access should operate through restricted support tooling.

Support may see:

- account ID;
- subscription status;
- app version;
- request trace;
- execution status;
- error code;
- feature flags;
- non-sensitive metadata.

Support should not see by default:

- full loan details;
- full documents;
- full emails;
- tenant details;
- model prompts;
- raw provider payloads.

---

# 36. Impersonation

If implemented, impersonation requires:

- approved operational reason;
- elevated role;
- MFA;
- visible user interface banner;
- start and end timestamps;
- full audit;
- blocked consequential actions by default;
- no access to secrets;
- optional user notification according to policy.

Hidden impersonation is prohibited.

---

# 37. Administrative break-glass access

Break-glass access requires:

- dedicated identity;
- MFA;
- explicit activation;
- incident or support reference;
- time limit;
- alerts;
- session recording or detailed audit where appropriate;
- post-use review.

Break-glass must not be used for routine work.

---

# 38. Service-to-service matrix

| Caller | Target | Allowed purpose |
|---|---|---|
| Backend service | AI service | Start, query, cancel AI execution |
| AI service | Backend tools | Read approved context, calculate, persist recommendation/draft |
| Data ingest | Source providers | Retrieve approved source data |
| Data ingest | Staging DB/storage | Write raw and staging data |
| Data publish | Canonical/curated DB | Publish approved datasets |
| Data publish | Backend event endpoint | Publish dataset events |
| Scheduler | Cloud Run Jobs/backend | Trigger approved scheduled tasks |
| Deployment service | Cloud Run/Registry | Build and deploy |
| Notification service | Push provider | Deliver notifications |
| Email service | Email provider | Send approved communication |

No caller receives unrestricted cross-service access.

---

# 39. Internal tool permissions

AI tools must use explicit permission names.

Examples:

```text
tool.property_context.read
tool.portfolio_context.read
tool.financial_summary.read
tool.suburb_data.read
tool.scenario.calculate
tool.recommendation.create
tool.communication_draft.create
tool.briefing.create
```

There must be no:

```text
tool.database.query_any
tool.http.call_any
tool.email.send_any
```

---

# 40. Data-provider permissions

Provider licences may limit:

- which users can see data;
- which subscription tiers can access data;
- whether data may be exported;
- whether data may be cached;
- whether AI may use it;
- whether derived values may be displayed;
- how long raw payloads may be stored.

Provider policy must be checked after role and entitlement checks.

---

# 41. Subscription entitlements

Potential entitlements:

```text
portfolio_basic
portfolio_advanced
ai_property_analysis
ai_portfolio_analysis
prediction
listing_discovery
document_analysis
eoi_drafting
cio_briefing
data_export
advisor_access
```

Access decision:

```text
authenticated
AND authorised
AND entitled
AND feature_enabled
AND within_quota
```

Entitlement alone does not grant access to another household.

---

# 42. Quota enforcement

Potential quotas:

```text
AI executions per month
document analyses per month
valuation requests per month
listing matches
exports
communications
```

Quota override requires approved role and audit.

---

# 43. Permission-change events

Emit:

```text
household.member_added
household.member_role_changed
household.member_removed
advisor.assignment_created
advisor.assignment_expired
support.elevated_access_started
support.elevated_access_ended
```

All changes must invalidate relevant permission caches.

---

# 44. Permission caching

Permission caching may be used only with:

- short TTL;
- role-version key;
- household membership version;
- event invalidation;
- fail-closed fallback.

Never cache a positive permission indefinitely.

---

# 45. Permission audit

Audit:

- role changes;
- member invitations;
- member removal;
- advisor assignments;
- approval;
- send;
- deletion;
- export;
- support elevation;
- break-glass activation;
- service identity failure;
- permission denial for sensitive resources.

---

# 46. Error codes

Suggested errors:

```text
AUTH_REQUIRED
SESSION_EXPIRED
HOUSEHOLD_ACCESS_DENIED
ROLE_PERMISSION_DENIED
RESOURCE_ACCESS_DENIED
ADVISOR_SCOPE_DENIED
ENTITLEMENT_REQUIRED
QUOTA_EXCEEDED
APPROVAL_REQUIRED
APPROVAL_EXPIRED
APPROVAL_INVALIDATED
PROVIDER_DISPLAY_RESTRICTED
SERVICE_IDENTITY_DENIED
ADMIN_ELEVATION_REQUIRED
```

Do not expose unnecessary policy internals.

---

# 47. Permission testing

Required tests:

- owner access;
- admin restrictions;
- member restrictions;
- viewer read-only;
- advisor explicit scope;
- inactive membership;
- removed membership;
- expired advisor assignment;
- cross-household access;
- entitlement failure;
- quota failure;
- approval failure;
- provider restriction;
- service identity mismatch;
- support elevation;
- break-glass expiry;
- permission cache invalidation.

---

# 48. RLS negative tests

For every protected table test:

```text
user outside household cannot select
user outside household cannot insert
user outside household cannot update
user outside household cannot delete
viewer cannot write
advisor cannot exceed assignment
inactive member cannot access
```

---

# 49. Admin-security tests

Test:

- admin endpoint requires admin identity;
- system admin cannot automatically read user data;
- support cannot send communication;
- billing admin cannot read documents;
- data operator cannot read household loans;
- deployment identity cannot read application database;
- break-glass alerts fire.

---

# 50. Permission documentation

Maintain:

```text
docs/security/
├── permissions-matrix.md
├── role-definitions.md
├── permission-identifiers.md
├── rls-policies.md
├── service-accounts.md
├── advisor-access.md
├── support-access.md
└── approval-boundaries.md
```

---

# 51. Codex rules

Codex must:

1. centralise authorisation;
2. define stable permission identifiers;
3. enforce access in backend and RLS;
4. deny by default;
5. test cross-household access;
6. keep viewer read-only;
7. keep advisor access explicitly scoped;
8. separate permission from approval;
9. prevent AI from sending;
10. restrict service identities;
11. invalidate permission caches on role change;
12. audit sensitive actions;
13. never use frontend state as authority;
14. document new permissions;
15. add tests for every role and sensitive action.

---

# 52. Definition of done

The permissions model is complete when:

- household roles are defined;
- operational roles are defined;
- service identities are defined;
- resource matrices exist;
- permission identifiers exist;
- RLS policies align with backend policies;
- advisor scope is explicit;
- support access is restricted;
- break-glass is controlled;
- communication approval is separate from send permission;
- provider restrictions are enforced;
- entitlement and quota checks are layered;
- permission caches invalidate;
- audit events are written;
- cross-household tests pass;
- service-to-service access is least privilege;
- no protected action depends only on frontend controls.

---

# 53. Final permission principle

For every TrackMyProps action, the platform must answer:

```text
Who is the actor?
Which role and permissions do they have?
Which household and resource are in scope?
Does an entitlement apply?
Does a provider restriction apply?
Is explicit approval required?
Which service performs the action?
How is the decision audited?
```

If those questions cannot be answered deterministically, the action must be denied.
