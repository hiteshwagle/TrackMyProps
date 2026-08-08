from trackmyprops_backend.config import DEFAULT_FRONTEND_ORIGINS, Settings


def test_local_supabase_http_url_is_allowed() -> None:
    settings = Settings(
        supabase_url="http://127.0.0.1:54321",
        supabase_publishable_key="test-publishable-key",
    )

    assert settings.supabase_configuration_error() is None


def test_non_local_supabase_http_url_is_rejected() -> None:
    settings = Settings(
        supabase_url="http://supabase.example.com",
        supabase_publishable_key="test-publishable-key",
    )

    assert "must use HTTPS" in (settings.supabase_configuration_error() or "")


def test_publishable_key_placeholder_is_not_treated_as_configuration() -> None:
    settings = Settings(
        supabase_url="http://127.0.0.1:54321",
        supabase_publishable_key="your-local-publishable-key",
    )

    assert settings.supabase_configuration_error() == "Supabase authentication is not configured."


def test_settings_are_loaded_without_exposing_defaults_as_secrets() -> None:
    settings = Settings.from_environment(
        {
            "TRACKMYPROPS_SUPABASE_URL": "http://localhost:54321/",
            "TRACKMYPROPS_SUPABASE_PUBLISHABLE_KEY": " local-key ",
        }
    )

    assert settings.supabase_url == "http://localhost:54321"
    assert settings.supabase_publishable_key == "local-key"
    assert settings.frontend_origins == DEFAULT_FRONTEND_ORIGINS
