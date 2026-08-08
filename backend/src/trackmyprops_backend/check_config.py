"""Fail-fast runtime configuration validation for service start commands."""

import sys

from trackmyprops_backend.config import Settings


def main() -> int:
    settings = Settings.from_environment()
    error = settings.supabase_configuration_error()
    if error:
        print(f"Environment validation failed: {error}", file=sys.stderr)
        return 1
    print(f"{settings.environment} environment configuration is valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
