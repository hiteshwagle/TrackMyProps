# TrackMyProps Privacy and Retention Policy

## 1. Purpose

This document defines the privacy, consent, data-handling, retention, deletion, residency, subprocessor, AI-use, access, correction, complaint, and breach-response requirements for TrackMyProps.

It applies to:

```text
TrackMyProps/
├── frontend/
├── backend/
├── ai-platform/
└── data-platform/
```

It must remain consistent with:

```text
security.md
permissions-matrix.md
data-dictionary.md
data-sources.md
contracts.md
api-design.md
observability.md
event-catalogue.md
```

This is a product and engineering specification, not a substitute for legal advice. Before production launch, TrackMyProps should obtain Australian privacy-law review of its privacy policy, collection notices, consent flows, provider agreements, international data transfers, automated decision-making disclosures, and retention schedule.

---

# 2. Legal baseline

TrackMyProps should design to comply with the Australian Privacy Act 1988 and the Australian Privacy Principles even if a small-business exemption may initially apply.

The Privacy Act generally applies to:

- Australian Government agencies;
- organisations with annual turnover above AUD 3 million;
- some smaller organisations regardless of turnover;
- organisations that opt in;
- certain entities handling particular categories of information or activities.

TrackMyProps must not rely on a small-business exemption without current legal confirmation.

The operational baseline is:

```text
Comply with the APPs by design.
```

---

# 3. Australian Privacy Principles mapping

TrackMyProps must address:

```text
APP 1  Open and transparent management
APP 2  Anonymity and pseudonymity
APP 3  Collection of solicited personal information
APP 4  Unsolicited personal information
APP 5  Notification of collection
APP 6  Use and disclosure
APP 7  Direct marketing
APP 8  Cross-border disclosure
APP 9  Government-related identifiers
APP 10 Data quality
APP 11 Security, destruction, and de-identification
APP 12 Access
APP 13 Correction
```

---

# 4. Privacy governance

TrackMyProps must appoint an accountable privacy owner.

Responsibilities:

- maintain the privacy-management program;
- keep the privacy policy current;
- approve privacy notices;
- review new data flows;
- manage privacy complaints;
- maintain the subprocessor register;
- approve retention classes;
- coordinate breach assessment;
- oversee privacy impact assessments;
- monitor legislative changes;
- document decisions.

Recommended governance roles:

```text
Privacy Owner
Security Owner
Data Owner
AI Governance Owner
Incident Commander
Legal Adviser
```

---

# 5. Privacy by design

Privacy must be considered before implementing:

- new property-data sources;
- document extraction;
- AI memory;
- model-provider integrations;
- behavioural analytics;
- advisor access;
- support tooling;
- listing feeds;
- user exports;
- automated recommendations;
- personalised notifications;
- identity verification;
- new international subprocessors.

A privacy impact assessment should be performed for high-risk or materially changed processing.

---

# 6. Privacy impact assessment triggers

Conduct a PIA before:

- introducing a new AI agent that uses personal information;
- using personal information for model training or fine-tuning;
- making decisions that may significantly affect a person’s rights or interests;
- introducing automated advisor or lending-related outputs;
- ingesting tenant or owner data;
- integrating a new property or identity provider;
- transferring data to a new overseas recipient;
- introducing behavioural tracking or advertising;
- materially expanding document analysis;
- combining datasets in a way that creates new profiles;
- implementing hidden or elevated support access;
- collecting government identifiers;
- introducing children as intended users.

The PIA must be treated as an ongoing risk-management process, not a one-time formality.

---

# 7. Data minimisation

TrackMyProps must collect only information reasonably necessary for its product functions.

Do not collect “just in case”.

Examples:

## Necessary

- user account details;
- household membership;
- property address;
- loan and expense information entered by the user;
- property documents selected by the user;
- communication recipient entered or confirmed by the user;
- usage needed for billing and security.

## Generally unnecessary

- tenant date of birth;
- tenant identity documents;
- owner title records containing names not needed for the product;
- full bank account numbers;
- copies of unrelated personal documents;
- contact books;
- precise device location without a feature need;
- unrelated email inbox access;
- model-training rights over user documents by default.

Publicly available personal information is still personal information and must not be collected indiscriminately.

---

# 8. Categories of information

## 8.1 Account information

Examples:

- name;
- email;
- authentication identifier;
- timezone;
- account status;
- legal acceptance records.

