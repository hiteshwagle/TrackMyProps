# TrackMyProps Backend

Python 3.12 FastAPI service with the first authenticated identity boundary.

The backend exposes:

```text
GET /health
GET /ready
GET /api/v1/me
GET /api/v1/properties?status=active|archived
POST /api/v1/properties
PUT /api/v1/properties/{property_id}
PATCH /api/v1/properties/{property_id}/status
GET /api/v1/portfolio/summary
```

Authenticated endpoints require a Supabase bearer token. The backend verifies the token through the local Supabase Auth `/auth/v1/user` endpoint using a publishable key. User metadata is display-only and is never used for authorisation.

Property endpoints derive `owner_user_id` from the verified identity and use the caller's JWT when accessing Supabase's Data API, preserving database RLS. Owners can list active or archived properties, replace editable details, and archive or restore records. The portfolio summary calculates active-property asset, loan, and equity totals using `Decimal`, reports missing-input counts, and never converts missing values to zero. The backend has no service-role key, direct privileged database credential, or commercial provider. Readiness returns `503` when Supabase Auth is missing or unreachable; liveness remains independent.

## Commands

```bash
uv sync --python 3.12 --frozen
uv run --env-file .env.development uvicorn trackmyprops_backend.main:app --app-dir src --reload
uv run --env-file .env.production uvicorn trackmyprops_backend.main:app --app-dir src --host 0.0.0.0 --port 8000
uv run ruff format --check .
uv run ruff check .
uv run mypy src tests
uv run pytest
uv run python -m compileall -q src
```

## VS Code and Pylance

When working on backend files, select the repository's backend interpreter:

```text
backend/.venv/bin/python
```

In VS Code, run `Python: Select Interpreter`, choose `Enter interpreter path`, and select that file. The root workspace also provides this path as its default in the ignored local `.vscode/settings.json`. Reload the VS Code window if Pylance continues to show diagnostics from a previously selected system interpreter.

The `ai-platform`, `data-platform`, and `contracts` projects have their own `.venv` directories. Select the matching project interpreter when working primarily in one of those projects.

Development loads only `.env.development`; production loads only `.env.production`. Committed templates are `.env.development.example` and `.env.production.example`. The development file contains the local Supabase URL and publishable key. The production file contains placeholders and must be completed before production use.

Backend environment parsing, defaults, and validation are centralized in `src/trackmyprops_backend/config.py`. The Supabase Edge Function is a separate Deno deployment and therefore maintains its non-secret settings in `../supabase/functions/address-lookup/app-settings.ts` rather than importing Python configuration.

The root start commands validate the selected backend file before starting Uvicorn, so production fails before process startup while required configuration remains a placeholder.

Never use a secret or service-role key for this integration. Production rejects loopback Supabase URLs, and each environment has an explicit CORS origin list.

The current endpoint contract is `../contracts/openapi/backend-v1.yaml`. Future public endpoints must be added to that source with their approved vertical slice.
