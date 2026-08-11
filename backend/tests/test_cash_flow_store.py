from __future__ import annotations

import json
from uuid import UUID

import httpx2
import pytest

from trackmyprops_backend.cash_flow_models import (
    CashFlowItemCreate,
    CashFlowItemType,
)
from trackmyprops_backend.cash_flow_store import (
    CashFlowItemNotFoundError,
    SupabaseCashFlowStore,
)
from trackmyprops_backend.config import Settings

SETTINGS = Settings(
    supabase_url="http://127.0.0.1:54321",
    supabase_publishable_key="test-publishable-key",
)
PROPERTY_ID = UUID("919d97fd-64cb-4eb6-8349-0fc0c78b1285")
ITEM_ID = UUID("5658d22d-dd92-4b45-bc19-740b03b4193b")


def database_record() -> dict[str, object]:
    return {
        "id": str(ITEM_ID),
        "property_id": str(PROPERTY_ID),
        "item_type": "income",
        "name": "Rent",
        "amount": 650.00,
        "currency": "AUD",
        "frequency": "weekly",
        "start_date": "2026-08-11",
        "end_date": None,
        "occurrence_date": None,
        "created_at": "2026-08-11T00:00:00Z",
        "updated_at": "2026-08-11T00:00:00Z",
    }


def recurring_input() -> CashFlowItemCreate:
    return CashFlowItemCreate.model_validate(
        {
            "name": "Rent",
            "amount": {"amount": "650.00", "currency": "AUD"},
            "frequency": "weekly",
            "start_date": "2026-08-11",
        }
    )


@pytest.mark.anyio
async def test_create_uses_caller_token_and_fixed_item_type() -> None:
    def handler(request: httpx2.Request) -> httpx2.Response:
        assert request.url == ("http://127.0.0.1:54321/rest/v1/property_cash_flow_items")
        assert request.headers["Authorization"] == "Bearer valid-access-token"
        assert request.headers["apikey"] == "test-publishable-key"
        payload = json.loads(request.content)
        assert payload["property_id"] == str(PROPERTY_ID)
        assert payload["item_type"] == "income"
        assert payload["amount"] == "650.00"
        return httpx2.Response(201, json=[database_record()])

    store = SupabaseCashFlowStore(SETTINGS, transport=httpx2.MockTransport(handler))

    item = await store.create(
        PROPERTY_ID,
        CashFlowItemType.INCOME,
        "valid-access-token",
        recurring_input(),
    )

    assert item.item_id == ITEM_ID
    assert str(item.amount.amount) == "650.0"


@pytest.mark.anyio
async def test_list_filters_property_and_item_type() -> None:
    def handler(request: httpx2.Request) -> httpx2.Response:
        assert request.url.params["item_type"] == "eq.income"
        assert request.url.params["limit"] == "25"
        assert request.url.params["offset"] == "0"
        assert request.headers["Prefer"] == "count=exact"
        return httpx2.Response(
            200,
            headers={"Content-Range": "0-0/1"},
            json=[database_record()],
        )

    store = SupabaseCashFlowStore(SETTINGS, transport=httpx2.MockTransport(handler))

    items, total = await store.list_for_property(
        PROPERTY_ID,
        CashFlowItemType.INCOME,
        "valid-access-token",
        1,
        25,
    )

    assert [item.name for item in items] == ["Rent"]
    assert total == 1


@pytest.mark.anyio
async def test_delete_is_scoped_and_hides_unknown_items() -> None:
    responses = [
        httpx2.Response(200, json=[database_record()]),
        httpx2.Response(200, json=[]),
    ]

    def handler(request: httpx2.Request) -> httpx2.Response:
        assert request.method == "DELETE"
        assert request.url.params["id"] == f"eq.{ITEM_ID}"
        assert request.url.params["item_type"] == "eq.income"
        return responses.pop(0)

    store = SupabaseCashFlowStore(SETTINGS, transport=httpx2.MockTransport(handler))

    await store.delete(
        ITEM_ID,
        CashFlowItemType.INCOME,
        "valid-access-token",
    )
    with pytest.raises(CashFlowItemNotFoundError):
        await store.delete(
            ITEM_ID,
            CashFlowItemType.INCOME,
            "valid-access-token",
        )
