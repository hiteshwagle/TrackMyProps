from __future__ import annotations

import json
import re
from collections.abc import Mapping
from decimal import Decimal
from pathlib import Path
from typing import Any, cast

import pytest
import yaml
from jsonschema import Draft202012Validator, FormatChecker
from jsonschema.exceptions import ValidationError
from openapi_spec_validator import validate
from openapi_spec_validator.readers import read_from_filename

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_ROOT = ROOT / "json-schema"
EVENT_ROOT = ROOT / "events"
EXAMPLE_ROOT = ROOT / "examples"

EXAMPLE_SCHEMAS = {
    EXAMPLE_ROOT / "common" / "api-version-metadata.json": (
        SCHEMA_ROOT / "common" / "api-version-metadata.schema.json"
    ),
    EXAMPLE_ROOT / "common" / "idempotency-key.json": (
        SCHEMA_ROOT / "common" / "idempotency-key.schema.json"
    ),
    EXAMPLE_ROOT / "common" / "money-aud.json": (SCHEMA_ROOT / "common" / "money.schema.json"),
    EXAMPLE_ROOT / "common" / "rate.json": SCHEMA_ROOT / "common" / "rate.schema.json",
    EXAMPLE_ROOT / "errors" / "validation-error.json": (
        SCHEMA_ROOT / "errors" / "error-response.schema.json"
    ),
    EXAMPLE_ROOT / "events" / "envelope.json": EVENT_ROOT / "common.schema.json",
    EXAMPLE_ROOT / "health" / "ai-readiness.json": (
        SCHEMA_ROOT / "common" / "health-response.schema.json"
    ),
    EXAMPLE_ROOT / "health" / "backend-health.json": (
        SCHEMA_ROOT / "common" / "health-response.schema.json"
    ),
    EXAMPLE_ROOT / "identity" / "current-user.json": (
        SCHEMA_ROOT / "identity" / "current-user.schema.json"
    ),
    EXAMPLE_ROOT / "pagination" / "cursor.json": (
        SCHEMA_ROOT / "common" / "pagination.schema.json"
    ),
    EXAMPLE_ROOT / "pagination" / "page.json": (SCHEMA_ROOT / "common" / "pagination.schema.json"),
}

OPENAPI_PATHS = {
    ROOT / "openapi" / "ai-platform-v1.yaml": {
        "/internal/v1/health",
        "/internal/v1/ready",
    },
    ROOT / "openapi" / "backend-v1.yaml": {
        "/health",
        "/ready",
        "/api/v1/me",
        "/api/v1/properties",
        "/api/v1/properties/{property_id}",
        "/api/v1/properties/{property_id}/status",
        "/api/v1/properties/{property_id}/income",
        "/api/v1/income/{item_id}",
        "/api/v1/properties/{property_id}/expenses",
        "/api/v1/properties/{property_id}/cash-flow-summary",
        "/api/v1/expenses/{item_id}",
        "/api/v1/portfolio/summary",
    },
}


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def load_schema(path: Path) -> Mapping[str, Any]:
    return cast(Mapping[str, Any], load_json(path))


def validate_instance(instance: Any, schema_path: Path) -> None:
    Draft202012Validator(
        load_schema(schema_path),
        format_checker=FormatChecker(),
    ).validate(instance)


def schema_paths() -> list[Path]:
    return sorted([*SCHEMA_ROOT.rglob("*.schema.json"), *EVENT_ROOT.glob("*.schema.json")])


@pytest.mark.parametrize("schema_path", schema_paths(), ids=lambda path: path.name)
def test_json_schema_is_valid(schema_path: Path) -> None:
    Draft202012Validator.check_schema(load_schema(schema_path))


@pytest.mark.parametrize(
    ("example_path", "schema_path"),
    EXAMPLE_SCHEMAS.items(),
    ids=lambda value: value.name,
)
def test_example_matches_schema(example_path: Path, schema_path: Path) -> None:
    validate_instance(load_json(example_path), schema_path)


def test_every_json_example_has_a_schema_mapping() -> None:
    assert set(EXAMPLE_ROOT.rglob("*.json")) == set(EXAMPLE_SCHEMAS)


@pytest.mark.parametrize(
    "json_path",
    sorted([*schema_paths(), *EXAMPLE_SCHEMAS]),
    ids=lambda path: path.name,
)
def test_json_uses_canonical_formatting(json_path: Path) -> None:
    content = json_path.read_text(encoding="utf-8")
    json.loads(content)
    assert content.endswith("\n")
    assert not content.endswith("\n\n")
    assert "\t" not in content
    assert all(line == line.rstrip() for line in content.splitlines())