## 8.2 Household information

Examples:

- household name;
- members;
- roles;
- advisor assignments.

## 8.3 Property information

Examples:

- address;
- attributes;
- acquisition;
- valuations;
- inspections;
- maintenance;
- property-manager details.

## 8.4 Financial information

Examples:

- purchase price;
- loan balance;
- interest rate;
- repayment;
- rent;
- expenses;
- cash flow;
- scenarios.

This is highly sensitive in product context even where it is not legally classified as sensitive information.

## 8.5 Document information

Examples:

- contracts;
- lease documents;
- loan statements;
- strata reports;
- inspection reports;
- valuations;
- rates notices;
- insurance records.

## 8.6 Communications

Examples:

- EOI drafts;
- email subject and body;
- recipient;
- delivery status;
- negotiation notes.

## 8.7 AI information

Examples:

- agent execution metadata;
- prompts derived from user requests;
- structured outputs;
- recommendations;
- evidence references;
- AI memory;
- cache entries;
- token and cost metadata.

## 8.8 Technical information

Examples:

- device;
- platform;
- app version;
- IP-derived security events;
- session metadata;
- logs;
- trace IDs;
- crash reports.

## 8.9 External and public data

Examples:

- market data;
- demographics;
- sales;
- listings;
- school information;
- planning;
- hazards;
- economic data.

This may include personal information and provider-controlled information.

---

# 9. Sensitive information

TrackMyProps should avoid collecting legally defined sensitive information unless required and lawful.

Potential accidental collection may occur in:

- uploaded documents;
- user notes;
- communications;
- AI prompts;
- inspection images.

Controls:

- notify users not to upload unnecessary sensitive information;
- restrict access;
- minimise extraction;
- avoid including such data in AI context unless needed;
- delete irrelevant extracted values;
- handle consent where required;
- prevent use for profiling.

---

# 10. Primary collection purposes

TrackMyProps may collect information to:

- create and secure user accounts;
- provide household collaboration;
- track properties and portfolios;
- calculate property financial metrics;
- generate scenarios;
- provide source-backed market analysis;
- generate AI-supported explanations and recommendations;
- process user-selected documents;
- create user-approved communication drafts;
- send communications after explicit approval;
- deliver notifications;
- manage subscriptions and usage;
- provide support;
- prevent fraud and abuse;
- comply with legal obligations;
- improve reliability and user experience using appropriately minimised data.

---

# 11. Secondary use

Personal information must not be used for an unrelated secondary purpose unless:

- consent is obtained;
- the use is reasonably expected and related where legally permitted;
- required or authorised by law;
- another Privacy Act exception applies.

Prohibited default secondary uses:

- selling user property or financial profiles;
- targeted advertising based on loan distress;
- training foundation models on user documents;
- sharing portfolio data with lenders or agents;
- contacting listing agents without user approval;
- building identifiable market datasets from user portfolios;
- using tenant details for unrelated analytics.

---

# 12. Collection notices

Provide an APP 5 collection notice at or before collection where practicable.

A collection notice should state:

- TrackMyProps identity and contact details;
- what information is collected;
- circumstances of collection;
- whether collection is required or optional;
- purpose;
- usual disclosures;
- overseas recipients or likely countries where relevant;
- consequences of not providing information;
- access and correction;
- privacy complaint process;
- link to the privacy policy.

Use contextual notices for:

- sign-up;
- property creation;
- document upload;
- AI analysis;
- EOI drafting;
- communication sending;
- billing;
- advisor invitations;
- support escalation.

---

# 13. Consent

Consent must be:

- informed;
- voluntary;
- current;
- specific;
- given by a person with capacity.

Do not bundle optional consent into required service acceptance.

Separate consent where applicable for:

- optional marketing;
- optional analytics;
- optional AI memory;
- use of content for product improvement beyond service delivery;
- new third-party disclosures;
- automated decisions with significant effect where required;
- sharing with advisor or professional;
- overseas disclosure where relying on informed consent.

Consent records should include:

```text
user_id
consent_type
policy_version
notice_version
granted_at
withdrawn_at
collection_surface
```

---

# 14. Anonymity and pseudonymity

Allow anonymity or pseudonymity where practicable.

Examples:

- viewing public educational content;
- browsing general suburb information;
- using basic public calculators without saving;
- submitting general feedback.

An account may be required for:

