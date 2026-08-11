from __future__ import annotations

from datetime import UTC, date, datetime
from decimal import Decimal
from uuid import UUID

from fastapi.testclient import TestClient

from tests.test_properties import (
    TEST_SETTINGS,
    FakeAuthGateway,
    FakePropertyStore,
    property_payload,
)
from trackmyprops_backend.cash_flow_models import (
    CashFlowFrequency,
    CashFlowItem,
    CashFlowItemCreate,
    CashFlowItemType,
    calculate_property_cash_flow_summary,
)
from trackmyprops_backend.cash_flow_store import CashFlowItemNotFoundError
from trackmyprops_backend.main import create_app
from trackmyprops_backend.property_models import Money

PROPERTY_ID = UUID("919d97fd-64cb-4eb6-8349-0fc0c78b1285")
ITEM_ID = UUID("5658d22d-dd92-4b45-bc19-740b03b4193b")


class FakeCashFlowStore:
    def __init__(self) -> None:
        self.access_token: str | None = None
        self.items: list[CashFlowItem] = []

    async def create(
        self,
        property_id: UUID,
        item_type: CashFlowItemType,
        access_token: str,
        item_input: CashFlowItemCreate,
    ) -> CashFlowItem:
        self.access_token = access_token
        item = CashFlowItem(
            **item_input.model_dump(),
            item_id=ITEM_ID,
            property_id=property_id,
            item_type=item_type,
            created_at=datetime(2026, 8, 11, tzinfo=UTC),
            updated_at=datetime(2026, 8, 11, tzinfo=UTC),
        )
        self.items.append(item)
        return item

    async def list_for_property(
        self,
        property_id: UUID,
        item_type: CashFlowItemType,
        access_token: str,
        page: int,
        page_size: int,
    ) -> tuple[list[CashFlowItem], int]:
        self.access_token = access_token
        items = [
            item
            for item in self.items
            if item.property_id == property_id and item.item_type is item_type
        ]
        return items[(page - 1) * page_size : page * page_size], len(items)

    async def delete(
        self,
        item_id: UUID,
        item_type: CashFlowItemType,
        access_token: str,
    ) -> None:
        self.access_token = access_token
        for item in self.items:
            if item.item_id == item_id and item.item_type is item_type:
                self.items.remove(item)
                return
        raise CashFlowItemNotFoundError


def recurring_payload() -> dict[str, object]:
    return {
        "name": "Rent",
        "amount": {"amount": "650.00", "currency": "AUD"},
        "frequency": "weekly",
        "start_date": "2026-08-11",
        "end_date": None,
        "occurrence_date": None,
    }


def test_owner_can_create_list_and_delete_income() -> None:
    store = FakeCashFlowStore()
    client = TestClient(create_app(TEST_SETTINGS, FakeAuthGateway(), FakePropertyStore(), store))
    headers = {"Authorization": "Bearer valid-access-token"}

    create_response = client.post(
        f"/api/v1/properties/{PROPERTY_ID}/income",
        headers=headers,
        json=recurring_payload(),
    )
    list_response = client.get(
        f"/api/v1/properties/{PROPERTY_ID}/income?page_size=100",
        headers=headers,
    )
    delete_response = client.delete(
        f"/api/v1/income/{ITEM_ID}",
        headers=headers,
    )

    assert create_response.status_code == 201
    assert create_response.json()["item_type"] == "income"
    assert create_response.json()["amount"] == {"amount": "650.00", "currency": "AUD"}
    assert [item["name"] for item in list_response.json()["items"]] == ["Rent"]
    assert list_response.json()["pagination"]["total"] == 1
    assert delete_response.status_code == 204
    assert store.items == []
    assert store.access_token == "valid-access-token"


def test_owner_can_create_one_off_expense() -> None:
    store = FakeCashFlowStore()
    client = TestClient(create_app(TEST_SETTINGS, FakeAuthGateway(), FakePropertyStore(), store))

    response = client.post(
        f"/api/v1/properties/{PROPERTY_ID}/expenses",
        headers={"Authorization": "Bearer valid-access-token"},
        json={
            "name": "Maintenance",
            "amount": {"amount": "250.00", "currency": "AUD"},
            "frequency": "one_off",
            "start_date": None,
            "end_date": None,
            "occurrence_date": "2026-08-11",
        },
    )

    assert response.status_code == 201
    assert response.json()["item_type"] == "expense"
    assert response.json()["occurrence_date"] == "2026-08-11"


