# TrackMyProps

Web-first property portfolio management hosted on ChatGPT Sites.

## Active application

The repository root is the deployed application: React/TypeScript with the Sites Vinext runtime, server-side route handlers, native Sign in with ChatGPT, and managed D1 data. The public homepage redirects authenticated visitors to `/dashboard`.

The earlier Expo frontend, Python services, Firebase/Supabase integrations and their documentation remain in the repository as migration references. They are not deployed by this application and are not runtime dependencies. See `docs/sites-migration.md`, which supersedes their hosting and identity assumptions for this slice. Native iOS/Android builds remain separate future work; this release is a responsive React web application.

## Included

- Animated public feature homepage with illustrative sample data clearly labelled.
- Private dashboard, property lists, two-step create/edit, archive/restore.
- Structured Australian property attributes, manual address entry, purchase information, optional current value and simple loan summary.
- Named recurring and one-off income/expense entries and confirmed removal.
- Annualised property/portfolio totals, monthly-average net, completeness indicators, and owner-scoped JSON export.
- Exact fixed-point financial arithmetic on the server. Dates use calendar years, not Australian financial years.
- Private property photo galleries (up to 10 JPG/PNG/WebP photos, 800 KB each after crop/compression) and document storage (up to 20 PDF/DOCX/XLSX/TXT/CSV files, 10 MB each). The latest photo is shown on its property card.
- Tenant create/edit/remove with contact details, tenancy status, lease dates, rent, bond and notes. Tenant rent is a reference and does not automatically create income.

See `docs/property-records.md` for the file and tenant feature contracts and boundaries.

## Run and validate

Node 24 is used for the native TypeScript test runner. Install with the committed pnpm lockfile and the Sites dependency helper. Local app commands:

```sh
pnpm dev
pnpm typecheck
pnpm test
pnpm build
pnpm test:integration
```

Integration checks run the built production Worker with a disposable Miniflare D1 database. They simulate the trusted dispatcher identity boundary only in test requests; no development auth bypass is shipped.

Generate migrations with `pnpm db:generate`. The Sites publishing workflow applies committed migrations to the hosted database. Use the Sites source workflow and build/package helpers to publish; `.openai/hosting.json` retains the existing Site identity. Never create a duplicate Site.

## Security and calculations

Every private API authenticates on the server. All reads/writes bind the owner ID from trusted Sites identity; supplied owner fields are rejected. Mutations require a matching Origin and JSON content type. Composite property/owner foreign keys prevent cross-owner child attachments. D1 has no PostgreSQL RLS: the database is private to the Worker, owner predicates are mandatory, and there is no browser database client or general SQL endpoint.

Money is stored as validated AUD decimal strings and calculated as integer cents with `bigint`. Unknown current values and loan balances remain missing. A known no-loan property has a zero balance. Annualisation uses weekly × 52, fortnightly × 26, monthly × 12, quarterly × 4 and annual × 1. Recurring entries overlapping a year are fully annualised; they are not prorated. One-offs are included only in their calendar year. Monthly average is annual net / 12, rounded half up. Only recorded expense items are deducted; repayments are not automatically deducted from the informational loan summary. All results are pre-tax, based on entered information.

## Boundaries

Historical Firebase/Supabase accounts and records are not imported, matched by email or deleted. Existing cloud resources are not changed. Address providers, automated lease/rent workflows, AI agents, bank feeds, billing, sale/removal workflows and full account deletion are not part of this slice. Private file and tenant storage are implemented; uploads are not virus-scanned or parsed for document contents. Export is available; account deletion needs a separately verified operational workflow before a broader commercial release. No financial, tax or automatic valuation advice is provided.