- saving a portfolio;
- storing documents;
- AI analysis using private information;
- communication;
- billing;
- exports.

---

# 15. Data quality

TrackMyProps must take reasonable steps to ensure personal information used or disclosed is:

- accurate;
- up to date;
- complete;
- relevant.

Controls:

- editable user records;
- source and date labels;
- preferred-value selection;
- stale-data warnings;
- conflict detection;
- document-extraction confirmation;
- correction workflow;
- provider refresh;
- audit history.

AI must not silently treat uncertain or conflicting information as confirmed fact.

---

# 16. Access rights

Users must be able to request access to personal information held about them, subject to lawful exceptions.

Access channels:

- in-app profile and household data;
- property and financial records;
- document list and approved downloads;
- recommendations;
- communications;
- account export;
- formal privacy request.

Requests should be:

- identity verified;
- logged;
- assigned;
- handled within a reasonable period;
- provided in a usable format where practicable.

Where access is refused, provide the reason and complaint pathway where required.

---

# 17. Correction rights

Users must be able to correct personal information.

Correction workflow:

```text
Request correction
    ↓
Verify identity and authority
    ↓
Assess record and source
    ↓
Correct or annotate dispute
    ↓
Propagate to relevant derived outputs
    ↓
Invalidate affected AI cache
    ↓
Record audit
```

Provider records may need an internal correction layer rather than altering the provider’s original data.

---

# 18. Privacy complaints

Provide a clear complaint process.

Required elements:

- privacy contact;
- acknowledgement;
- investigation;
- response;
- target timeframes;
- escalation;
- OAIC complaint information where applicable.

Complaint records must be restricted.

---

# 19. Automated decision-making and AI transparency

TrackMyProps must distinguish:

```text
decision support
recommendation
automated decision
```

Most initial TrackMyProps outputs should remain decision support.

The system must not automatically:

- approve or deny finance;
- determine insurance eligibility;
- make tenancy decisions;
- submit an offer;
- make a legally binding property decision;
- materially restrict user rights.

From 10 December 2026, APP entities will have additional privacy-policy transparency obligations where personal information is used by computer programs to make decisions that could reasonably be expected to significantly affect an individual’s rights or interests.

TrackMyProps must be ready before that date.

The privacy policy should describe, where applicable:

- kinds of personal information used;
- kinds of significant decisions made;
- how automated systems are involved;
- meaningful human review;
- correction and complaint pathways.

---

# 20. AI usage rules

User personal information may be sent to an AI provider only where:

- required for the requested function;
- the provider is approved;
- contract and privacy review are complete;
- data is minimised;
- logging and training settings are understood;
- retention is acceptable;
- cross-border obligations are addressed;
- the user has received appropriate notice.

Default:

```text
Do not use user content to train general models.
```

Do not include in model context unless required:

- full loan account numbers;
- unrelated document pages;
- tenant personal details;
- raw access tokens;
- payment-card data;
- full identity documents.

---

# 21. AI memory

AI memory must be:

- optional where practicable;
- purpose limited;
- reviewable;
- correctable;
- deletable;
- scoped by user and household;
- excluded from unrelated agents;
- retention limited.

Do not store:

- hidden chain-of-thought;
- raw secrets;
- full documents when a reference is sufficient;
- sensitive facts that are not needed for future service.

Memory categories:

```text
session
user_preference
household_strategy
confirmed_fact
learning_progress
```

---

# 22. AI caching

Cache keys must include privacy scope.

Valid scopes:

```text
global_public
household
user
property
document
```

A user- or household-specific result must never be stored in a global cache.

Cache records must support:

- expiry;
- event invalidation;
- deletion;
- provenance;
- model and prompt version;
- dataset version.

---

# 23. Model training and evaluation

Production user information must not be used for model training or fine-tuning by default.

Permitted evaluation data:

- synthetic data;
- licensed public data;
- de-identified data with re-identification risk assessed;
- user data with specific, informed consent and governance approval.

Production samples used for quality review must be:

- minimised;
- access restricted;
- sampled under documented policy;
- redacted where possible;
- deleted according to evaluation retention;
- excluded from vendor training.

---

# 24. Cross-border handling

Before disclosing personal information to an overseas recipient, TrackMyProps must take reasonable steps to ensure the recipient will not breach the APPs, unless a lawful exception applies.

TrackMyProps may remain accountable for overseas handling.

The subprocessor review must assess:

