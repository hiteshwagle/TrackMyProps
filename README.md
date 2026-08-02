# TrackMyProps

TrackMyProps is an Australia-focused property-investment platform. This repository currently contains the Phase 0 engineering scaffold only.

No property, loan, billing, provider, AI-agent, or other product business logic is implemented.

## Projects

| Directory | Purpose |
|---|---|
| `frontend` | Expo React Native TypeScript application shell |
| `backend` | FastAPI public backend service shell |
| `ai-platform` | FastAPI internal AI service shell; no agents |
| `data-platform` | Python job shell; no external integrations |
| `contracts` | Reserved shared-contract structure |
| `supabase` | Reserved migration structure |
| `infrastructure/terraform` | Reserved Terraform structure |

The source-of-truth project documentation is in `markdown files/`.

## Prerequisites

- Node.js 22.13 or later in the Node.js 22 release line
- npm 11
- Python 3.12
- `uv` 0.12.1
- Make

## Commands

```bash
make install
make check
```

Individual commands are also available:

```bash
make format
make format-check
make lint
make typecheck
make test
make build
```

`make format` rewrites supported source files. The other validation targets do not intentionally modify source files.

Each project README documents its native commands.

## Configuration

No environment variables, live services, or credentials are required for Phase 0. Project `.env.example` files intentionally contain comments only.

Never commit `.env` files, Supabase-generated temporary secrets, provider credentials, or production identifiers.

## Next phase

The next separately approved task is the shared-contract foundation. Identity, household authorisation, and RLS must be implemented and tested before property features.
