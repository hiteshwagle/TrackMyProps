from __future__ import annotations

from typing import Any

import httpx2
import pytest

from trackmyprops_backend.auth import (
    AuthenticationFailedError,
    AuthenticationServiceUnavailableError,
    SupabaseAuthGateway,
)
from trackmyprops_backend.config import Settings

SETTINGS = Settings(
    supabase_url="http://127.0.0.1:54321",
    supabase_publishable_key="test-publishable-key",
)


@pytest.mark.anyio
async def test_gateway_verifies_token_with_publishable_key() -> None:
    def handler(request: httpx2.Request) -> httpx2.Response:
        assert request.url == "http://127.0.0.1:54321/auth/v1/user"
        assert request.headers["Authorization"] == "Bearer valid-access-token"
        assert request.headers["apikey"] == "test-publishable-key"
        return httpx2.Response(
            200,
            json={
                "id": "e8cf2dbf-463e-485f-880d-cdb828749979",
                "email": "owner@example.com",
                "user_metadata": {
                    "full_name": " Owner Example ",
                    "phone": None,
                    "ignored": "not returned",
                },
            },
        )

    gateway = SupabaseAuthGateway(SETTINGS, transport=httpx2.MockTransport(handler))

    user = await gateway.get_current_user("valid-access-token")

    assert user.model_dump(mode="json") == {
        "id": "e8cf2dbf-463e-485f-880d-cdb828749979",
        "email": "owner@example.com",
        "name": "Owner Example",
        "phone": None,
    }


@pytest.mark.anyio
async def test_gateway_maps_rejected_token_to_authentication_failure() -> None:
    transport = httpx2.MockTransport(lambda _request: httpx2.Response(401, json={}))
    gateway = SupabaseAuthGateway(SETTINGS, transport=transport)

    with pytest.raises(AuthenticationFailedError):
        await gateway.get_current_user("invalid-access-token")


@pytest.mark.anyio
async def test_gateway_rejects_malformed_provider_response() -> None:
    response: dict[str, Any] = {"id": "not-a-uuid", "email": "owner@example.com"}
    transport = httpx2.MockTransport(lambda _request: httpx2.Response(200, json=response))
    gateway = SupabaseAuthGateway(SETTINGS, transport=transport)

    with pytest.raises(AuthenticationServiceUnavailableError):
        await gateway.get_current_user("valid-access-token")