- recipient legal entity;
- country;
- purpose;
- data categories;
- contract;
- subcontractors;
- security;
- access;
- deletion;
- retention;
- government-access risk;
- breach notification;
- audit rights;
- model-training terms.

---

# 25. Cloud hosting and data residency

Preferred production regions:

```text
Australia
```

Where Australian hosting is available and operationally suitable, use it for:

- database;
- storage;
- backend;
- data pipelines;
- secrets;
- logs.

Australian hosting does not by itself eliminate cross-border disclosure.

Overseas access may occur through:

- support;
- model providers;
- email providers;
- analytics;
- billing;
- monitoring;
- subcontractors.

These flows must be documented.

---

# 26. Subprocessor register

Maintain:

```text
subprocessor_name
service
legal_entity
countries
data_categories
purpose
hosting_region
subprocessors
contract_date
security_review_date
privacy_review_date
retention
training_use
deletion_process
breach_terms
status
```

Potential categories:

- Supabase;
- Google Cloud;
- AI model providers;
- email provider;
- billing provider;
- error monitoring;
- analytics;
- property-data providers;
- maps provider.

Do not publish a vendor as a confirmed subprocessor until selected and contracted.

---

# 27. Vendor contract requirements

Contracts should address:

- purpose limitation;
- confidentiality;
- security controls;
- access restrictions;
- breach notification;
- subprocessor controls;
- data location;
- retention;
- deletion;
- return of data;
- audit evidence;
- assistance with access and correction;
- prohibition on unauthorised training;
- intellectual property;
- termination;
- legal requests;
- APP 8 obligations where relevant.

---

# 28. Direct marketing

Marketing must be separate from essential service communication.

Controls:

- opt-in or lawful basis;
- clear unsubscribe;
- channel preferences;
- suppression list;
- no misleading sender identity;
- no marketing based on sensitive financial distress;
- no sharing with third-party advertisers without valid basis.

Operational notices may include:

- security;
- subscription;
- report completion;
- service changes;
- legal notices.

---

# 29. Analytics and tracking

Use privacy-minimised analytics.

Prefer:

- event names without sensitive content;
- aggregated usage;
- coarse device details;
- first-party identifiers;
- short retention;
- no advertising IDs unless specifically approved.

Do not include:

- property addresses in analytics events;
- loan balances;
- document names;
- email bodies;
- AI prompt content;
- recipient emails;
- access tokens.

Tracking pixels and third-party scripts require privacy review.

---

# 30. Government-related identifiers

Do not adopt government-related identifiers as TrackMyProps identifiers.

Examples:

- TFN;
- driver licence number;
- passport number;
- Medicare number.

Avoid collection unless a defined lawful function requires it.

If incidentally uploaded:

- restrict access;
- avoid extraction;
- remove where not required;
- do not use as internal account ID.

---

# 31. Children

TrackMyProps is intended for adults managing or researching property investments.

The product should not knowingly target children.

Before allowing children as users, conduct:

- legal review;
- age-assurance review;
- children’s privacy code review;
- parental consent analysis;
- product-design review;
- profiling and advertising review.

The Australian Children’s Online Privacy Code is expected to be in place from 10 December 2026. TrackMyProps must reassess applicability before that date.

---

# 32. Security safeguards

Privacy security includes:

- encryption in transit;
- encryption at rest;
- MFA for administrators;
- least privilege;
- RLS;
- secure secrets;
- signed URLs;
- malware scanning;
- secure deletion;
- vulnerability management;
- logging and alerts;
- incident response;
- provider review;
- backup controls;
- restoration testing.

Security must be proportionate to the sensitivity and potential harm.

---

# 33. Retention principles

Personal information must not be kept indefinitely.

Retention is based on:

- active service need;
- legal requirement;
- dispute or fraud risk;
- financial-record obligations;
- provider contract;
- security need;
- user expectations;
- deletion request;
- de-identification feasibility.

When no longer needed for a permitted purpose, take reasonable steps to destroy or de-identify the information unless an exception applies.

---

# 34. Proposed retention schedule

The periods below are product defaults for legal review.

## 34.1 Account profile

```text
Active account:
    Retain while account is active.

After account deletion:
    Delete or de-identify within 30 days,
    subject to backups, fraud, legal, dispute, and audit exceptions.
```

## 34.2 Household memberships

```text
Active membership:
    Retain while active.

Removed membership:
    Retain role and audit metadata for 7 years where justified.
    Remove unnecessary profile duplication promptly.
```

