# ADR: ChatGPT Sites property-management slice

Decision date: 29 October 2026. Status: accepted by the user's instruction to replicate existing functionality using Sites services and replace the active GitHub app.

## Decision and precedence

For the active root web app, this decision supersedes previous Firebase, GCP, Cloud Run, Supabase, PostgreSQL RLS, Expo Router and Python runtime requirements. The previous service source remains a migration reference. Core principles remain: private owner-only portfolios, authoritative server calculations, explicit missing inputs, safe input validation, meaningful tests and auditable changes.

The active React web frontend uses Vinext because this is the supported Sites full-stack runtime. The existing Expo code remains available for later native app work. No native iOS/Android release is claimed. A future native app will need its own approved authentication and API design.

## Services

| Previous responsibility                  | Active replacement                                                                            |
| ---------------------------------------- | --------------------------------------------------------------------------------------------- |
| Firebase/Supabase authentication         | Sites Sign in with ChatGPT                                                                    |
| GCP/FastAPI/Cloud Functions property API | Same-origin Sites Worker route handlers                                                       |
| Firestore/Supabase PostgreSQL records    | Private managed D1 binding `DB`                                                               |
| Python Decimal calculations              | Server fixed-point integer cents using bigint; half-up output rounding                        |
| PostgreSQL RLS                           | Private Worker-only database plus mandatory owner predicates and composite owner foreign keys |
| External web hosting                     | ChatGPT Sites                                                                                 |

D1 does not support PostgreSQL RLS. No claim of equivalent native row policy support is made. Defence in depth for this slice is trusted dispatcher identity, validated strict request schemas, owner predicates in every repository function, a composite `(property_id, owner_id)` child foreign key, no browser database access, same-origin mutation checks, and cross-owner integration tests.

## Product journey

Anonymous `/` → animated homepage → ordinary top-level ChatGPT sign-in link → `/dashboard`.

Authenticated `/` → `/dashboard`. Anonymous `/dashboard` → ChatGPT sign-in. Private API requests without identity return 401. The Site is public to allow a public homepage; product records remain owner-scoped.

## Motion

The requested MotionSites integration was searched for and was not available. Animated chart strokes, floating cards, feature tabs, scroll reveals, diagram rotation and hover transitions are implemented directly in React/CSS with reduced-motion support. No claim of MotionSites integration is made.

## Data migration

No existing account or financial record is migrated automatically. Sites IDs are Site-specific and must not be linked to old accounts by email alone. A later migration requires authenticated ownership proof, explicit mapping, test import, reconciliation and an approved cutover. Old cloud resources remain untouched.

## Current limitations

Manual addresses, one simple loan summary, annualised entries rather than dated ledger transactions, no partial-year proration, no automatic deduction of informational loan repayments, no automated valuations, no sold or removal workflow, no full account deletion, and no native application build. The homepage uses explicitly illustrative data only. The actual dashboard is empty until its owner creates records.

The custom domain is not automatically configured by this source change. Domain verification and provider DNS must be completed independently.

## Validation

TypeScript check; 10 deterministic calculation/input tests; production build; 27 production-Worker integration assertions; initial migration applied to local D1; composite ownership SQL validation; browser checks for homepage feature tabs, dashboard layout and two-step form progression. Temporary layout-only QA route is removed before the final build.
