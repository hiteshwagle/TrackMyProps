"""Owner-scoped property persistence through Supabase's RLS-protected Data API."""

from __future__ import annotations

import json
from decimal import Decimal
from typing import Protocol
from uuid import UUID

import httpx2

from trackmyprops_backend.config import Settings
from trackmyprops_backend.property_models import (
    Money,
    NonNegativeMoney,
    Property,
    PropertyCreate,
    PropertyListStatus,
    Rate,
)


class PropertyStoreUnavailableError(Exception):
    """The property data service could not complete the request safely."""


class PropertyWriteRejectedError(Exception):
    """The database rejected a validated property write."""


class PropertyNotFoundError(Exception):
    """No visible owner property matched the requested identifier."""


class PropertyStore(Protocol):
    async def create(
        self,
        owner_user_id: UUID,
        access_token: str,
        property_input: PropertyCreate,
    ) -> Property: ...

    async def list_by_status(
        self,
        owner_user_id: UUID,
        access_token: str,
        status: PropertyListStatus,
        page: int,
        page_size: int,
    ) -> tuple[list[Property], int]: ...

    async def get(
        self,
        owner_user_id: UUID,
        property_id: UUID,
        access_token: str,
    ) -> Property: ...

    async def update(
        self,
        owner_user_id: UUID,
        property_id: UUID,
        access_token: str,
        property_input: PropertyCreate,
    ) -> Property: ...

    async def update_status(
        self,
        owner_user_id: UUID,
        property_id: UUID,
        access_token: str,
        status: PropertyListStatus,
    ) -> Property: ...


def _optional_amount(value: Money | NonNegativeMoney | None) -> str | None:
    return str(value.amount) if value is not None else None


def _database_payload(owner_user_id: UUID, property_input: PropertyCreate) -> dict[str, object]:
    remaining_balance = _optional_amount(property_input.remaining_loan_balance)
    if property_input.has_loan is False:
        remaining_balance = "0"

    return {
        "owner_user_id": str(owner_user_id),
        "address_id": property_input.address_id,
        "display_name": property_input.display_name,
        "address_line_1": property_input.address_line_1,
        "address_line_2": property_input.address_line_2,
        "suburb": property_input.suburb,
        "state": property_input.state,
        "postcode": property_input.postcode,
        "country": property_input.country,
        "property_type": property_input.property_type.value,
        "bedrooms": str(property_input.bedrooms),
        "bathrooms": str(property_input.bathrooms),
        "car_spaces": property_input.car_spaces,
        "land_area_sqm": str(property_input.land_area_sqm),
        "building_area_sqm": str(property_input.building_area_sqm),
        "purchase_date": property_input.purchase_date.isoformat(),
        "purchase_price": str(property_input.purchase_price.amount),
        "currency": property_input.purchase_price.currency,
        "current_value": _optional_amount(property_input.current_value),
        "current_value_as_of": (
            property_input.current_value_as_of.isoformat()
            if property_input.current_value_as_of
            else None
        ),
        "has_loan": property_input.has_loan,
        "original_loan_amount": _optional_amount(property_input.original_loan_amount),
        "remaining_loan_balance": remaining_balance,
        "loan_balance_as_of": (
            property_input.loan_balance_as_of.isoformat()
            if property_input.loan_balance_as_of
            else None
        ),
        "annual_interest_rate": (
            str(property_input.annual_interest_rate.value)
            if property_input.annual_interest_rate
            else None
        ),
        "repayment_amount": _optional_amount(property_input.repayment_amount),
        "repayment_frequency": (
            property_input.repayment_frequency.value if property_input.repayment_frequency else None
        ),
        "next_repayment_date": (
            property_input.next_repayment_date.isoformat()
            if property_input.next_repayment_date
            else None
        ),
        "notes": property_input.notes,
    }


def _property_from_database(record: dict[str, object]) -> Property:
    def money(column: str) -> Money | None:
        value = record.get(column)
        return (
            Money.model_validate({"amount": value, "currency": "AUD"})
            if value is not None
            else None
        )

    def non_negative_money(column: str) -> NonNegativeMoney | None:
        value = record.get(column)
        return (
            NonNegativeMoney.model_validate({"amount": value, "currency": "AUD"})
            if value is not None
            else None
        )

    rate_value = record.get("annual_interest_rate")
    rate = None
    if rate_value is not None:
        decimal_rate = Decimal(str(rate_value))
        rate = Rate(value=decimal_rate, display_percent=decimal_rate * 100)

    return Property.model_validate(
        {
            "property_id": record["id"],
            "owner_user_id": record["owner_user_id"],
            "address_id": record.get("address_id"),
            "display_name": record["display_name"],
            "address_line_1": record["address_line_1"],
            "address_line_2": record.get("address_line_2"),
            "suburb": record["suburb"],
            "state": record["state"],
            "postcode": record["postcode"],
            "country": record["country"],
            "property_type": record["property_type"],
            "bedrooms": record["bedrooms"],
            "bathrooms": record["bathrooms"],
            "car_spaces": record["car_spaces"],
            "land_area_sqm": record["land_area_sqm"],
            "building_area_sqm": record["building_area_sqm"],
            "purchase_date": record["purchase_date"],
            "purchase_price": money("purchase_price"),
            "current_value": money("current_value"),
            "current_value_as_of": record.get("current_value_as_of"),
            "has_loan": record.get("has_loan"),
            "original_loan_amount": money("original_loan_amount"),
            "remaining_loan_balance": non_negative_money("remaining_loan_balance"),
            "loan_balance_as_of": record.get("loan_balance_as_of"),
            "annual_interest_rate": rate,
            "repayment_amount": money("repayment_amount"),
            "repayment_frequency": record.get("repayment_frequency"),
            "next_repayment_date": record.get("next_repayment_date"),
            "notes": record.get("notes"),
            "status": record["status"],
            "created_at": record["created_at"],
            "updated_at": record["updated_at"],
        }
    )


