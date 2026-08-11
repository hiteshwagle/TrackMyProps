"""FastAPI application for the TrackMyProps backend."""

from collections.abc import Awaitable
from dataclasses import dataclass
from datetime import date
from decimal import Decimal
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
from trackmyprops_backend.cash_flow_models import (
    CashFlowItem,
    CashFlowItemCreate,
    CashFlowItemList,
    CashFlowItemType,
    PropertyCashFlowSummary,
    calculate_property_cash_flow_summary,
)
from trackmyprops_backend.cash_flow_store import (
    CashFlowItemNotFoundError,
    CashFlowStore,
    CashFlowStoreUnavailableError,
    CashFlowWriteRejectedError,
    SupabaseCashFlowStore,
)
from trackmyprops_backend.config import Settings
from trackmyprops_backend.property_models import (
    PagePagination,
    PortfolioMoney,
    PortfolioSummary,
    Property,
    PropertyCreate,
    PropertyList,
    PropertyListStatus,
    PropertyStatusUpdate,
)
from trackmyprops_backend.property_store import (
    PropertyNotFoundError,
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


def calculate_portfolio_summary(items: list[Property]) -> PortfolioSummary:
    """Calculate active-portfolio totals without treating missing values as zero."""

    asset_values = [item.current_value.amount for item in items if item.current_value is not None]
    loan_balances = [
        item.remaining_loan_balance.amount
        for item in items
        if item.remaining_loan_balance is not None
    ]
    equity_values = [
        item.current_value.amount - item.remaining_loan_balance.amount
        for item in items
        if item.current_value is not None and item.remaining_loan_balance is not None
    ]

    def total(values: list[Decimal]) -> PortfolioMoney | None:
        return PortfolioMoney(amount=sum(values, start=Decimal("0"))) if values else None

    return PortfolioSummary(
        property_count=len(items),
        total_asset_value=total(asset_values),
        asset_value_missing_count=len(items) - len(asset_values),
        total_remaining_loan=total(loan_balances),
        loan_balance_missing_count=len(items) - len(loan_balances),
        total_equity=total(equity_values),
        equity_missing_count=len(items) - len(equity_values),
    )


def create_app(
    settings: Settings | None = None,
    auth_gateway: AuthGateway | None = None,
    property_store: PropertyStore | None = None,
    cash_flow_store: CashFlowStore | None = None,
) -> FastAPI:
    """Create the API with explicit configuration and a testable Auth boundary."""
    runtime_settings = settings or Settings.from_environment()
    gateway = auth_gateway or SupabaseAuthGateway(runtime_settings)
    properties = property_store or SupabasePropertyStore(runtime_settings)
    cash_flow_items = cash_flow_store or SupabaseCashFlowStore(runtime_settings)
    application = FastAPI(title="TrackMyProps Backend", version=__version__)

    application.add_middleware(
        CORSMiddleware,
        allow_origins=list(runtime_settings.frontend_origins),
        allow_credentials=False,
        allow_methods=["DELETE", "GET", "OPTIONS", "PATCH", "POST", "PUT"],
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

    async def property_write(operation: Awaitable[Property]) -> Property:
        try:
            return await operation
        except PropertyNotFoundError as error:
            raise ApiError(404, "PROPERTY_NOT_FOUND", "The property could not be found.") from error
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

    async def read_property(
        authenticated: AuthenticatedRequest,
        property_id: UUID,
    ) -> Property:
        try:
            return await properties.get(
                authenticated.user.id,
                property_id,
                authenticated.access_token,
            )
        except PropertyNotFoundError as error:
            raise ApiError(404, "PROPERTY_NOT_FOUND", "The property could not be found.") from error
        except PropertyStoreUnavailableError as error:
            raise ApiError(
                503,
                "PROPERTY_SERVICE_UNAVAILABLE",
                "Properties are temporarily unavailable.",
            ) from error

    async def cash_flow_write(operation: Awaitable[CashFlowItem]) -> CashFlowItem:
        try:
            return await operation
        except CashFlowItemNotFoundError as error:
            raise ApiError(
                404,
                "CASH_FLOW_ITEM_NOT_FOUND",
                "The property or cash flow item could not be found.",
            ) from error
        except CashFlowWriteRejectedError as error:
            raise ApiError(
                422,
                "CASH_FLOW_ITEM_REJECTED",
                "The cash flow item could not be saved with the supplied values.",
            ) from error
        except CashFlowStoreUnavailableError as error:
            raise ApiError(
                503,
                "CASH_FLOW_SERVICE_UNAVAILABLE",
                "Income and expenses are temporarily unavailable.",
            ) from error

    async def list_cash_flow_items(
        authenticated: AuthenticatedRequest,
        property_id: UUID,
        item_type: CashFlowItemType,
        page: int,
        page_size: int,
    ) -> CashFlowItemList:
        try:
            items, total = await cash_flow_items.list_for_property(
                property_id,
                item_type,
                authenticated.access_token,
                page,
                page_size,
            )
        except CashFlowStoreUnavailableError as error:
            raise ApiError(
                503,
                "CASH_FLOW_SERVICE_UNAVAILABLE",
                "Income and expenses are temporarily unavailable.",
            ) from error
        total_pages = (total + page_size - 1) // page_size
        return CashFlowItemList(
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

    async def all_cash_flow_items(
        authenticated: AuthenticatedRequest,
        property_id: UUID,
    ) -> list[CashFlowItem]:
        items: list[CashFlowItem] = []
        page_size = 100
        try:
            for item_type in CashFlowItemType:
                page = 1
                type_items: list[CashFlowItem] = []
                while True:
                    page_items, total = await cash_flow_items.list_for_property(
                        property_id,
                        item_type,
                        authenticated.access_token,
                        page,
                        page_size,
                    )
                    type_items.extend(page_items)
                    if len(type_items) >= total:
                        break
                    if not page_items:
                        raise CashFlowStoreUnavailableError
                    page += 1
                items.extend(type_items)
        except CashFlowStoreUnavailableError as error:
            raise ApiError(
                503,
                "CASH_FLOW_SERVICE_UNAVAILABLE",
                "Income and expenses are temporarily unavailable.",
            ) from error
        return items

    async def delete_cash_flow_item(
        authenticated: AuthenticatedRequest,
        item_id: UUID,
        item_type: CashFlowItemType,
    ) -> None:
        try:
            await cash_flow_items.delete(
                item_id,
                item_type,
                authenticated.access_token,
            )
        except CashFlowItemNotFoundError as error:
            raise ApiError(
                404,
                "CASH_FLOW_ITEM_NOT_FOUND",
                "The property or cash flow item could not be found.",
            ) from error
        except CashFlowStoreUnavailableError as error:
            raise ApiError(
                503,
                "CASH_FLOW_SERVICE_UNAVAILABLE",
                "Income and expenses are temporarily unavailable.",
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
        status: PropertyListStatus = PropertyListStatus.ACTIVE,
        page: Annotated[int, Query(ge=1)] = 1,
        page_size: Annotated[int, Query(ge=1, le=100)] = 25,
    ) -> PropertyList:
        """Return one lifecycle list of the authenticated owner's non-deleted properties."""
        try:
            items, total = await properties.list_by_status(
                authenticated.user.id,
                authenticated.access_token,
                status,
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
        return await property_write(
            properties.create(
                authenticated.user.id,
                authenticated.access_token,
                property_input,
            )
        )

    @application.get("/api/v1/properties/{property_id}", response_model=Property)
    async def get_property(
        property_id: UUID,
        authenticated: Annotated[AuthenticatedRequest, Depends(authenticated_request)],
    ) -> Property:
        """Return one non-deleted property visible to the authenticated owner."""
        return await read_property(authenticated, property_id)

    @application.put("/api/v1/properties/{property_id}", response_model=Property)
    async def update_property(
        property_id: UUID,
        property_input: PropertyCreate,
        authenticated: Annotated[AuthenticatedRequest, Depends(authenticated_request)],
    ) -> Property:
        """Replace editable details without changing the property's lifecycle status."""
        return await property_write(
            properties.update(
                authenticated.user.id,
                property_id,
                authenticated.access_token,
                property_input,
            )
        )

    @application.patch("/api/v1/properties/{property_id}/status", response_model=Property)
    async def update_property_status(
        property_id: UUID,
        status_update: PropertyStatusUpdate,
        authenticated: Annotated[AuthenticatedRequest, Depends(authenticated_request)],
    ) -> Property:
        """Move an owner property between the active and archived lifecycle lists."""
        return await property_write(
            properties.update_status(
                authenticated.user.id,
                property_id,
                authenticated.access_token,
                status_update.status,
            )
        )

    @application.get(
        "/api/v1/properties/{property_id}/income",
        response_model=CashFlowItemList,
    )
    async def list_property_income(
        property_id: UUID,
        authenticated: Annotated[AuthenticatedRequest, Depends(authenticated_request)],
        page: Annotated[int, Query(ge=1)] = 1,
        page_size: Annotated[int, Query(ge=1, le=100)] = 25,
    ) -> CashFlowItemList:
        return await list_cash_flow_items(
            authenticated,
            property_id,
            CashFlowItemType.INCOME,
            page,
            page_size,
        )

    @application.post(
        "/api/v1/properties/{property_id}/income",
        response_model=CashFlowItem,
        status_code=201,
    )
    async def create_property_income(
        property_id: UUID,
        item_input: CashFlowItemCreate,
        authenticated: Annotated[AuthenticatedRequest, Depends(authenticated_request)],
    ) -> CashFlowItem:
        return await cash_flow_write(
            cash_flow_items.create(
                property_id,
                CashFlowItemType.INCOME,
                authenticated.access_token,
                item_input,
            )
        )

    @application.delete(
        "/api/v1/income/{item_id}",
        status_code=204,
    )
    async def delete_property_income(
        item_id: UUID,
        authenticated: Annotated[AuthenticatedRequest, Depends(authenticated_request)],
    ) -> None:
        await delete_cash_flow_item(
            authenticated,
            item_id,
            CashFlowItemType.INCOME,
        )

    @application.get(
        "/api/v1/properties/{property_id}/expenses",
        response_model=CashFlowItemList,
    )
    async def list_property_expenses(
        property_id: UUID,
        authenticated: Annotated[AuthenticatedRequest, Depends(authenticated_request)],
        page: Annotated[int, Query(ge=1)] = 1,
        page_size: Annotated[int, Query(ge=1, le=100)] = 25,
    ) -> CashFlowItemList:
        return await list_cash_flow_items(
            authenticated,
            property_id,
            CashFlowItemType.EXPENSE,
            page,
            page_size,
        )

    @application.post(
        "/api/v1/properties/{property_id}/expenses",
        response_model=CashFlowItem,
        status_code=201,
    )
    async def create_property_expense(
        property_id: UUID,
        item_input: CashFlowItemCreate,
        authenticated: Annotated[AuthenticatedRequest, Depends(authenticated_request)],
    ) -> CashFlowItem:
        return await cash_flow_write(
            cash_flow_items.create(
                property_id,
                CashFlowItemType.EXPENSE,
                authenticated.access_token,
                item_input,
            )
        )

    @application.delete(
        "/api/v1/expenses/{item_id}",
        status_code=204,
    )
    async def delete_property_expense(
        item_id: UUID,
        authenticated: Annotated[AuthenticatedRequest, Depends(authenticated_request)],
    ) -> None:
        await delete_cash_flow_item(
            authenticated,
            item_id,
            CashFlowItemType.EXPENSE,
        )

    @application.get(
        "/api/v1/properties/{property_id}/cash-flow-summary",
        response_model=PropertyCashFlowSummary,
    )
    async def get_property_cash_flow_summary(
        property_id: UUID,
        authenticated: Annotated[AuthenticatedRequest, Depends(authenticated_request)],
        year: Annotated[int | None, Query(ge=2000, le=9999)] = None,
    ) -> PropertyCashFlowSummary:
        """Return annualised income and expense totals for one owner property."""
        await read_property(authenticated, property_id)
        items = await all_cash_flow_items(authenticated, property_id)
        return calculate_property_cash_flow_summary(
            property_id,
            items,
            year if year is not None else date.today().year,
        )

    @application.get("/api/v1/portfolio/summary", response_model=PortfolioSummary)
    async def get_portfolio_summary(
        authenticated: Annotated[AuthenticatedRequest, Depends(authenticated_request)],
    ) -> PortfolioSummary:
        """Return authoritative totals for active, non-deleted owner properties."""
        page = 1
        page_size = 100
        items: list[Property] = []
        try:
            while True:
                page_items, total = await properties.list_by_status(
                    authenticated.user.id,
                    authenticated.access_token,
                    PropertyListStatus.ACTIVE,
                    page,
                    page_size,
                )
                items.extend(page_items)
                if len(items) >= total:
                    break
                if not page_items:
                    raise PropertyStoreUnavailableError
                page += 1
        except PropertyStoreUnavailableError as error:
            raise ApiError(
                503,
                "PROPERTY_SERVICE_UNAVAILABLE",
                "Portfolio totals are temporarily unavailable.",
            ) from error
        return calculate_portfolio_summary(items)

    return application


app = create_app()
