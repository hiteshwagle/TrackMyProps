UV ?= uv
PYTHON_VERSION ?= 3.12

.PHONY: install format format-check lint typecheck test build check

install:
	cd frontend && npm ci
	cd backend && $(UV) sync --python $(PYTHON_VERSION) --frozen
	cd ai-platform && $(UV) sync --python $(PYTHON_VERSION) --frozen
	cd data-platform && $(UV) sync --python $(PYTHON_VERSION) --frozen
	cd contracts && $(UV) sync --python $(PYTHON_VERSION) --frozen

format:
	cd frontend && npm run format
	cd backend && $(UV) run ruff format .
	cd ai-platform && $(UV) run ruff format .
	cd data-platform && $(UV) run ruff format .
	cd contracts && $(UV) run ruff format .

format-check:
	cd frontend && npm run format:check
	cd backend && $(UV) run ruff format --check .
	cd ai-platform && $(UV) run ruff format --check .
	cd data-platform && $(UV) run ruff format --check .
	cd contracts && $(UV) run ruff format --check .

lint:
	cd frontend && npm run lint
	cd backend && $(UV) run ruff check .
	cd ai-platform && $(UV) run ruff check .
	cd data-platform && $(UV) run ruff check .
	cd contracts && $(UV) run ruff check .

typecheck:
	cd frontend && npm run typecheck
	cd backend && $(UV) run mypy src tests
	cd ai-platform && $(UV) run mypy src tests
	cd data-platform && $(UV) run mypy src tests
	cd contracts && $(UV) run mypy tests

test:
	cd frontend && npm run test:ci
	cd backend && $(UV) run pytest
	cd ai-platform && $(UV) run pytest
	cd data-platform && $(UV) run pytest
	cd contracts && $(UV) run pytest

build:
	cd frontend && npm run build
	cd backend && $(UV) run python -m compileall -q src
	cd ai-platform && $(UV) run python -m compileall -q src
	cd data-platform && $(UV) run python -m compileall -q src
	cd data-platform && PYTHONPATH=src $(UV) run python -m trackmyprops_data_platform.example_job
	cd contracts && $(UV) run python -m compileall -q tests

check: format-check lint typecheck test build
