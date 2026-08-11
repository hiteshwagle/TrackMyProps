"""Owner-scoped cash-flow persistence through Supabase's protected Data API."""

from __future__ import annotations

import json
from decimal import Decimal
from typing import Protocol
from uuid import UUID

import httpx2

from trackmyprops_backend.cash_flow_models import (
    CashFlowItem,
    CashFlowItemCreate,
    CashFlowItemType,
)
from trackmyprops_backend.config import Settings


class CashFlowStoreUnavailableError(Exception):
    """The cash-flow data service could not complete the request safely."""


class CashFlowWriteRejectedError(Exception):
    """The database rejected a validated cash-flow write."""


class CashFlowItemNotFoundError(Exception):
    """No visible cash-flow item matched the requested identifiers."""


class CashFlowStore(Protocol):
    async def create(
        self,
        property_id: UUID,
        item_type: CashFlowItemType,
        access_token: str,
        item_input: CashFlowItemCreate,
    ) -> CashFlowItem: ...

    async def list_for_property(
        self,
        property_id: UUID,
        item_type: CashFlowItemType,
        access_token: str,
        page: int,
        page_size: int,
    ) -> tuple[list[CashFlowItem], int]: ...

    async def delete(
        self,
        item_id: UUID,
        item_type: CashFlowItemType,
        access_token: str,
    ) -> None: ...


def _database_payload(
    property_id: UUID,
    item_type: CashFlowItemType,
    item_input: CashFlowItemCreate,
) -> dict[str, object]:
    return {
        "property_id": str(property_id),
        "item_type": item_type.value,
        "name": item_input.name,
        "amount": str(item_input.amount.amount),
        "currency": item_input.amount.currency,
        "frequency": item_input.frequency.value,
        "start_date": item_input.start_date.isoformat() if item_input.start_date else None,
        "end_date": item_input.end_date.isoformat() if item_input.end_date else None,
        "occurrence_date": (
            item_input.occurrence_date.isoformat() if item_input.occurrence_date else None
        ),
    }


def _item_from_database(record: dict[str, object]) -> CashFlowItem:
    return CashFlowItem.model_validate(
        {
            "item_id": record["id"],
            "property_id": record["property_id"],
            "item_type": record["item_type"],
            "name": record["name"],
            "amount": {"amount": record["amount"], "currency": record["currency"]},
            "frequency": record["frequency"],
            "start_date": record.get("start_date"),
            "end_date": record.get("end_date"),
            "occurrence_date": record.get("occurrence_date"),
            "created_at": record["created_at"],
            "updated_at": record["updated_at"],
        }
    )


class SupabaseCashFlowStore:
    """Use the caller's verified JWT so parent-property RLS remains authoritative."""

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
            raise CashFlowStoreUnavailableError from error
        if not isinstance(payload, list) or not all(isinstance(item, dict) for item in payload):
            raise CashFlowStoreUnavailableError
        return payload

    async def create(
        self,
        property_id: UUID,
        item_type: CashFlowItemType,
        access_token: str,
        item_input: CashFlowItemCreate,
    ) -> CashFlowItem:
        try:
            async with self._client() as client:
                response = await client.post(
                    f"{self._settings.supabase_url}/rest/v1/property_cash_flow_items",
                    headers={**self._headers(access_token), "Prefer": "return=representation"},
                    content=json.dumps(_database_payload(property_id, item_type, item_input)),
                )
        except httpx2.RequestError as error:
            raise CashFlowStoreUnavailableError from error

        if response.status_code in {401, 403}:
            raise CashFlowItemNotFoundError
        if response.status_code in {400, 409, 422}:
            raise CashFlowWriteRejectedError
        if response.status_code not in {200, 201}:
            raise CashFlowStoreUnavailableError
        records = self._records(response)
        if len(records) != 1:
            raise CashFlowStoreUnavailableError
        return _item_from_database(records[0])

    async def list_for_property(
        self,
        property_id: UUID,
        item_type: CashFlowItemType,
        access_token: str,
        page: int,
        page_size: int,
    ) -> tuple[list[CashFlowItem], int]:
        parameters = {
            "property_id": f"eq.{property_id}",
            "item_type": f"eq.{item_type.value}",
            "order": "created_at.desc",
            "limit": str(page_size),
            "offset": str((page - 1) * page_size),
        }
        try:
            async with self._client() as client:
                response = await client.get(
                    f"{self._settings.supabase_url}/rest/v1/property_cash_flow_items",
                    headers={**self._headers(access_token), "Prefer": "count=exact"},
                    params=parameters,
                )
        except httpx2.RequestError as error:
            raise CashFlowStoreUnavailableError from error

        if response.status_code != 200:
            raise CashFlowStoreUnavailableError
        content_range = response.headers.get("Content-Range", "")
        try:
            total = int(content_range.rsplit("/", maxsplit=1)[1])
        except (IndexError, ValueError) as error:
            raise CashFlowStoreUnavailableError from error
        return ([_item_from_database(record) for record in self._records(response)], total)

    async def delete(
        self,
        item_id: UUID,
        item_type: CashFlowItemType,
        access_token: str,
    ) -> None:
        parameters = {
            "id": f"eq.{item_id}",
            "item_type": f"eq.{item_type.value}",
        }
        try:
            async with self._client() as client:
                response = await client.delete(
                    f"{self._settings.supabase_url}/rest/v1/property_cash_flow_items",
                    headers={**self._headers(access_token), "Prefer": "return=representation"},
                    params=parameters,
                )
        except httpx2.RequestError as error:
            raise CashFlowStoreUnavailableError from error

        if response.status_code != 200:
            raise CashFlowStoreUnavailableError
        records = self._records(response)
        if not records:
            raise CashFlowItemNotFoundError
        if len(records) != 1:
            raise CashFlowStoreUnavailableError
