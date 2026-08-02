# TrackMyProps Data Platform

Minimal Python 3.12 job shell for Phase 0.

The example job proves an explicit Cloud Run Jobs-compatible command can execute without external integrations:

```bash
PYTHONPATH=src uv run python -m trackmyprops_data_platform.example_job
```

Validation commands:

```bash
uv sync --python 3.12 --frozen
uv run ruff format --check .
uv run ruff check .
uv run mypy src tests
uv run pytest
uv run python -m compileall -q src
```

The project contains no source connector, database, cloud SDK, schedule, or business logic. No environment variables are required.
