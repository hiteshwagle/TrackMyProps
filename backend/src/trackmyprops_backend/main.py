"""FastAPI application for the TrackMyProps backend service shell."""

from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel

from trackmyprops_backend import __version__

SERVICE_NAME: Literal["backend"] = "backend"


class HealthResponse(BaseModel):
    """Minimal service health response."""

    status: Literal["ok", "ready"]
    service: Literal["backend"]
    version: str


app = FastAPI(title="TrackMyProps Backend", version=__version__)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Report process liveness without exposing configuration."""
    return HealthResponse(status="ok", service=SERVICE_NAME, version=__version__)


@app.get("/ready", response_model=HealthResponse)
def readiness() -> HealthResponse:
    """Report readiness for the dependency-free Phase 0 service."""
    return HealthResponse(status="ready", service=SERVICE_NAME, version=__version__)