class SupabasePropertyStore:
    """Use the caller's verified JWT so database RLS remains authoritative."""

    def __init__(
        self,
        settings: Settings,
        *,
        transport: httpx2.AsyncBaseTransport | None = None,
    ) -> None:
        self._settings = settings
        self._transport = transport

    def _client(self) -> httpx2.AsyncClient:
        return httpx2.AsyncClient(timeout=5.0, transport=self._transport, trust_env=False)

    def _headers(self, access_token: str) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {access_token}",
            "apikey": self._settings.supabase_publishable_key,
            "Content-Type": "application/json",
        }

    @staticmethod
    def _records(response: httpx2.Response) -> list[dict[str, object]]:
        try:
            payload = json.loads(response.text, parse_float=Decimal)
        except (json.JSONDecodeError, TypeError) as error:
            raise PropertyStoreUnavailableError from error
        if not isinstance(payload, list) or not all(isinstance(item, dict) for item in payload):
            raise PropertyStoreUnavailableError
        return payload

    async def create(
        self,
        owner_user_id: UUID,
        access_token: str,
        property_input: PropertyCreate,
    ) -> Property:
        headers = {**self._headers(access_token), "Prefer": "return=representation"}
        try:
            async with self._client() as client:
                response = await client.post(
                    f"{self._settings.supabase_url}/rest/v1/properties",
                    headers=headers,
                    content=json.dumps(_database_payload(owner_user_id, property_input)),
                )
        except httpx2.RequestError as error:
            raise PropertyStoreUnavailableError from error

        if response.status_code in {400, 409, 422}:
            raise PropertyWriteRejectedError
        if response.status_code not in {200, 201}:
            raise PropertyStoreUnavailableError
        records = self._records(response)
        if len(records) != 1:
            raise PropertyStoreUnavailableError
        return _property_from_database(records[0])

    async def list_by_status(
        self,
        owner_user_id: UUID,
        access_token: str,
        status: PropertyListStatus,
        page: int,
        page_size: int,
    ) -> tuple[list[Property], int]:
        offset = (page - 1) * page_size
        parameters = {
            "owner_user_id": f"eq.{owner_user_id}",
            "status": f"eq.{status.value}",
            "deleted_at": "is.null",
            "order": "created_at.desc",
            "limit": str(page_size),
            "offset": str(offset),
        }
        try:
            async with self._client() as client:
                response = await client.get(
                    f"{self._settings.supabase_url}/rest/v1/properties",
                    headers={**self._headers(access_token), "Prefer": "count=exact"},
                    params=parameters,
                )
        except httpx2.RequestError as error:
            raise PropertyStoreUnavailableError from error

        if response.status_code != 200:
            raise PropertyStoreUnavailableError
        content_range = response.headers.get("Content-Range", "")
        try:
            total = int(content_range.rsplit("/", maxsplit=1)[1])
        except (IndexError, ValueError) as error:
            raise PropertyStoreUnavailableError from error
        return ([_property_from_database(record) for record in self._records(response)], total)

    async def get(
        self,
        owner_user_id: UUID,
        property_id: UUID,
        access_token: str,
    ) -> Property:
        parameters = {
            "id": f"eq.{property_id}",
            "owner_user_id": f"eq.{owner_user_id}",
            "deleted_at": "is.null",
            "limit": "1",
        }
        try:
            async with self._client() as client:
                response = await client.get(
                    f"{self._settings.supabase_url}/rest/v1/properties",
                    headers=self._headers(access_token),
                    params=parameters,
                )
        except httpx2.RequestError as error:
            raise PropertyStoreUnavailableError from error

        if response.status_code != 200:
            raise PropertyStoreUnavailableError
        records = self._records(response)
        if not records:
            raise PropertyNotFoundError
        if len(records) != 1:
            raise PropertyStoreUnavailableError
        return _property_from_database(records[0])

    async def update(
        self,
        owner_user_id: UUID,
        property_id: UUID,
        access_token: str,
        property_input: PropertyCreate,
    ) -> Property:
        return await self._update_record(
            owner_user_id,
            property_id,
            access_token,
            _database_payload(owner_user_id, property_input),
        )

    async def update_status(
        self,
        owner_user_id: UUID,
        property_id: UUID,
        access_token: str,
        status: PropertyListStatus,
    ) -> Property:
        return await self._update_record(
            owner_user_id,
            property_id,
            access_token,
            {"status": status.value},
        )

    async def _update_record(
        self,
        owner_user_id: UUID,
        property_id: UUID,
        access_token: str,
        payload: dict[str, object],
    ) -> Property:
        headers = {**self._headers(access_token), "Prefer": "return=representation"}
        parameters = {
            "id": f"eq.{property_id}",
            "owner_user_id": f"eq.{owner_user_id}",
            "deleted_at": "is.null",
        }
        try:
            async with self._client() as client:
                response = await client.patch(
                    f"{self._settings.supabase_url}/rest/v1/properties",
                    headers=headers,
                    params=parameters,
                    content=json.dumps(payload),
                )
        except httpx2.RequestError as error:
            raise PropertyStoreUnavailableError from error

        if response.status_code in {400, 409, 422}:
            raise PropertyWriteRejectedError
        if response.status_code != 200:
            raise PropertyStoreUnavailableError
        records = self._records(response)
        if not records:
            raise PropertyNotFoundError
        if len(records) != 1:
            raise PropertyStoreUnavailableError
        return _property_from_database(records[0])