@pytest.mark.parametrize(
    ("spec_path", "expected_paths"),
    OPENAPI_PATHS.items(),
    ids=lambda value: value.name if isinstance(value, Path) else "paths",
)
def test_openapi_contract_is_valid(spec_path: Path, expected_paths: set[str]) -> None:
    specification, base_uri = read_from_filename(str(spec_path))
    validate(specification, base_uri=base_uri)

    assert specification["openapi"] == "3.1.0"
    assert specification["x-api-major-version"] == "v1"
    assert set(cast(Mapping[str, Any], specification["paths"])) == expected_paths
    assert "servers" not in specification


def test_openapi_health_examples_match_shared_schema() -> None:
    schema_path = SCHEMA_ROOT / "common" / "health-response.schema.json"

    for spec_path in OPENAPI_PATHS:
        specification, _ = read_from_filename(str(spec_path))
        paths = cast(Mapping[str, Any], specification["paths"])
        operational_paths = {
            path: path_item
            for path, path_item in paths.items()
            if path in {"/health", "/ready", "/internal/v1/health", "/internal/v1/ready"}
        }
        for path_item in operational_paths.values():
            operation = cast(Mapping[str, Any], path_item)["get"]
            responses = cast(Mapping[str, Any], operation)["responses"]
            response = cast(Mapping[str, Any], responses)["200"]
            content = cast(Mapping[str, Any], response)["content"]
            media_type = cast(Mapping[str, Any], content)["application/json"]
            examples = cast(Mapping[str, Any], media_type)["examples"]
            for example in cast(Mapping[str, Any], examples).values():
                validate_instance(cast(Mapping[str, Any], example)["value"], schema_path)


def test_registry_has_unique_entries_and_existing_sources() -> None:
    registry = cast(
        Mapping[str, Any],
        yaml.safe_load((ROOT / "registry.yaml").read_text(encoding="utf-8")),
    )
    assert registry["registry_version"] == 1

    entries = cast(list[Mapping[str, Any]], registry["contracts"])
    contract_ids = [cast(str, entry["contract_id"]) for entry in entries]
    assert len(contract_ids) == len(set(contract_ids))

    registered_sources = {ROOT / cast(str, entry["schema_path"]) for entry in entries}
    expected_sources = {*schema_paths(), *OPENAPI_PATHS}
    assert registered_sources == expected_sources
    assert all(path.is_file() for path in registered_sources)
    assert all(entry["owner"] == "trackmyprops-engineering" for entry in entries)
    assert all(
        re.fullmatch(r"[1-9][0-9]*\.[0-9]+\.[0-9]+", str(entry["current_version"]))
        for entry in entries
    )


def test_rate_example_uses_decimal_form() -> None:
    rate = cast(Mapping[str, str], load_json(EXAMPLE_ROOT / "common" / "rate.json"))
    assert Decimal(rate["value"]) * 100 == Decimal(rate["display_percent"])


@pytest.mark.parametrize(
    ("instance", "schema_path"),
    [
        (
            {"amount": 1250, "currency": "AUD"},
            SCHEMA_ROOT / "common" / "money.schema.json",
        ),
        (
            {"service": "backend", "status": "ok", "version": "0.0.0", "detail": "db"},
            SCHEMA_ROOT / "common" / "health-response.schema.json",
        ),
        (
            {
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Invalid input.",
                    "request_id": "not-a-uuid",
                    "trace_id": "3566f774-5864-4465-94eb-95e3ba4a3f22",
                }
            },
            SCHEMA_ROOT / "errors" / "error-response.schema.json",
        ),
        ("short", SCHEMA_ROOT / "common" / "idempotency-key.schema.json"),
        (
            {
                "event_id": "0a04d4f8-55d5-489f-86d7-d676c1bca708",
                "event_type": "create_example",
                "event_version": "1.0",
                "occurred_at": "2026-08-03T00:00:00Z",
                "producer": "backend",
                "environment": "development",
                "trace_id": "3566f774-5864-4465-94eb-95e3ba4a3f22",
                "aggregate": {
                    "type": "example",
                    "id": "919d97fd-64cb-4eb6-8349-0fc0c78b1285",
                    "version": "1",
                },
                "payload": {},
            },
            EVENT_ROOT / "common.schema.json",
        ),
    ],
    ids=[
        "numeric-money",
        "health-topology-detail",
        "error-with-invalid-request-id",
        "short-idempotency-key",
        "command-shaped-event-name",
    ],
)
def test_invalid_contract_value_is_rejected(instance: Any, schema_path: Path) -> None:
    with pytest.raises(ValidationError):
        validate_instance(instance, schema_path)
