from __future__ import annotations

from collections.abc import Mapping
from typing import Any
from uuid import UUID

import pytest
from fastapi.testclient import TestClient

from trackmyprops_backend.auth import (
    AuthenticationFailedError,
    AuthenticationServiceUnavailableError,
    CurrentUser,
)
from trackmyprops_backend.config import Settings
from trackmyprops_backend.main import create_app

TEST_SETTINGS = Settings(
    supabase_url="http://127.0.0.1:54321",
    supabase_publishable_key="test-publishable-key",
)
TEST_USER = CurrentUser(
    id=UUID("e8cf2dbf-463e-485f-880d-cdb828749979"),
    email="owner@example.com",
    name="Owner Example",
    phone=None,
)


class FakeAuthGateway:
    def __init__(self) -> None:
        self.is_available = True

    async def check_ready(self) -> None:
        if not self.is_available:
            raise AuthenticationServiceUnavailableError

    async def get_current_user(self, access_token: str) -> CurrentUser:
        if not self.is_available:
            raise AuthenticationServiceUnavailableError
        if access_token != "valid-access-token":
            raise AuthenticationFailedError
        return TEST_USER


@pytest.fixture
def auth_gateway() -> FakeAuthGateway:
    return FakeAuthGateway()


@pytest.fixture
def client(auth_gateway: FakeAuthGateway) -> TestClient:
    return TestClient(create_app(TEST_SETTINGS, auth_gateway))


@pytest.mark.parametrize(
    ("path", "status"),
    [("/health", "ok"), ("/ready", "ready")],
)
def test_service_status(client: TestClient, path: str, status: str) -> None:
    response = client.get(path)

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/json")
    payload: Mapping[str, Any] = response.json()
    assert payload == {"status": status, "service": "backend", "version": "0.0.0"}
    UUID(response.headers["X-Request-ID"])
    UUID(response.headers["X-Trace-ID"])


def test_readiness_fails_closed_when_supabase_is_unavailable(
    client: TestClient,
    auth_gateway: FakeAuthGateway,
) -> None:
    auth_gateway.is_available = False

    response = client.get("/ready")

    assert response.status_code == 503
    assert response.json()["error"]["code"] == "SERVICE_NOT_READY"


def test_current_user_requires_authentication(client: TestClient) -> None:
    response = client.get("/api/v1/me")

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTHENTICATION_REQUIRED"
    assert response.json()["error"]["request_id"] == response.headers["X-Request-ID"]
    assert response.json()["error"]["trace_id"] == response.headers["X-Trace-ID"]


def test_current_user_rejects_invalid_access_token(client: TestClient) -> None:
    response = client.get(
        "/api/v1/me",
        headers={"Authorization": "Bearer invalid-access-token"},
    )

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "INVALID_ACCESS_TOKEN"


def test_current_user_returns_verified_supabase_identity(client: TestClient) -> None:
    response = client.get(
        "/api/v1/me",
        headers={"Authorization": "Bearer valid-access-token"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": "e8cf2dbf-463e-485f-880d-cdb828749979",
        "email": "owner@example.com",
        "name": "Owner Example",
        "phone": None,
    }


def test_current_user_fails_closed_when_supabase_is_unavailable(
    client: TestClient,
    auth_gateway: FakeAuthGateway,
) -> None:
    auth_gateway.is_available = False

    response = client.get(
        "/api/v1/me",
        headers={"Authorization": "Bearer valid-access-token"},
    )

    assert response.status_code == 503
    assert response.json()["error"]["code"] == "AUTHENTICATION_SERVICE_UNAVAILABLE"


def test_missing_supabase_configuration_is_not_ready() -> None:
    unconfigured_settings = Settings(supabase_url="", supabase_publishable_key="")
    client = TestClient(create_app(unconfigured_settings, FakeAuthGateway()))

    response = client.get("/ready")

    assert response.status_code == 503
    assert response.json()["error"]["code"] == "SERVICE_NOT_READY"


def test_cors_allows_the_configured_local_frontend(client: TestClient) -> None:
    response = client.options(
        "/api/v1/me",
        headers={
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization",
            "Origin": "http://localhost:8081",
        },
    )

    assert response.status_code == 200
    assert response.headers["Access-Control-Allow-Origin"] == "http://localhost:8081"
