import pytest

from trackmyprops_backend.check_config import main


def test_configuration_check_accepts_complete_development_environment(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    monkeypatch.setenv("TRACKMYPROPS_ENVIRONMENT", "development")
    monkeypatch.setenv("TRACKMYPROPS_SUPABASE_URL", "http://127.0.0.1:54321")
    monkeypatch.setenv("TRACKMYPROPS_SUPABASE_PUBLISHABLE_KEY", "test-publishable-key")

    assert main() == 0
    assert capsys.readouterr().out == "development environment configuration is valid.\n"


def test_configuration_check_rejects_production_placeholder_without_printing_it(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    placeholder = "your-production-publishable-key"
    monkeypatch.setenv("TRACKMYPROPS_ENVIRONMENT", "production")
    monkeypatch.setenv(
        "TRACKMYPROPS_SUPABASE_URL",
        "https://your-project-ref.supabase.co",
    )
    monkeypatch.setenv("TRACKMYPROPS_SUPABASE_PUBLISHABLE_KEY", placeholder)

    assert main() == 1
    captured_output = capsys.readouterr()
    assert "Supabase authentication is not configured" in captured_output.err
    assert placeholder not in captured_output.err
