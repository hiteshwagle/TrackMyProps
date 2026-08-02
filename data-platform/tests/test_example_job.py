import json

import pytest

from trackmyprops_data_platform.example_job import main, run


def test_run_returns_deterministic_metadata() -> None:
    assert run() == {"job": "example", "status": "completed", "version": "0.0.0"}


def test_main_writes_structured_result(capsys: pytest.CaptureFixture[str]) -> None:
    assert main() == 0
    captured = capsys.readouterr()
    assert json.loads(captured.out) == run()