## 34.3 Property and portfolio records

```text
Active:
    Retain while user uses the service.

After property deletion:
    Delete within 30 days unless user selects archive or law requires retention.

After account/household deletion:
    Delete or de-identify within 30 days, subject to approved exceptions.
```

## 34.4 Financial records

```text
Active:
    Retain while required for portfolio functionality.

After deletion:
    Delete within 30 days unless retained for legal, tax, dispute, billing, or audit reasons.

Approved exception period:
    Up to 7 years where a specific business or legal need is documented.
```

TrackMyProps is not automatically required to retain every user-entered property record for seven years. A legal basis must be documented.

## 34.5 Documents

```text
Retain while linked to an active property and selected by the user.

After user deletion:
    Delete primary file within 30 days.

Derived text, thumbnails, embeddings, analysis, and cache:
    Delete within the same deletion workflow.

Temporary upload:
    Delete within 24 hours if not completed.

Failed or quarantined upload:
    Delete within 7 days unless security investigation requires retention.
```

## 34.6 Communication drafts

```text
Unsent drafts:
    Delete after 12 months of inactivity,
    or earlier at user request.

Cancelled drafts:
    Delete content after 90 days;
    retain minimal audit metadata where needed.
```

## 34.7 Sent communications

```text
Retain content and delivery record while account is active
and for up to 7 years where needed for dispute, legal, or audit purposes.

Legal review required before finalising.
```

## 34.8 AI prompts and outputs

```text
Operational execution record:
    90 days by default.

Saved recommendation or report:
    Retain while active and user-visible.

Raw provider request/response content:
    Avoid storing by default.
    If required for troubleshooting, maximum 30 days.

AI quality-review samples:
    Maximum 90 days, minimised and restricted.

AI cache:
    According to agent TTL, never beyond source/user retention.
```

## 34.9 AI memory

```text
Session memory:
    Session duration or maximum 24 hours.

User preferences and confirmed strategy:
    Retain while account is active.

Deleted memory:
    Remove within 30 days and invalidate caches.
```

## 34.10 Logs

```text
Application logs:
    30–90 days.

Error logs:
    90 days.

Security logs:
    12–24 months.

Restricted incident evidence:
    According to incident and legal need.

Do not retain full personal payloads in logs.
```

## 34.11 Audit records

```text
7 years by default for sensitive administrative, approval,
communication-send, deletion, export, and permission-change events.

Use minimal payloads.
```

## 34.12 Billing

```text
Subscription and payment reconciliation metadata:
    7 years where required for accounting, tax, dispute, or legal purposes.

Do not store complete payment-card data.
```

## 34.13 Notifications

```text
Read notifications:
    90 days.

Unread important notifications:
    Up to 12 months.

Delivery telemetry:
    90 days.

Invalid push tokens:
    Delete promptly.
```

## 34.14 Support records

```text
General support ticket:
    2 years after closure.

Security or legal incident:
    Up to 7 years where justified.

Attachments:
    Delete as soon as no longer required.
```

## 34.15 Data exports

```text
Generated export artefact:
    7 days.

Signed download URL:
    Minutes or hours, not days.

Export job metadata:
    12 months.
```

## 34.16 Deletion requests

```text
Request and completion evidence:
    7 years using minimal metadata.

Deleted content:
    Must not remain in the completion evidence.
```

## 34.17 Backups

```text
Rolling backups:
    Maximum 35–90 days depending on platform.

Deleted data may remain in encrypted backups until rotation expiry.

Backups must not be restored into normal production without replaying
deletion obligations.
```

## 34.18 Public and licensed market data

Retention follows:

- source licence;
- contract;
- dataset versioning need;
- legal use;
- public-record status.

Personal information within public or commercial datasets requires separate review.

---

# 35. Retention classes

Use:

```text
transient
short_operational
active_product
historical_user
audit_7_year
security_extended
contract_controlled
deletion_required
```

Every database table, storage bucket, log sink, cache, queue, and backup class must be mapped.

---

# 36. Retention implementation

Retention must be machine enforceable.

Required controls:

- `retention_class`;
- `expires_at`;
- scheduled deletion jobs;
- storage lifecycle rules;
- cache TTL;
- log retention;
- backup rotation;
- orphan detection;
- deletion audit;
- provider deletion API where available;
- metrics and alerts.

