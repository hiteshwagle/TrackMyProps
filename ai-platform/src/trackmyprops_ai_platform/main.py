"""FastAPI application for the TrackMyProps AI platform service shell."""

from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel

from trackmyprops_ai_platform import __version__

SERVICE_NAME: Literal["ai-platform"] = "ai-platform"


class HealthResponse(BaseModel):
    """Minimal internal service health response."""

    status: Literal["ok", "ready"]
    service: Literal["ai-platform"]
    version: str


app = FastAPI(title="TrackMyProps AI Platform", version=__version__)


@app.get("/internal/v1/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Report process liveness without exposing configuration."""
    return HealthResponse(status="ok", service=SERVICE_NAME, version=__version__)


@app.get("/internal/v1/ready", response_model=HealthResponse)
def readiness() -> HealthResponse:
    """Report readiness for the dependency-free Phase 0 service."""
    return HealthResponse(status="ready", service=SERVICE_NAME, version=__version__)
