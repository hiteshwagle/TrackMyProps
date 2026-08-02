# TrackMyProps Backend

Minimal Python 3.12 FastAPI service shell for Phase 0.

The backend exposes:

```text
GET /health
GET /ready
```

It contains no database, authentication, domain, provider, or business logic.

## Commands

```bash
uv sync --python 3.12 --frozen
uv run uvicorn trackmyprops_backend.main:app --app-dir src --reload
uv run ruff format --check .
uv run ruff check .
uv run mypy src tests
uv run pytest
uv run python -m compileall -q src
```

No environment variables or external services are required.

