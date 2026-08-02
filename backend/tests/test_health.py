from collections.abc import Mapping
from typing import Any

import pytest
from fastapi.testclient import TestClient

from trackmyprops_backend.main import app

client = TestClient(app)


@pytest.mark.parametrize(
    ("path", "status"),
    [("/health", "ok"), ("/ready", "ready")],
)
def test_service_status(path: str, status: str) -> None:
    response = client.get(path)

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/json")
    payload: Mapping[str, Any] = response.json()
    assert payload == {"status": status, "service": "backend", "version": "0.0.0"}