def test_cash_flow_endpoints_require_authentication() -> None:
    client = TestClient(
        create_app(
            TEST_SETTINGS,
            FakeAuthGateway(),
            FakePropertyStore(),
            FakeCashFlowStore(),
        )
    )

    response = client.get(f"/api/v1/properties/{PROPERTY_ID}/income")

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTHENTICATION_REQUIRED"


def test_recurring_item_requires_start_date() -> None:
    client = TestClient(
        create_app(
            TEST_SETTINGS,
            FakeAuthGateway(),
            FakePropertyStore(),
            FakeCashFlowStore(),
        )
    )
    payload = recurring_payload()
    payload["start_date"] = None

    response = client.post(
        f"/api/v1/properties/{PROPERTY_ID}/income",
        headers={"Authorization": "Bearer valid-access-token"},
        json=payload,
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_unknown_item_delete_is_safe_not_found() -> None:
    client = TestClient(
        create_app(
            TEST_SETTINGS,
            FakeAuthGateway(),
            FakePropertyStore(),
            FakeCashFlowStore(),
        )
    )

    response = client.delete(
        f"/api/v1/expenses/{ITEM_ID}",
        headers={"Authorization": "Bearer valid-access-token"},
    )

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "CASH_FLOW_ITEM_NOT_FOUND"


def test_cash_flow_summary_normalises_recurring_and_selected_year_one_off_items() -> None:
    def item(
        *,
        item_type: CashFlowItemType,
        frequency: CashFlowFrequency,
        amount: str,
        start_date: date | None = None,
        occurrence_date: date | None = None,
    ) -> CashFlowItem:
        return CashFlowItem(
            item_id=ITEM_ID,
            property_id=PROPERTY_ID,
            item_type=item_type,
            name="Test item",
            amount=Money(amount=Decimal(amount)),
            frequency=frequency,
            start_date=start_date,
            end_date=None,
            occurrence_date=occurrence_date,
            created_at=datetime(2026, 8, 11, tzinfo=UTC),
            updated_at=datetime(2026, 8, 11, tzinfo=UTC),
        )

    summary = calculate_property_cash_flow_summary(
        PROPERTY_ID,
        [
            item(
                item_type=CashFlowItemType.INCOME,
                frequency=CashFlowFrequency.WEEKLY,
                amount="650.00",
                start_date=date(2026, 1, 1),
            ),
            item(
                item_type=CashFlowItemType.EXPENSE,
                frequency=CashFlowFrequency.MONTHLY,
                amount="100.00",
                start_date=date(2025, 1, 1),
            ),
            item(
                item_type=CashFlowItemType.EXPENSE,
                frequency=CashFlowFrequency.ONE_OFF,
                amount="250.00",
                occurrence_date=date(2026, 8, 11),
            ),
            item(
                item_type=CashFlowItemType.EXPENSE,
                frequency=CashFlowFrequency.ONE_OFF,
                amount="999.00",
                occurrence_date=date(2025, 8, 11),
            ),
        ],
        2026,
    )

    assert summary.total_income.amount == Decimal("33800.00")
    assert summary.total_expenses.amount == Decimal("1450.00")
    assert summary.income_item_count == 1
    assert summary.expense_item_count == 2


def test_owner_can_get_property_cash_flow_summary() -> None:
    property_store = FakePropertyStore()
    cash_flow_store = FakeCashFlowStore()
    client = TestClient(
        create_app(TEST_SETTINGS, FakeAuthGateway(), property_store, cash_flow_store)
    )
    headers = {"Authorization": "Bearer valid-access-token"}
    assert (
        client.post("/api/v1/properties", headers=headers, json=property_payload()).status_code
        == 201
    )
    assert (
        client.post(
            f"/api/v1/properties/{PROPERTY_ID}/income",
            headers=headers,
            json=recurring_payload(),
        ).status_code
        == 201
    )

    response = client.get(
        f"/api/v1/properties/{PROPERTY_ID}/cash-flow-summary?year=2026",
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json() == {
        "calculation_version": "property-cash-flow-summary:1.0.0",
        "property_id": str(PROPERTY_ID),
        "period": "annual",
        "period_year": 2026,
        "total_income": {"amount": "33800.00", "currency": "AUD"},
        "total_expenses": {"amount": "0.00", "currency": "AUD"},
        "income_item_count": 1,
        "expense_item_count": 0,
    }
