"""Validated API models for property income and expense items."""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum
from typing import Literal, Self
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from trackmyprops_backend.property_models import Money, PagePagination, PortfolioMoney


class CashFlowItemType(StrEnum):
    INCOME = "income"
    EXPENSE = "expense"


class CashFlowFrequency(StrEnum):
    WEEKLY = "weekly"
    FORTNIGHTLY = "fortnightly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUALLY = "annually"
    ONE_OFF = "one_off"


class CashFlowItemCreate(BaseModel):
    """Current definition of one owner-entered income or expense item."""

    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=100)
    amount: Money
    frequency: CashFlowFrequency
    start_date: date | None = None
    end_date: date | None = None
    occurrence_date: date | None = None

    @field_validator("name", mode="before")
    @classmethod
    def strip_name(cls, value: object) -> object:
        if not isinstance(value, str):
            return value
        return value.strip()

    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        if self.frequency is CashFlowFrequency.ONE_OFF:
            if self.occurrence_date is None:
                raise ValueError("One-off items require an occurrence date.")
            if self.start_date is not None or self.end_date is not None:
                raise ValueError("One-off items cannot have recurring dates.")
            return self

        if self.start_date is None:
            raise ValueError("Recurring items require a start date.")
        if self.occurrence_date is not None:
            raise ValueError("Recurring items cannot have an occurrence date.")
        if self.end_date is not None and self.end_date < self.start_date:
            raise ValueError("End date cannot be before start date.")
        return self


class CashFlowItem(CashFlowItemCreate):
    """Owner-visible income or expense item returned by the backend."""

    item_id: UUID
    property_id: UUID
    item_type: CashFlowItemType
    created_at: datetime
    updated_at: datetime


class CashFlowItemList(BaseModel):
    """Bounded collection of one property's income or expense items."""

    model_config = ConfigDict(extra="forbid")

    items: list[CashFlowItem]
    pagination: PagePagination


class PropertyCashFlowSummary(BaseModel):
    """Annualised property income and expense totals for one calendar year."""

    model_config = ConfigDict(extra="forbid")

    calculation_version: Literal["property-cash-flow-summary:1.0.0"] = (
        "property-cash-flow-summary:1.0.0"
    )
    property_id: UUID
    period: Literal["annual"] = "annual"
    period_year: int = Field(ge=2000, le=9999)
    total_income: PortfolioMoney
    total_expenses: PortfolioMoney
    income_item_count: int = Field(ge=0)
    expense_item_count: int = Field(ge=0)


_ANNUAL_MULTIPLIERS: dict[CashFlowFrequency, Decimal] = {
    CashFlowFrequency.WEEKLY: Decimal("52"),
    CashFlowFrequency.FORTNIGHTLY: Decimal("26"),
    CashFlowFrequency.MONTHLY: Decimal("12"),
    CashFlowFrequency.QUARTERLY: Decimal("4"),
    CashFlowFrequency.ANNUALLY: Decimal("1"),
}


def calculate_property_cash_flow_summary(
    property_id: UUID,
    items: list[CashFlowItem],
    period_year: int,
) -> PropertyCashFlowSummary:
    """Normalise recurring definitions and include one-offs in the selected year."""

    period_start = date(period_year, 1, 1)
    period_end = date(period_year, 12, 31)
    totals = {
        CashFlowItemType.INCOME: Decimal("0"),
        CashFlowItemType.EXPENSE: Decimal("0"),
    }
    counts = {
        CashFlowItemType.INCOME: 0,
        CashFlowItemType.EXPENSE: 0,
    }

    for item in items:
        if item.property_id != property_id:
            continue
        if item.frequency is CashFlowFrequency.ONE_OFF:
            if item.occurrence_date is None or item.occurrence_date.year != period_year:
                continue
            amount = item.amount.amount
        else:
            if item.start_date is None or item.start_date > period_end:
                continue
            if item.end_date is not None and item.end_date < period_start:
                continue
            amount = item.amount.amount * _ANNUAL_MULTIPLIERS[item.frequency]
        totals[item.item_type] += amount
        counts[item.item_type] += 1

    return PropertyCashFlowSummary(
        property_id=property_id,
        period_year=period_year,
        total_income=PortfolioMoney(
            amount=totals[CashFlowItemType.INCOME].quantize(Decimal("0.01"))
        ),
        total_expenses=PortfolioMoney(
            amount=totals[CashFlowItemType.EXPENSE].quantize(Decimal("0.01"))
        ),
        income_item_count=counts[CashFlowItemType.INCOME],
        expense_item_count=counts[CashFlowItemType.EXPENSE],
    )
