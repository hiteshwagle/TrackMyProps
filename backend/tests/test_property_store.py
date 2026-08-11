from __future__ import annotations

import json
from uuid import UUID

import httpx2
import pytest

from tests.test_properties import OWNER_ID, property_payload
from trackmyprops_backend.config import Settings
from trackmyprops_backend.property_models import PropertyCreate
from trackmyprops_backend.property_store import SupabasePropertyStore

SETTINGS = Settings(
    supabase_url="http://127.0.0.1:54321",
    supabase_publishable_key="test-publishable-key",
)


def database_record(owner_user_id: UUID = OWNER_ID) -> dict[str, object]:
    return {
        "id": "919d97fd-64cb-4eb6-8349-0fc0c78b1285",
        "owner_user_id": str(owner_user_id),
        "address_id": "GANSW123456789",
        "display_name": "Parramatta unit",
        "address_line_1": "10 Example Street",
        "address_line_2": None,
        "suburb": "Parramatta",
        "state": "NSW",
        "postcode": "2150",
        "country": "Australia",
        "property_type": "apartment_unit",
        "bedrooms": 2.5,
        "bathrooms": 1.5,
        "car_spaces": 1,
        "land_area_sqm": 125.5,
        "building_area_sqm": 82.25,
        "purchase_date": "2024-05-01",
        "purchase_price": 650000.00,
        "currency": "AUD",
        "current_value": 700000.00,
        "current_value_as_of": "2026-08-01",
        "has_loan": True,
        "original_loan_amount": 520000.00,
        "remaining_loan_balance": 490000.00,
        "loan_balance_as_of": "2026-08-01",
        "annual_interest_rate": 0.061,
        "repayment_amount": 3200.00,
        "repayment_frequency": "monthly",
        "next_repayment_date": "2026-09-01",
        "notes": "Owner-entered information.",
        "status": "active",
        "created_at": "2026-08-11T00:00:00Z",
        "updated_at": "2026-08-11T00:00:00Z",
    }


@pytest.mark.anyio
async def test_create_forwards_verified_token_and_assigns_owner() -> None:
    def handler(request: httpx2.Request) -> httpx2.Response:
        assert request.url == "http://127.0.0.1:54321/rest/v1/properties"
        assert request.headers["Authorization"] == "Bearer valid-access-token"
        assert request.headers["apikey"] == "test-publishable-key"
        assert request.headers["Prefer"] == "return=representation"
        payload = json.loads(request.content)
        assert payload["owner_user_id"] == str(OWNER_ID)
        assert payload["address_id"] == "GANSW123456789"
        assert "property_id" not in payload
        return httpx2.Response(201, json=[database_record()])

    store = SupabasePropertyStore(SETTINGS, transport=httpx2.MockTransport(handler))

    created = await store.create(
        OWNER_ID,
        "valid-access-token",
        PropertyCreate.model_validate(property_payload()),
    )

    assert created.owner_user_id == OWNER_ID
    assert str(created.purchase_price.amount) == "650000.0"


@pytest.mark.anyio
async def test_list_applies_explicit_owner_and_active_filters() -> None:
    def handler(request: httpx2.Request) -> httpx2.Response:
        assert request.url.params["owner_user_id"] == f"eq.{OWNER_ID}"
        assert request.url.params["status"] == "eq.active"
        assert request.url.params["deleted_at"] == "is.null"
        assert request.url.params["limit"] == "25"
        assert request.url.params["offset"] == "0"
        assert request.headers["Prefer"] == "count=exact"
        return httpx2.Response(
            200,
            headers={"Content-Range": "0-0/1"},
            json=[database_record()],
        )

    store = SupabasePropertyStore(SETTINGS, transport=httpx2.MockTransport(handler))

    properties, total = await store.list_active(OWNER_ID, "valid-access-token", 1, 25)

    assert [item.display_name for item in properties] == ["Parramatta unit"]
    assert total == 1