Do not rely only on policy text.

---

# 37. Deletion types

## 37.1 User deletion

Deletes the user’s personal account data while considering shared household records.

## 37.2 Household deletion

Deletes the shared household and all owned resources after owner authority is confirmed.

## 37.3 Property deletion

Deletes or archives a property according to user selection and dependency rules.

## 37.4 Document deletion

Deletes file, extracted text, embeddings, thumbnails, analyses, cache, and signed links.

## 37.5 Provider deletion

Requests deletion from subprocessors where required and supported.

---

# 38. Deletion workflow

```text
Receive request
    ↓
Verify identity and authority
    ↓
Identify legal and contractual holds
    ↓
Create deletion manifest
    ↓
Disable access
    ↓
Delete active records
    ↓
Delete storage
    ↓
Delete AI memory and cache
    ↓
Delete embeddings and derived artefacts
    ↓
Delete device tokens
    ↓
Notify subprocessors where needed
    ↓
Record minimal completion evidence
    ↓
Verify orphan scan
```

---

# 39. Shared household deletion

A departing member cannot delete another member’s data or the household.

On user deletion:

- remove the user account;
- revoke access;
- remove or pseudonymise member references where possible;
- preserve shared household records owned by remaining members;
- retain minimal audit evidence;
- notify owner if appropriate.

The privacy policy must explain shared-record handling.

---

# 40. Legal and investigation holds

Deletion may be suspended where necessary for:

- legal proceedings;
- regulatory request;
- fraud investigation;
- security incident;
- payment dispute;
- statutory retention.

A hold must be:

- documented;
- approved;
- scoped;
- access restricted;
- reviewed;
- lifted promptly when no longer required.

---

# 41. De-identification

De-identification may be used where data retains legitimate analytical value.

Requirements:

- remove direct identifiers;
- assess indirect identifiers;
- reduce location precision where needed;
- prevent household reconstruction;
- separate linkage keys;
- assess re-identification risk;
- prohibit re-identification;
- review external datasets that could enable matching.

Simply removing name and email is not sufficient for a property-address dataset.

---

# 42. Aggregated analytics

Preferred analytics output:

- counts;
- distributions;
- coarse geography;
- broad property types;
- statistically sufficient cohorts.

Do not publish or share small-cohort statistics that reveal an identifiable household or property.

---

# 43. Backups and deletion

Backups must:

- be encrypted;
- have restricted access;
- follow fixed rotation;
- not be queried for normal operations;
- be restored only under controlled process.

After restoration:

- reapply deletion tombstones;
- reapply revoked memberships;
- invalidate old tokens;
- reprocess post-backup privacy actions.

---

# 44. Data breach definition

A data breach includes unauthorised:

- access;
- disclosure;
- loss;
- alteration;
- exfiltration;
- use.

Examples:

- cross-household data exposure;
- stolen administrator credentials;
- public storage bucket;
- leaked signed URL;
- AI provider receiving unintended documents;
- unauthorised email recipient;
- exposed logs;
- lost unencrypted export;
- compromised provider.

---

# 45. Breach-response process

```text
Detect
    ↓
Contain
    ↓
Preserve evidence
    ↓
Assess affected information and people
    ↓
Assess likely serious harm
    ↓
Determine notification obligations
    ↓
Notify affected individuals and OAIC where required
    ↓
Remediate
    ↓
Review and improve
```

The breach-response plan must align with the Notifiable Data Breaches scheme where TrackMyProps is covered.

---

# 46. Eligible data-breach assessment

Assess:

- type and sensitivity of information;
- number of individuals;
- security protection;
- who accessed it;
- likelihood of misuse;
- nature of harm;
- ability to remediate;
- whether serious harm is likely.

Do not delay assessment unnecessarily.

---

# 47. Breach records

Record:

```text
incident_id
detected_at
reported_by
systems
data_categories
individuals_affected
countries
containment
risk_assessment
notification_decision
notifications
remediation
review
```

Access must be restricted.

---

# 48. Privacy security events

High-priority events:

```text
security.cross_household_access_attempted
security.suspicious_upload_detected
security.webhook_signature_failed
security.service_identity_failed
security.prompt_injection_detected
security.admin_action_performed
```

A confirmed cross-household disclosure must be treated as a potential privacy incident.

---

# 49. Data residency register

Maintain by environment and data class:

```text
system
provider
region
country
data_categories
backup_region
support_access_countries
subprocessors
encryption
retention
```

Update before production deployment or provider change.

---

# 50. User-facing privacy policy requirements

The public privacy policy must clearly explain:

- identity and contact details;
- information collected;
- collection methods;
- purposes;
- disclosures;
- overseas recipients and likely countries where practicable;
- storage and security;
- AI use;
- automated decisions where applicable;
- model training position;
- access and correction;
- deletion;
- retention;
- complaints;
- data breaches;
- marketing;
- children;
- changes to policy.

---

# 51. Layered privacy notices

Use layered notices:

## Short notice

Shown at point of collection.

## Detailed notice

Explains feature-specific handling.

## Full privacy policy

Contains complete organisation-wide practices.

Example document-upload notice:

```text
Your file will be stored privately and may be processed by approved
document and AI services to produce the analysis you request.
Do not upload information that is unrelated or unnecessary.
```

---

# 52. Privacy policy change management

Material changes require:

- legal/privacy review;
- version number;
- effective date;
- change summary;
- updated collection notices;
- user notification;
- renewed consent where required;
- archived prior version.

Do not retroactively expand use through a silent policy update.

---

# 53. Data-subject request operations

Maintain workflows for:

```text
access
correction
deletion
consent withdrawal
marketing opt-out
complaint
export
```

Each request requires:

- request ID;
- identity verification;
- due date;
- owner;
- status;
- response;
- audit.

---

# 54. Identity verification for privacy requests

Use proportionate verification.

Avoid collecting new identity documents unless necessary.

Possible verification:

- authenticated session;
- re-authentication;
- verified email;
- possession of account factors;
- targeted account questions.

Delete verification material when no longer needed.

---

# 55. Provider-specific privacy controls

For each provider define:

```text
data_sent
purpose
location
retention
training
logging
subprocessors
deletion
breach notice
contract
user disclosure
```

AI providers must specifically confirm:

- API data training policy;
- abuse-monitoring retention;
- zero-retention availability where relevant;
- regional processing;
- support access;
- subprocessor list.

---

# 56. Property-data privacy risks

Property data can become identifiable when combined with:

- exact address;
- ownership;
- loan balance;
- rent;
- personal name;
- communication;
- documents.

Controls:

- household isolation;
- address minimisation in analytics;
- provider-right enforcement;
- no public portfolio pages by default;
- no sharing without explicit action;
- advisor scope;
- export restrictions.

---

# 57. Tenant privacy

TrackMyProps should avoid becoming a tenant-record system unless intentionally designed.

Default:

- use internal tenant reference;
- store minimal name/contact data only if required;
- do not store identity documents;
- do not use tenant information for investment profiling;
- restrict advisor access;
- exclude tenant information from AI unless needed;
- delete after lawful and product need ends.

---

# 58. Communication privacy

Before sending:

- user confirms recipient;
- exact content is approved;
- recipient is not inferred from untrusted content;
- approval version matches;
- duplicate send is prevented;
- email provider is approved;
- delivery events are verified.

Do not use sent EOI content for marketing or model training.

---

# 59. Support privacy

Support must use minimum necessary access.

Default support view:

- account ID;
- subscription;
- app version;
- trace;
- error;
- execution status.

Elevated access requires:

- reason;
- approval;
- time limit;
- audit;
- blocked side effects;
- visible status where appropriate.

---

# 60. Employee and contractor access

Requirements:

- role-based access;
- background and contractual controls where appropriate;
- confidentiality;
- security training;
- separate admin identity;
- MFA;
- access review;
- prompt termination revocation;
- monitoring;
- no production-data download without approval.

---

# 61. Privacy training

Personnel with access to personal information require training on:

- APP responsibilities;
- data minimisation;
- secure handling;
- support access;
- breach reporting;
- AI privacy;
- document handling;
- phishing;
- provider restrictions;
- deletion.

---

# 62. Privacy metrics

Track:

```text
privacy_requests_open
privacy_requests_overdue
access_requests
correction_requests
deletion_requests
deletion_completion_time
orphaned_records
consent_withdrawals
privacy_complaints
cross_border_reviews
subprocessor_reviews_due
PIAs_open
breaches_under_assessment
```

Do not expose personal request details in general dashboards.

---

# 63. Privacy review cadence

Review at least annually and when:

