"""Narrow Supabase Auth boundary for backend token verification."""

from __future__ import annotations

from typing import Protocol
from uuid import UUID

import httpx2
from pydantic import BaseModel, ConfigDict, Field, ValidationError

from trackmyprops_backend.config import Settings

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class AuthenticationFailedError(Exception):
    """The supplied access token is missing, invalid, or expired."""


class AuthenticationServiceUnavailableError(Exception):
    """Supabase Auth could not safely verify the request."""


class CurrentUser(BaseModel):
    """Authenticated user data returned to the frontend."""

    model_config = ConfigDict(extra="forbid")

    id: UUID
    email: str = Field(min_length=3, max_length=320, pattern=EMAIL_PATTERN)
    name: str | None = Field(default=None, max_length=200)
    phone: str | None = Field(default=None, max_length=32)


class AuthGateway(Protocol):
    """Operations the API needs from its authentication provider boundary."""

    async def check_ready(self) -> None: ...

    async def get_current_user(self, access_token: str) -> CurrentUser: ...


class SupabaseUserPayload(BaseModel):
    """Minimal trusted shape parsed from Supabase Auth."""

    model_config = ConfigDict(extra="ignore")

    id: UUID
    email: str = Field(min_length=3, max_length=320, pattern=EMAIL_PATTERN)
    user_metadata: dict[str, object] = Field(default_factory=dict)


def optional_metadata_text(metadata: dict[str, object], key: str) -> str | None:
    value = metadata.get(key)
    if not isinstance(value, str):
        return None
    cleaned_value = value.strip()
    return cleaned_value or None


class SupabaseAuthGateway:
    """Verify user tokens through the configured Supabase Auth service."""

    def __init__(
        self,
        settings: Settings,
        *,
        transport: httpx2.AsyncBaseTransport | None = None,
    ) -> None:
        self._settings = settings
        self._transport = transport

    def _client(self) -> httpx2.AsyncClient:
        return httpx2.AsyncClient(
            timeout=5.0,
            transport=self._transport,
            trust_env=False,
        )

    async def check_ready(self) -> None:
        try:
            async with self._client() as client:
                response = await client.get(f"{self._settings.supabase_url}/auth/v1/health")
        except httpx2.RequestError as error:
            raise AuthenticationServiceUnavailableError from error

        if response.status_code != 200:
            raise AuthenticationServiceUnavailableError

    async def get_current_user(self, access_token: str) -> CurrentUser:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "apikey": self._settings.supabase_publishable_key,
        }
        try:
            async with self._client() as client:
                response = await client.get(
                    f"{self._settings.supabase_url}/auth/v1/user",
                    headers=headers,
                )
        except httpx2.RequestError as error:
            raise AuthenticationServiceUnavailableError from error

        if response.status_code in {401, 403}:
            raise AuthenticationFailedError
        if response.status_code != 200:
            raise AuthenticationServiceUnavailableError

        try:
            payload = SupabaseUserPayload.model_validate(response.json())
        except (ValueError, ValidationError) as error:
            raise AuthenticationServiceUnavailableError from error

        return CurrentUser(
            id=payload.id,
            email=payload.email,
            name=optional_metadata_text(payload.user_metadata, "full_name"),
            phone=optional_metadata_text(payload.user_metadata, "phone"),
        )
