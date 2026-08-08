"""Runtime configuration for the backend service."""

from __future__ import annotations

import os
from collections.abc import Mapping
from dataclasses import dataclass
from urllib.parse import urlparse

DEFAULT_FRONTEND_ORIGINS = (
    "http://localhost:8081",
    "http://127.0.0.1:8081",
)
LOOPBACK_HOSTS = {"localhost", "127.0.0.1", "::1"}


@dataclass(frozen=True)
class Settings:
    """Environment-derived settings needed by the current backend slice."""

    supabase_url: str
    supabase_publishable_key: str
    environment: str = "development"
    frontend_origins: tuple[str, ...] = DEFAULT_FRONTEND_ORIGINS

    @classmethod
    def from_environment(cls, environment: Mapping[str, str] | None = None) -> Settings:
        values = os.environ if environment is None else environment
        origins = tuple(
            origin.strip()
            for origin in values.get("TRACKMYPROPS_FRONTEND_ORIGINS", "").split(",")
            if origin.strip()
        )
        return cls(
            supabase_url=values.get("TRACKMYPROPS_SUPABASE_URL", "").strip().rstrip("/"),
            supabase_publishable_key=values.get(
                "TRACKMYPROPS_SUPABASE_PUBLISHABLE_KEY", ""
            ).strip(),
            environment=values.get("TRACKMYPROPS_ENVIRONMENT", "").strip(),
            frontend_origins=origins or DEFAULT_FRONTEND_ORIGINS,
        )

    def supabase_configuration_error(self) -> str | None:
        """Return a safe configuration error without including configuration values."""
        if self.environment not in {"development", "production"}:
            return "The application environment must be development or production."
        if (
            not self.supabase_url
            or not self.supabase_publishable_key
            or self.supabase_publishable_key
            in {
                "your-development-publishable-key",
                "your-local-publishable-key",
                "your-production-publishable-key",
            }
        ):
            return "Supabase authentication is not configured."

        parsed_url = urlparse(self.supabase_url)
        if not parsed_url.hostname:
            return "The Supabase URL is invalid."
        if parsed_url.scheme == "https":
            return None
        if parsed_url.scheme == "http" and parsed_url.hostname in LOOPBACK_HOSTS:
            if self.environment == "production":
                return "Production Supabase configuration cannot use a loopback URL."
            return None
        return "The Supabase URL must use HTTPS unless it targets the local loopback interface."
