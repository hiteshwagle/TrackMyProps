"""FastAPI application for the TrackMyProps backend."""

from dataclasses import dataclass
from typing import Annotated, Literal
from uuid import UUID, uuid4

from fastapi import Depends, FastAPI, Query, Request
from fastapi.exceptions import RequestValidationError
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
from trackmyprops_backend.property_models import (
    PagePagination,
    Property,
    PropertyCreate,
    PropertyList,
)
from trackmyprops_backend.property_store import (
    PropertyStore,
    PropertyStoreUnavailableError,
    PropertyWriteRejectedError,
    SupabasePropertyStore,
)

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


@dataclass(frozen=True)
class AuthenticatedRequest:
    """Verified identity and its bearer token for an RLS-protected data request."""

    user: CurrentUser
    access_token: str


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
    property_store: PropertyStore | None = None,
) -> FastAPI:
    """Create the API with explicit configuration and a testable Auth boundary."""
    runtime_settings = settings or Settings.from_environment()
    gateway = auth_gateway or SupabaseAuthGateway(runtime_settings)
    properties = property_store or SupabasePropertyStore(runtime_settings)
    application = FastAPI(title="TrackMyProps Backend", version=__version__)

    application.add_middleware(
        CORSMiddleware,
        allow_origins=list(runtime_settings.frontend_origins),
        allow_credentials=False,
        allow_methods=["GET", "OPTIONS", "POST"],
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

    @application.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request,
        error: RequestValidationError,
    ) -> JSONResponse:
        field_errors = []
        for item in error.errors():
            location = [str(part) for part in item["loc"] if part != "body"]
            field_errors.append(
                {
                    "field": ".".join(location) or "request",
                    "code": "INVALID_VALUE",
                    "message": str(item["msg"]),
                }
            )
        return JSONResponse(
            status_code=422,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "The request contains invalid values.",
                    "request_id": request.state.request_id,
                    "trace_id": request.state.trace_id,
                    "field_errors": field_errors,
                }
            },
        )

    async def authenticated_request(
        credentials: Annotated[
            HTTPAuthorizationCredentials | None,
            Depends(bearer_scheme),
        ],
    ) -> AuthenticatedRequest:
        if credentials is None:
            raise ApiError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.")
        if runtime_settings.supabase_configuration_error():
            raise ApiError(
                503,
                "AUTHENTICATION_SERVICE_UNAVAILABLE",
                "Authentication is temporarily unavailable.",
            )
        try:
            user = await gateway.get_current_user(credentials.credentials)
            return AuthenticatedRequest(user=user, access_token=credentials.credentials)
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
        authenticated: Annotated[AuthenticatedRequest, Depends(authenticated_request)],
    ) -> CurrentUser:
        """Return the user represented by the verified Supabase access token."""
        return authenticated.user

    @application.get("/api/v1/properties", response_model=PropertyList)
    async def list_properties(
        authenticated: Annotated[AuthenticatedRequest, Depends(authenticated_request)],
        page: Annotated[int, Query(ge=1)] = 1,
        page_size: Annotated[int, Query(ge=1, le=100)] = 25,
    ) -> PropertyList:
        """Return the authenticated owner's active, non-deleted properties."""
        try:
            items, total = await properties.list_active(
                authenticated.user.id,
                authenticated.access_token,
                page,
                page_size,
            )
        except PropertyStoreUnavailableError as error:
            raise ApiError(
                503,
                "PROPERTY_SERVICE_UNAVAILABLE",
                "Properties are temporarily unavailable.",
            ) from error
        total_pages = (total + page_size - 1) // page_size
        return PropertyList(
            items=items,
            pagination=PagePagination(
                page=page,
                page_size=page_size,
                total=total,
                total_pages=total_pages,
                has_next=page < total_pages,
                has_previous=page > 1,
            ),
        )

    @application.post("/api/v1/properties", response_model=Property, status_code=201)
    async def create_property(
        property_input: PropertyCreate,
        authenticated: Annotated[AuthenticatedRequest, Depends(authenticated_request)],
    ) -> Property:
        """Create a currently owned property for the authenticated owner."""
        try:
            return await properties.create(
                authenticated.user.id,
                authenticated.access_token,
                property_input,
            )
        except PropertyWriteRejectedError as error:
            raise ApiError(
                422,
                "PROPERTY_REJECTED",
                "The property could not be saved with the supplied values.",
            ) from error
        except PropertyStoreUnavailableError as error:
            raise ApiError(
                503,
                "PROPERTY_SERVICE_UNAVAILABLE",
                "The property could not be saved because the service is unavailable.",
            ) from error

    return application


app = create_app()
