# TrackMyProps Backend

Python 3.12 FastAPI service with the first authenticated identity boundary.

The backend exposes:

```text
GET /health
GET /ready
GET /api/v1/me
```

`GET /api/v1/me` requires a Supabase bearer token. The backend verifies the token through the local Supabase Auth `/auth/v1/user` endpoint using a publishable key, then returns only the user's ID, email, name, and optional phone. User metadata is display-only and is never used for authorisation.

The backend has no service-role key, direct database access, property domain, commercial provider, or financial business logic. Readiness returns `503` when Supabase Auth is missing or unreachable; liveness remains independent.

## Commands

```bash
uv sync --python 3.12 --frozen
uv run --env-file .env uvicorn trackmyprops_backend.main:app --app-dir src --reload
uv run ruff format --check .
uv run ruff check .
uv run mypy src tests
uv run pytest
uv run python -m compileall -q src
```

Copy `.env.example` to `.env` and replace the publishable-key placeholder with the local Supabase publishable key. Never use a secret or service-role key for this integration. The committed example permits only the explicit local frontend origins.

The current endpoint contract is `../contracts/openapi/backend-v1.yaml`. Future public endpoints must be added to that source with their approved vertical slice.
