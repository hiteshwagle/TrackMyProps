"""Dependency-free example entry point for the Phase 0 data job shell."""

import json

from trackmyprops_data_platform import __version__

JOB_NAME = "example"


def run() -> dict[str, str]:
    """Return deterministic metadata proving the job entry point can run."""
    return {"job": JOB_NAME, "status": "completed", "version": __version__}


def main() -> int:
    """Write the example job result as one structured line."""
    print(json.dumps(run(), sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
