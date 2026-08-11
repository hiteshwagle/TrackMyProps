"""Validated API models for the owner property slice."""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum
from typing import Literal, Self
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class PropertyType(StrEnum):
    HOUSE = "house"
    APARTMENT_UNIT = "apartment_unit"
    TOWNHOUSE = "townhouse"
    VILLA = "villa"
    LAND = "land"
    COMMERCIAL = "commercial"
    OTHER = "other"


class RepaymentFrequency(StrEnum):
    WEEKLY = "weekly"
    FORTNIGHTLY = "fortnightly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUALLY = "annually"


class PropertyStatus(StrEnum):
    ACTIVE = "active"
    SOLD = "sold"
    ARCHIVED = "archived"


class PropertyListStatus(StrEnum):
    """Lifecycle groups exposed by the MVP property list."""

    ACTIVE = "active"
    ARCHIVED = "archived"


class Money(BaseModel):
    """AUD amount represented as a Decimal at the API boundary."""

    model_config = ConfigDict(extra="forbid")

    amount: Decimal = Field(gt=0, max_digits=16, decimal_places=2)
    currency: Literal["AUD"] = "AUD"


class NonNegativeMoney(BaseModel):
    """AUD amount that may be zero, used for a known zero loan balance."""

    model_config = ConfigDict(extra="forbid")

    amount: Decimal = Field(ge=0, max_digits=16, decimal_places=2)
    currency: Literal["AUD"] = "AUD"


class PortfolioMoney(BaseModel):
    """A portfolio total that may be positive, zero, or negative."""

    model_config = ConfigDict(extra="forbid")

    amount: Decimal = Field(max_digits=18, decimal_places=2)
    currency: Literal["AUD"] = "AUD"


class Rate(BaseModel):
    """Decimal rate paired with its user-facing percentage."""

    model_config = ConfigDict(extra="forbid")

    value: Decimal = Field(ge=0, le=1, max_digits=12, decimal_places=8)
    display_percent: Decimal = Field(ge=0, le=100, max_digits=10, decimal_places=6)

    @model_validator(mode="after")
    def values_match(self) -> Self:
        if self.value * 100 != self.display_percent:
            raise ValueError("Rate value and display percentage do not match.")
        return self


class PropertyCreate(BaseModel):
    """Fields accepted when an owner creates a currently owned property."""

    model_config = ConfigDict(extra="forbid")

    address_id: str | None = Field(default=None, min_length=1, max_length=100)
    display_name: str = Field(min_length=1, max_length=120)
    address_line_1: str = Field(min_length=1, max_length=200)
    address_line_2: str | None = Field(default=None, max_length=200)
    suburb: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=50)
    postcode: str = Field(pattern=r"^[0-9]{4}$")
    country: Literal["Australia"] = "Australia"
    property_type: PropertyType
    bedrooms: Decimal = Field(ge=0, max_digits=4, decimal_places=1)
    bathrooms: Decimal = Field(ge=0, max_digits=4, decimal_places=1)
    car_spaces: int = Field(ge=0, le=100)
    land_area_sqm: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    building_area_sqm: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    purchase_date: date
    purchase_price: Money
    current_value: Money | None = None
    current_value_as_of: date | None = None
    has_loan: bool | None = None
    original_loan_amount: Money | None = None
    remaining_loan_balance: NonNegativeMoney | None = None
    loan_balance_as_of: date | None = None
    annual_interest_rate: Rate | None = None
    repayment_amount: Money | None = None
    repayment_frequency: RepaymentFrequency | None = None
    next_repayment_date: date | None = None
    notes: str | None = Field(default=None, max_length=2000)

    @field_validator(
        "display_name",
        "address_id",
        "address_line_1",
        "address_line_2",
        "suburb",
        "state",
        "notes",
        mode="before",
    )
    @classmethod
    def strip_text(cls, value: object) -> object:
        if not isinstance(value, str):
            return value
        cleaned = value.strip()
        return cleaned or None

    @field_validator("bedrooms", "bathrooms")
    @classmethod
    def require_half_increment(cls, value: Decimal) -> Decimal:
        if value * 2 != (value * 2).to_integral_value():
            raise ValueError("Value must use whole or half increments.")
        return value

    @model_validator(mode="after")
    def validate_financial_details(self) -> Self:
        if (self.current_value is None) != (self.current_value_as_of is None):
            raise ValueError("Current value and its as-of date must be supplied together.")

        loan_details = (
            self.original_loan_amount,
            self.remaining_loan_balance,
            self.loan_balance_as_of,
            self.annual_interest_rate,
            self.repayment_amount,
            self.repayment_frequency,
            self.next_repayment_date,
        )
        if self.has_loan is None and any(value is not None for value in loan_details):
            raise ValueError("Select whether the property has a loan before adding loan details.")
        if self.has_loan is False and any(value is not None for value in loan_details):
            raise ValueError("Loan details must be empty when the property has no loan.")
        if self.has_loan is True:
            if any(value is None for value in loan_details):
                raise ValueError("All loan details are required when the property has a loan.")
            assert self.original_loan_amount is not None
            assert self.remaining_loan_balance is not None
            if self.remaining_loan_balance.amount > self.original_loan_amount.amount:
                raise ValueError("Remaining loan balance cannot exceed the original loan amount.")
        return self


class Property(PropertyCreate):
    """Owner property returned by the backend."""

    property_id: UUID
    owner_user_id: UUID
    status: PropertyStatus
    created_at: datetime
    updated_at: datetime


class PropertyStatusUpdate(BaseModel):
    """Allowed lifecycle transition for the archive workflow."""

    model_config = ConfigDict(extra="forbid")

    status: PropertyListStatus


class PortfolioSummary(BaseModel):
    """Authoritative totals for active, non-deleted owner properties."""

    model_config = ConfigDict(extra="forbid")

    calculation_version: Literal["portfolio-summary:1.0.0"] = "portfolio-summary:1.0.0"
    property_count: int = Field(ge=0)
    total_asset_value: PortfolioMoney | None
    asset_value_missing_count: int = Field(ge=0)
    total_remaining_loan: PortfolioMoney | None
    loan_balance_missing_count: int = Field(ge=0)
    total_equity: PortfolioMoney | None
    equity_missing_count: int = Field(ge=0)


class PagePagination(BaseModel):
    """Bounded page metadata for property collections."""

    model_config = ConfigDict(extra="forbid")

    page: int = Field(ge=1)
    page_size: int = Field(ge=1, le=100)
    total: int = Field(ge=0)
    total_pages: int = Field(ge=0)
    has_next: bool
    has_previous: bool


class PropertyList(BaseModel):
    """Current owner's properties for one lifecycle list."""

    model_config = ConfigDict(extra="forbid")

    items: list[Property]
    pagination: PagePagination