- law changes;
- provider changes;
- new AI features launch;
- new data source launches;
- new country is supported;
- business model changes;
- advertising is introduced;
- children become users;
- a serious incident occurs.

A specific review is required before 10 December 2026 for automated-decision and children’s-code changes.

---

# 64. Required implementation artefacts

Create:

```text
docs/privacy/
├── privacy-program.md
├── privacy-policy-draft.md
├── collection-notices.md
├── consent-register.md
├── retention-register.md
├── subprocessor-register.md
├── data-residency-register.md
├── privacy-impact-assessments/
├── data-subject-requests.md
├── breach-response.md
└── deletion-runbook.md
```

---

# 65. Environment and configuration controls

Potential configuration:

```text
PRIVACY_CONTACT_EMAIL=
DATA_RESIDENCY_PRIMARY_REGION=
DEFAULT_ACCOUNT_RETENTION_DAYS=
DELETION_GRACE_PERIOD_DAYS=
EXPORT_RETENTION_DAYS=
AI_RAW_TRACE_RETENTION_DAYS=
SECURITY_LOG_RETENTION_DAYS=
AUDIT_RETENTION_YEARS=
AI_TRAINING_USE_ENABLED=false
SUPPORT_ELEVATED_ACCESS_ENABLED=false
```

Values must be centrally governed.

---

# 66. Testing requirements

Test:

- consent recording;
- consent withdrawal;
- collection notice version;
- access request;
- correction;
- account deletion;
- household deletion;
- shared-household departure;
- document deletion;
- AI memory deletion;
- cache deletion;
- embedding deletion;
- export expiry;
- signed URL expiry;
- retention jobs;
- orphan detection;
- subprocessor deletion;
- backup tombstone replay;
- cross-household access;
- support elevation;
- privacy audit.

---

# 67. Release gates

Block production release when:

- privacy policy is missing;
- collection notice is missing;
- data purpose is undocumented;
- retention class is missing;
- provider privacy review is incomplete;
- overseas handling is undocumented;
- AI provider training terms are unknown;
- deletion does not cover derived data;
- high-risk feature lacks a PIA;
- access and correction workflows are absent;
- breach plan is absent;
- sensitive logs are detected.

---

# 68. Codex rules

Codex must:

1. minimise personal information;
2. define collection purpose;
3. attach retention class;
4. attach sensitivity classification;
5. preserve provenance;
6. implement access, correction, export, and deletion;
7. delete AI memory, cache, embeddings, and derived artefacts;
8. avoid logging private payloads;
9. enforce household isolation;
10. document cross-border flows;
11. prohibit training use by default;
12. support consent versioning;
13. implement retention jobs;
14. create privacy tests;
15. report unresolved legal or provider questions honestly.

---

# 69. Definition of done

Privacy and retention readiness is complete when:

- privacy ownership is assigned;
- APP mapping is documented;
- public privacy policy exists;
- collection notices exist;
- purposes are documented;
- consent is versioned;
- data minimisation is enforced;
- AI use is transparent;
- automated-decision review is complete;
- cross-border recipients are reviewed;
- subprocessor and residency registers exist;
- retention is machine enforced;
- deletion covers all derived copies;
- access and correction work;
- complaint handling exists;
- breach response exists;
- high-risk features have PIAs;
- tests pass;
- legal review is complete.

---

# 70. Final privacy principle

For every item of personal information, TrackMyProps must answer:

```text
Why are we collecting it?
Did we clearly tell the person?
Is it reasonably necessary?
Who can access it?
Where is it processed?
Which overseas recipients may receive it?
Is AI using it?
Is it used for training?
How long is it retained?
How can it be accessed, corrected, or deleted?
What happens if it is breached?
```

If those questions cannot be answered, the information must not be collected or retained.

---

# 71. Authoritative references reviewed

This specification was informed by current official Australian sources reviewed in August 2026:

- Privacy Act 1988, current compilation effective 4 June 2026;
- OAIC Australian Privacy Principles Guidelines;
- OAIC APP 1 guidance;
- OAIC APP 3 guidance updated 13 May 2026;
- OAIC APP 8 cross-border guidance;
- OAIC APP 11 security and destruction guidance;
- OAIC Notifiable Data Breaches quick-reference guide published 29 June 2026;
- OAIC privacy impact assessment guidance;
- OAIC guidance on developing and training generative AI;
- OAIC automated decision-making transparency material.

Before production use, verify that no later amendments or final guidance have changed these requirements.
