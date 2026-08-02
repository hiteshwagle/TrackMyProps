# TrackMyProps AI Platform

Minimal Python 3.12 FastAPI internal service shell for Phase 0.

The service exposes:

```text
GET /internal/v1/health
GET /internal/v1/ready
```

It contains no agents, prompts, LangGraph graphs, model providers, tools, cache, memory, or domain logic.

## Commands

```bash
uv sync --python 3.12 --frozen
uv run uvicorn trackmyprops_ai_platform.main:app --app-dir src --reload
uv run ruff format --check .
uv run ruff check .
uv run mypy src tests
uv run pytest
uv run python -m compileall -q src
```

No environment variables or external services are required.

