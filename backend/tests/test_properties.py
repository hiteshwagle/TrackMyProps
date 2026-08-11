from __future__ import annotations

from datetime import UTC, datetime
from typing import Any
from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient

from trackmyprops_backend.auth import AuthenticationFailedError, CurrentUser
from trackmyprops_backend.config import Settings
from trackmyprops_backend.main import create_app
from trackmyprops_backend.property_models import Property, PropertyCreate, PropertyStatus

TEST_SETTINGS = Settings(
    supabase_url="http://127.0.0.1:54321",
    supabase_publishable_key="test-publishable-key",
)
OWNER_ID = UUID("e8cf2dbf-463e-485f-880d-cdb828749979")
PROPERTY_ID = UUID("919d97fd-64cb-4eb6-8349-0fc0c78b1285")


class FakeAuthGateway:
    async def check_ready(self) -> None:
        return None

    async def get_current_user(self, access_token: str) -> CurrentUser:
        if access_token != "valid-access-token":
            raise AuthenticationFailedError
        return CurrentUser(
            id=OWNER_ID,
            email="owner@example.com",
            name="Owner Example",
            phone=None,
        )


class FakePropertyStore:
    def __init__(self) -> None:
        self.created_for: UUID | None = None
        self.access_token: str | None = None
        self.items: list[Property] = []

    async def create(
        self,
        owner_user_id: UUID,
        access_token: str,
        property_input: PropertyCreate,
    ) -> Property:
        self.created_for = owner_user_id
        self.access_token = access_token
        property_record = Property(
            **property_input.model_dump(),
            property_id=PROPERTY_ID,
            owner_user_id=owner_user_id,
            status=PropertyStatus.ACTIVE,
            created_at=datetime(2026, 8, 11, tzinfo=UTC),
            updated_at=datetime(2026, 8, 11, tzinfo=UTC),
        )
        self.items.append(property_record)
        return property_record

    async def list_active(
        self,
        owner_user_id: UUID,
        access_token: str,
        page: int,
        page_size: int,
    ) -> tuple[list[Property], int]:
        self.created_for = owner_user_id
        self.access_token = access_token
        return self.items, len(self.items)


def property_payload() -> dict[str, Any]:
    return {
        "display_name": "Parramatta unit",
        "address_line_1": "10 Example Street",
        "address_line_2": None,
        "suburb": "Parramatta",
        "state": "NSW",
        "postcode": "2150",
        "country": "Australia",
        "property_type": "apartment_unit",
        "bedrooms": "2.5",
        "bathrooms": "1.5",
        "car_spaces": 1,
        "land_area_sqm": "125.50",
        "building_area_sqm": "82.25",
        "purchase_date": "2024-05-01",
        "purchase_price": {"amount": "650000.00", "currency": "AUD"},
        "current_value": {"amount": "700000.00", "currency": "AUD"},
        "current_value_as_of": "2026-08-01",
        "has_loan": True,
        "original_loan_amount": {"amount": "520000.00", "currency": "AUD"},
        "remaining_loan_balance": {"amount": "490000.00", "currency": "AUD"},
        "loan_balance_as_of": "2026-08-01",
        "annual_interest_rate": {"value": "0.061", "display_percent": "6.1"},
        "repayment_amount": {"amount": "3200.00", "currency": "AUD"},
        "repayment_frequency": "monthly",
        "next_repayment_date": "2026-09-01",
        "notes": "Owner-entered information.",
    }


@pytest.fixture
def property_store() -> FakePropertyStore:
    return FakePropertyStore()


@pytest.fixture
def client(property_store: FakePropertyStore) -> TestClient:
    return TestClient(create_app(TEST_SETTINGS, FakeAuthGateway(), property_store))


def test_create_property_requires_authentication(client: TestClient) -> None:
    response = client.post("/api/v1/properties", json=property_payload())

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTHENTICATION_REQUIRED"


def test_create_property_uses_verified_owner_and_token(
    client: TestClient,
    property_store: FakePropertyStore,
) -> None:
    response = client.post(
        "/api/v1/properties",
        headers={"Authorization": "Bearer valid-access-token"},
        json=property_payload(),
    )

    assert response.status_code == 201
    assert response.json()["property_id"] == str(PROPERTY_ID)
    assert response.json()["owner_user_id"] == str(OWNER_ID)
    assert response.json()["purchase_price"] == {"amount": "650000.00", "currency": "AUD"}
    assert property_store.created_for == OWNER_ID
    assert property_store.access_token == "valid-access-token"


def test_list_properties_returns_only_store_results(
    client: TestClient,
    property_store: FakePropertyStore,
) -> None:
    create_response = client.post(
        "/api/v1/properties",
        headers={"Authorization": "Bearer valid-access-token"},
        json=property_payload(),
    )
    assert create_response.status_code == 201

    response = client.get(
        "/api/v1/properties",
        headers={"Authorization": "Bearer valid-access-token"},
    )

    assert response.status_code == 200
    assert [item["display_name"] for item in response.json()["items"]] == ["Parramatta unit"]
    assert response.json()["pagination"] == {
        "page": 1,
        "page_size": 25,
        "total": 1,
        "total_pages": 1,
        "has_next": False,
        "has_previous": False,
    }
    assert property_store.created_for == OWNER_ID


def test_current_value_requires_as_of_date(client: TestClient) -> None:
    payload = property_payload()
    payload["current_value_as_of"] = None

    response = client.post(
        "/api/v1/properties",
        headers={"Authorization": "Bearer valid-access-token"},
        json=payload,
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_remaining_balance_cannot_exceed_original_loan(client: TestClient) -> None:
    payload = property_payload()
    payload["remaining_loan_balance"] = {"amount": "530000.00", "currency": "AUD"}

    response = client.post(
        "/api/v1/properties",
        headers={"Authorization": "Bearer valid-access-token"},
        json=payload,
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_request_cannot_supply_owner_identity(client: TestClient) -> None:
    payload = property_payload()
    payload["owner_user_id"] = str(uuid4())

    response = client.post(
        "/api/v1/properties",
        headers={"Authorization": "Bearer valid-access-token"},
        json=payload,
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"
