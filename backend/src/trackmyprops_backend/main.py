"""FastAPI application for the TrackMyProps backend."""

from typing import Annotated, Literal
from uuid import UUID, uuid4

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from starlette.middleware.base import RequestResponseEndpoint
from starlette.responses import Response

from trackmyprops_backend import __version__
from trackmyprops_backend.auth import (
    AuthenticationFailedError,
    AuthenticationServiceUnavailableError,
    AuthGateway,
    CurrentUser,
    SupabaseAuthGateway,
)
from trackmyprops_backend.config import Settings

SERVICE_NAME: Literal["backend"] = "backend"
bearer_scheme = HTTPBearer(auto_error=False)


class HealthResponse(BaseModel):
    """Minimal service health response."""

    status: Literal["ok", "ready"]
    service: Literal["backend"]
    version: str


class ApiError(Exception):
    """Safe, classified error intended for an API client."""

    def __init__(self, status_code: int, code: str, message: str) -> None:
        self.status_code = status_code
        self.code = code
        self.message = message


def correlation_id(value: str | None) -> str:
    if value:
        try:
            return str(UUID(value))
        except ValueError:
            pass
    return str(uuid4())


def create_app(
    settings: Settings | None = None,
    auth_gateway: AuthGateway | None = None,
) -> FastAPI:
    """Create the API with explicit configuration and a testable Auth boundary."""
    runtime_settings = settings or Settings.from_environment()
    gateway = auth_gateway or SupabaseAuthGateway(runtime_settings)
    application = FastAPI(title="TrackMyProps Backend", version=__version__)

    application.add_middleware(
        CORSMiddleware,
        allow_origins=list(runtime_settings.frontend_origins),
        allow_credentials=False,
        allow_methods=["GET", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID", "X-Trace-ID"],
    )

    @application.middleware("http")
    async def add_correlation_headers(
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        request.state.request_id = correlation_id(request.headers.get("X-Request-ID"))
        request.state.trace_id = correlation_id(request.headers.get("X-Trace-ID"))
        response = await call_next(request)
        response.headers["X-Request-ID"] = request.state.request_id
        response.headers["X-Trace-ID"] = request.state.trace_id
        return response

    @application.exception_handler(ApiError)
    async def handle_api_error(request: Request, error: ApiError) -> JSONResponse:
        return JSONResponse(
            status_code=error.status_code,
            content={
                "error": {
                    "code": error.code,
                    "message": error.message,
                    "request_id": request.state.request_id,
                    "trace_id": request.state.trace_id,
                }
            },
        )

    async def authenticated_user(
        credentials: Annotated[
            HTTPAuthorizationCredentials | None,
            Depends(bearer_scheme),
        ],
    ) -> CurrentUser:
        if credentials is None:
            raise ApiError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.")
        if runtime_settings.supabase_configuration_error():
            raise ApiError(
                503,
                "AUTHENTICATION_SERVICE_UNAVAILABLE",
                "Authentication is temporarily unavailable.",
            )
        try:
            return await gateway.get_current_user(credentials.credentials)
        except AuthenticationFailedError as error:
            raise ApiError(
                401, "INVALID_ACCESS_TOKEN", "The access token is invalid or expired."
            ) from error
        except AuthenticationServiceUnavailableError as error:
            raise ApiError(
                503,
                "AUTHENTICATION_SERVICE_UNAVAILABLE",
                "Authentication is temporarily unavailable.",
            ) from error

    @application.get("/health", response_model=HealthResponse)
    def health() -> HealthResponse:
        """Report process liveness without exposing configuration."""
        return HealthResponse(status="ok", service=SERVICE_NAME, version=__version__)

    @application.get("/ready", response_model=HealthResponse)
    async def readiness() -> HealthResponse:
        """Report whether Supabase Auth is configured and reachable."""
        if runtime_settings.supabase_configuration_error():
            raise ApiError(503, "SERVICE_NOT_READY", "The backend is not ready.")
        try:
            await gateway.check_ready()
        except AuthenticationServiceUnavailableError as error:
            raise ApiError(503, "SERVICE_NOT_READY", "The backend is not ready.") from error
        return HealthResponse(status="ready", service=SERVICE_NAME, version=__version__)

    @application.get("/api/v1/me", response_model=CurrentUser)
    async def current_user(
        user: Annotated[CurrentUser, Depends(authenticated_user)],
    ) -> CurrentUser:
        """Return the user represented by the verified Supabase access token."""
        return user

    return application


app = create_app()
