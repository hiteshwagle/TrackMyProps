# TrackMyProps Calculation Specification

## 1. Purpose

This document defines the authoritative calculation rules for TrackMyProps.

It covers:

- money and rounding;
- time-period conversion;
- rental income;
- expenses;
- gross and net yield;
- cash flow;
- equity;
- LVR;
- loan repayments;
- amortisation;
- interest-only loans;
- offset accounts;
- sale proceeds;
- refinance scenarios;
- debt-repayment scenarios;
- portfolio totals;
- diversification and concentration;
- performance snapshots;
- return calculations;
- scenario sensitivity;
- confidence and completeness;
- calculation versioning;
- required tests.

All authoritative calculations must be performed by deterministic backend code.

AI agents may explain results, compare scenarios, and identify implications, but they must not independently calculate authoritative financial values.

---

# 2. Calculation principles

1. Use `Decimal` for all authoritative monetary values.
2. Store money with explicit currency.
3. Store timestamps in UTC.
4. Use `Australia/Sydney` for user-facing default display and local schedules.
5. Use exact units.
6. Never infer missing values silently.
7. Show material assumptions.
8. Preserve input and calculation versions.
9. Separate annualised estimates from observed totals.
10. Separate realised returns from unrealised returns.
11. Separate property-level and portfolio-level calculations.
12. Separate pre-tax and post-tax values.
13. Do not provide post-tax results unless required inputs exist.
14. Round only at defined output boundaries.
15. All formulas require unit and boundary tests.

---

# 3. Numeric types

## 3.1 Money

Use:

```python
Decimal
```

Database recommendation:

```text
numeric(18,2)
```

JSON representation:

```json
{
  "amount": "1250.50",
  "currency": "AUD"
}
```

## 3.2 Rates and percentages

Use decimal form internally.

Examples:

```text
6.25% = 0.0625
72.4% = 0.724
```

Database recommendation:

```text
numeric(12,8)
```

## 3.3 Counts and periods

Use integers for:

- days;
- months;
- years;
- payments per year;
- bedroom count;
- property count.

---

# 4. Rounding policy

## 4.1 Currency

Round displayed currency to two decimal places using:

```text
ROUND_HALF_UP
```

Example:

```python
Decimal("123.455") → Decimal("123.46")
```

## 4.2 Percentages

Recommended display precision:

```text
2 decimal places
```

Example:

```text
0.72436 → 72.44%
```

Store higher precision internally.

## 4.3 Intermediate calculations

Do not round intermediate calculations unless:

- the financial product explicitly requires it;
- the provider contract defines it;
- legislation or accounting treatment requires it.

## 4.4 Final totals

Round final displayed monetary values to cents.

Preserve unrounded internal value where reproducibility requires it.

---

# 5. Sign conventions

Use consistent signs.

## Positive values

- income received;
- asset value;
- equity;
- positive cash flow;
- sale proceeds;
- tax refund where explicitly included.

## Negative values

- expenses;
- interest;
- principal repayments when represented as cash outflow;
- sale costs;
- tax payable;
- negative cash flow.

Stored source transactions may remain positive with a separate type, but calculation outputs must use one documented convention.

---

# 6. Frequency conversion

Supported frequencies:

```text
weekly
fortnightly
monthly
quarterly
half_yearly
annually
one_off
```

Annual multipliers:

| Frequency | Multiplier |
|---|---:|
| weekly | 52 |
| fortnightly | 26 |
| monthly | 12 |
| quarterly | 4 |
| half_yearly | 2 |
| annually | 1 |

Formula:

```text
annual_amount = periodic_amount × annual_multiplier
```

For exact observed totals, use actual dated transactions instead of frequency conversion.

---

# 7. Date-range annualisation

For an observed amount over a partial period:

```text
annualised_amount =
    observed_amount × days_in_year / observed_days
```

Use:

```text
365 or 366 according to the relevant annualisation policy
```

Preferred implementation:

```text
annualised_amount =
    observed_amount × 365.2425 / observed_days
```

For user-facing property calculations, a fixed 365-day basis may be simpler and should be documented.

Do not annualise periods too short to be meaningful without warning.

---

# 8. Property acquisition cost

## 8.1 Total acquisition cost

Formula:

```text
total_acquisition_cost =
    purchase_price
    + stamp_duty
    + conveyancing_fees
    + buyers_agent_fees
    + building_and_pest_fees
    + loan_application_fees
    + title_and_registration_fees
    + initial_repairs
    + other_acquisition_costs
```

Do not include deposit separately when it is part of the purchase price.

## 8.2 Cost base placeholder

TrackMyProps may store a preliminary cost-base estimate:

```text
estimated_cost_base =
    purchase_price
    + eligible_acquisition_costs
    + eligible_capital_improvements
    - eligible_adjustments
```

This must be labelled as an estimate unless tax treatment has been professionally verified.

---

# 9. Rental income

## 9.1 Scheduled annual rent

For weekly rent:

```text
scheduled_annual_rent = weekly_rent × 52
```

## 9.2 Effective annual rent

Formula:

```text
effective_annual_rent =
    scheduled_annual_rent
    - vacancy_loss
    - rent_free_periods
    - unrecovered_arrears
```

## 9.3 Vacancy loss

Method 1, known vacancy period:

```text
vacancy_loss =
    weekly_rent × vacancy_days / 7
```

Method 2, vacancy-rate assumption:

```text
vacancy_loss =
    scheduled_annual_rent × vacancy_rate
```

Do not apply both methods to the same period.

## 9.4 Other property income

Examples:

- parking;
- storage;
- solar feed-in;
- laundry;
- reimbursements;
- grants.

Formula:

```text
total_property_income =
    effective_rental_income
    + other_property_income
```

---

# 10. Expenses

## 10.1 Operating expenses

Potential categories:

- council rates;
- water rates;
- strata;
- insurance;
- property management;
- repairs;
- maintenance;
- gardening;
- pest control;
- smoke alarm service;
- land tax;
- accounting;
- legal;
- utilities;
- advertising;
- leasing fees;
- cleaning;
- depreciation schedule;
- other recurring operating costs.

## 10.2 Financing expenses

Potential categories:

- interest;
- loan fees;
- package fees;
- annual facility fees.

## 10.3 Capital expenses

Capital improvements must be separated from ordinary operating expenses.

Examples:

- major renovation;
- extension;
- structural upgrade;
- replacement that is capital in nature.

## 10.4 Annual operating expenses

Formula:

```text
annual_operating_expenses =
    sum(annualised_operating_expense_entries)
```

## 10.5 Total annual cash expenses

Formula:

```text
total_annual_cash_expenses =
    operating_expenses
    + financing_cash_outflows
    + other_cash_outflows
```

Whether principal repayment is included depends on the calculation.

---

# 11. Gross rental yield

## 11.1 Current-value gross yield

Formula:

```text
gross_yield_current =
    annual_gross_rent / current_property_value
```

Display:

```text
gross_yield_percent = gross_yield_current × 100
```

## 11.2 Purchase-price gross yield

Formula:

```text
gross_yield_purchase =
    annual_gross_rent / purchase_price
```

The UI must clearly label which denominator is used.

## 11.3 Validation

Return unavailable when:

- rent is missing;
- denominator is missing;
- denominator is zero or negative.

---

# 12. Net rental yield

Recommended formula:

```text
net_yield =
    net_operating_income / property_value
```

Where:

```text
net_operating_income =
    effective_property_income
    - operating_expenses_excluding_finance
```

Exclude:

- loan principal;
- loan interest;
- income tax;
- capital expenditure unless product definition explicitly includes it.

Provide an alternate cash yield only if clearly named.

---

# 13. Capitalisation rate

Where supported:

```text
capitalisation_rate =
    net_operating_income / property_value
```

This may equal the net yield under the same definition.

Do not expose both as different metrics unless definitions differ.

---

# 14. Property cash flow

## 14.1 Pre-finance operating cash flow

```text
pre_finance_operating_cash_flow =
    effective_property_income
    - operating_cash_expenses
```

## 14.2 Pre-tax cash flow after financing

```text
pre_tax_cash_flow =
    effective_property_income
    - operating_cash_expenses
    - interest_paid
    - principal_repaid
    - loan_fees
    - other_financing_cash_outflows
```

## 14.3 Cash flow excluding principal

Useful for comparing investment operating burden:

```text
cash_flow_excluding_principal =
    effective_property_income
    - operating_cash_expenses
    - interest_paid
    - loan_fees
```

Both metrics may be shown, but names must be explicit.

## 14.4 Monthly cash flow

```text
monthly_cash_flow =
    annual_cash_flow / 12
```

## 14.5 Weekly cash flow

```text
weekly_cash_flow =
    annual_cash_flow / 52
```

---

# 15. Net operating income

Formula:

```text
net_operating_income =
    effective_property_income
    - operating_expenses_excluding_finance
```

Do not subtract:

- loan principal;
- loan interest;
- income tax;
- depreciation;
- capital improvements;

unless the selected product definition explicitly states otherwise.

---

# 16. Equity

## 16.1 Gross equity

```text
gross_equity =
    current_property_value
    - secured_loan_balance
```

## 16.2 Net sale equity estimate

```text
net_sale_equity =
    estimated_sale_price
    - sale_costs
    - loan_discharge_amount
    - estimated_tax_payable
    - other_exit_costs
```

Only include estimated tax when inputs and approved calculation method exist.

## 16.3 Usable equity

Illustrative formula:

```text
maximum_debt_at_target_lvr =
    current_property_value × target_lvr
```

```text
usable_equity =
    maximum_debt_at_target_lvr
    - current_secured_debt
```

Rules:

- never describe usable equity as approved borrowing;
- clamp negative output to zero only when the metric is explicitly “available usable equity”;
- retain raw negative headroom separately if useful.

---

# 17. Loan-to-value ratio

## 17.1 Property LVR

```text
property_lvr =
    total_debt_secured_by_property
    / current_property_value
```

## 17.2 Effective LVR with offset

Do not automatically subtract offset from legal loan balance.

Optional net-debt LVR:

```text
net_debt_lvr =
    max(total_debt - offset_balance, 0)
    / current_property_value
```

Label distinctly.

## 17.3 Portfolio LVR

```text
portfolio_lvr =
    total_portfolio_debt
    / total_portfolio_value
```

## 17.4 Cross-collateralised facilities

When multiple properties secure one facility, calculate:

```text
facility_lvr =
    facility_balance
    / total_value_of_secured_properties
```

Do not assign the full facility balance to every secured property.

---

# 18. Loan repayment calculations

## 18.1 Principal and interest repayment

For:

```text
P = principal
r = periodic interest rate
n = total payment periods
```

Formula:

```text
payment =
    P × r × (1 + r)^n
    / ((1 + r)^n - 1)
```

Where:

```text
r = annual_interest_rate / payments_per_year
n = loan_term_years × payments_per_year
```

If `r = 0`:

```text
payment = P / n
```

## 18.2 Payment frequencies

Typical:

```text
monthly: 12
fortnightly: 26
weekly: 52
```

Actual lender practices may differ.

The UI should label results as estimates.

## 18.3 Interest-only repayment

```text
interest_only_payment =
    principal × annual_interest_rate
    / payments_per_year
```

## 18.4 Remaining-term repayment

Use:

- current principal;
- current rate;
- remaining periods.

Do not use original principal when calculating the current estimated repayment.

---

# 19. Amortisation schedule

For each payment period:

```text
interest_component =
    opening_balance × periodic_rate
```

```text
principal_component =
    scheduled_payment - interest_component
```

```text
closing_balance =
    opening_balance - principal_component
```

Adjust final payment to avoid negative closing balance.

Store or generate:

```text
period_number
payment_date
opening_balance
payment
interest
principal
closing_balance
```

---

# 20. Offset accounts

## 20.1 Interest-bearing balance estimate

```text
interest_calculation_balance =
    max(loan_balance - eligible_offset_balance, 0)
```

## 20.2 Estimated interest saving

```text
interest_without_offset =
    loan_balance × annual_rate
```

```text
interest_with_offset =
    interest_calculation_balance × annual_rate
```

```text
estimated_annual_offset_saving =
    interest_without_offset - interest_with_offset
```

This is a simplified annual estimate.

A precise result requires daily balances and lender calculation rules.

---

# 21. Redraw

Redraw must not be treated as cash in an offset account.

Track separately:

```text
available_redraw
loan_balance
```

A redraw withdrawal increases effective debt.

Do not reduce LVR by available redraw.

---

# 22. Interest expense estimate

Simple annual estimate:

```text
estimated_annual_interest =
    average_interest_calculation_balance
    × annual_interest_rate
```

For more accuracy, use the amortisation schedule and daily or periodic balances.

Do not multiply current balance by the rate and claim it is exact when balance changes materially during the year.

---

# 23. Debt service

## 23.1 Annual debt service

```text
annual_debt_service =
    sum(principal_payments + interest_payments + loan_fees)
```

## 23.2 Interest-only debt service

```text
annual_interest_only_debt_service =
    principal × annual_rate
    + annual_loan_fees
```

---

# 24. Debt service coverage ratio

Where used:

```text
dscr =
    net_operating_income / annual_debt_service
```

Alternate definitions may use interest-only debt service or finance-specific income definitions.

The selected definition must be explicit.

Return unavailable when debt service is zero.

---

# 25. Valuation selection

When multiple valuations exist, select current value by approved hierarchy.

Example default hierarchy:

1. certified valuation;
2. bank valuation;
3. recent agent appraisal;
4. approved automated valuation;
5. user estimate.

Selection must consider:

- valuation date;
- source quality;
- expiry threshold;
- confidence.

Do not silently replace user-selected valuation.

---

# 26. Capital growth

## 26.1 Absolute growth

```text
capital_growth_amount =
    current_value - comparison_value
```

## 26.2 Simple growth rate

```text
simple_growth_rate =
    current_value / comparison_value - 1
```

## 26.3 Compound annual growth rate

For `years > 0`:

```text
cagr =
    (current_value / starting_value)^(1 / years) - 1
```

Return unavailable for:

- starting value less than or equal to zero;
- non-positive period;
- missing values.

---

# 27. Rental growth

## 27.1 Simple rental growth

```text
rental_growth =
    current_weekly_rent / prior_weekly_rent - 1
```

## 27.2 Annualised rental CAGR

```text
rental_cagr =
    (current_rent / starting_rent)^(1 / years) - 1
```

---

# 28. Total return

## 28.1 Simplified total return

```text
total_return_amount =
    capital_growth_amount
    + cumulative_net_cash_flow
```

```text
total_return_rate =
    total_return_amount
    / total_initial_cash_invested
```

## 28.2 Total initial cash invested

May include:

```text
deposit
acquisition_costs
capital_improvements
additional_owner_contributions
```

Do not include borrowed purchase funds as owner cash invested.

## 28.3 Limitations

A proper investment return may require:

- exact dated cash flows;
- sale proceeds;
- tax;
- refinancing;
- distributions;
- capital contributions.

Label simplified return clearly.

---

# 29. Cash-on-cash return

```text
cash_on_cash_return =
    annual_pre_tax_cash_flow
    / total_initial_cash_invested
```

Clearly define whether principal repayment is included in cash flow.

Return unavailable when initial cash invested is zero or negative.

---

# 30. Internal rate of return

IRR should use dated cash flows when possible.

Use XIRR-style calculation:

```text
NPV(rate) =
    Σ cash_flow_i / (1 + rate)^((date_i - date_0) / 365)
```

Find rate where:

```text
NPV(rate) = 0
```

Requirements:

- at least one positive and one negative cash flow;
- convergent numerical method;
- clear failure handling;
- no misleading result when multiple roots may exist.

IRR should not be part of initial MVP unless adequately tested.

---

# 31. Sale proceeds

## 31.1 Gross sale proceeds

```text
gross_sale_proceeds =
    estimated_sale_price
```

## 31.2 Sale costs

Potential components:

```text
agent_commission
marketing
conveyancing
auction_costs
mortgage_discharge_fee
repairs_or_preparation
other_sale_costs
```

Agent commission may be:

```text
agent_commission =
    sale_price × commission_rate
```

or tiered according to entered terms.

## 31.3 Net proceeds before tax

```text
net_proceeds_before_tax =
    sale_price
    - sale_costs
    - loan_discharge_amount
```

## 31.4 Net proceeds after tax

```text
net_proceeds_after_tax =
    net_proceeds_before_tax
    - estimated_tax_payable
```

Only calculate tax when a validated tax module and required inputs exist.

Otherwise show:

```text
tax_not_included
```

---

# 32. Loan discharge amount

Estimated:

```text
loan_discharge_amount =
    current_balance
    + accrued_interest
    + discharge_fees
    + break_costs
    - applicable_credits
```

If break costs are unknown, expose them as missing.

Do not assume fixed-rate break cost is zero.

---

# 33. Refinance scenario

## 33.1 New loan amount

```text
new_loan_amount =
    refinanced_balance
    + capitalised_refinance_costs
    + additional_cash_out
```

## 33.2 Refinance costs

Potential:

```text
application_fee
valuation_fee
legal_fee
discharge_fee
government_fee
broker_fee
break_cost
lenders_mortgage_insurance
```

## 33.3 Monthly repayment difference

```text
monthly_repayment_change =
    new_monthly_repayment
    - current_monthly_repayment
```

## 33.4 Annual cash flow impact

```text
annual_cash_flow_change =
    -(new_annual_debt_service - current_annual_debt_service)
    - annualised_new_fees
    + annualised_removed_fees
```

## 33.5 Break-even period

```text
break_even_months =
    upfront_refinance_cost
    / monthly_saving
```

Only when monthly saving is positive.

---

# 34. Debt-repayment scenario

If net sale proceeds are applied to a target loan:

```text
target_loan_reduction =
    min(net_available_proceeds, target_loan_balance)
```

```text
remaining_target_loan_balance =
    target_loan_balance - target_loan_reduction
```

```text
remaining_cash =
    net_available_proceeds - target_loan_reduction
```

Then recalculate:

- repayment;
- annual interest;
- cash flow;
- LVR;
- portfolio debt;
- portfolio equity.

---

# 35. Hold scenario

A hold scenario should include assumptions for:

```text
property value growth
rent growth
expense growth
interest rate
vacancy
holding period
capital expenditure
```

For each future period:

```text
future_value_t =
    value_(t-1) × (1 + growth_rate_t)
```

```text
future_rent_t =
    rent_(t-1) × (1 + rent_growth_rate_t)
```

```text
future_expenses_t =
    expenses_(t-1) × (1 + expense_growth_rate_t)
```

Loan balance should come from the amortisation schedule.

---

# 36. Purchase scenario

Calculate:

```text
total_cash_required =
    deposit
    + acquisition_costs
    + initial_repairs
    + liquidity_buffer
```

```text
new_loan_amount =
    purchase_price - deposit + capitalised_fees
```

```text
post_purchase_portfolio_debt =
    existing_debt + new_loan_amount
```

```text
post_purchase_portfolio_value =
    existing_value + purchase_price_or_initial_valuation
```

Recalculate:

- portfolio LVR;
- cash flow;
- concentration;
- liquidity;
- repayment;
- debt service.

Do not claim finance eligibility.

---

# 37. Interest-rate sensitivity

For each test rate:

```text
scenario_rate =
    current_rate + rate_change
```

Recalculate repayment and annual interest.

Suggested sensitivity points:

```text
-1.00%
-0.50%
current
+0.50%
+1.00%
+2.00%
```

Do not allow negative interest rates unless product policy explicitly permits them.

---

# 38. Vacancy sensitivity

Suggested vacancy assumptions:

```text
0 weeks
2 weeks
4 weeks
6 weeks
8 weeks
```

Formula:

```text
vacancy_loss =
    weekly_rent × vacancy_weeks
```

Recalculate effective income and cash flow.

---

# 39. Sale-price sensitivity

Suggested values:

```text
-10%
-5%
base
+5%
+10%
```

For each:

- sale proceeds;
- loan discharge;
- remaining cash;
- tax placeholder;
- target debt reduction;
- revised portfolio metrics.

---

# 40. Portfolio totals

## 40.1 Total value

```text
portfolio_value =
    sum(current_property_values)
```

## 40.2 Total debt

```text
portfolio_debt =
    sum(unique_loan_or_facility_balances)
```

Avoid double counting cross-collateralised facilities.

## 40.3 Total equity

```text
portfolio_equity =
    portfolio_value - portfolio_debt
```

## 40.4 Total income

```text
portfolio_income =
    sum(property_effective_income)
```

## 40.5 Total expenses

```text
portfolio_expenses =
    sum(property_cash_expenses)
```

## 40.6 Portfolio cash flow

```text
portfolio_cash_flow =
    portfolio_income - portfolio_expenses
```

---

# 41. Weighted portfolio yield

Recommended:

```text
portfolio_gross_yield =
    total_annual_gross_rent
    / total_property_value
```

```text
portfolio_net_yield =
    total_net_operating_income
    / total_property_value
```

Do not average property yield percentages arithmetically unless explicitly requested.

---

# 42. Property portfolio contribution

## 42.1 Value contribution

```text
value_contribution =
    property_value / portfolio_value
```

## 42.2 Equity contribution

```text
equity_contribution =
    property_equity / portfolio_equity
```

## 42.3 Cash-flow contribution

```text
cash_flow_contribution =
    property_cash_flow / portfolio_cash_flow
```

Cash-flow contribution can be misleading when portfolio cash flow is near zero or negative. Provide absolute contribution where necessary.

---

# 43. Concentration metrics

## 43.1 Largest-property concentration

```text
largest_property_concentration =
    max(property_values) / portfolio_value
```

## 43.2 Geographic concentration

```text
geography_concentration =
    value_in_geography / portfolio_value
```

## 43.3 Property-type concentration

```text
property_type_concentration =
    value_in_property_type / portfolio_value
```

## 43.4 Herfindahl-Hirschman Index

For weights `w_i`:

```text
hhi = Σ w_i^2
```

Use weights as decimals summing to 1.

Higher values indicate more concentration.

Do not present HHI as a universal risk score without interpretation.

---

# 44. Diversification score

A diversification score may combine:

- geography;
- property type;
- tenant or income source;
- lender;
- debt maturity;
- value concentration.

Any combined score must have:

- documented weights;
- methodology version;
- bounded output;
- validation;
- explanation.

Example conceptual form:

```text
diversification_score =
    100 × (
        geography_component × weight_g
        + property_type_component × weight_p
        + lender_component × weight_l
        + maturity_component × weight_m
    )
```

This is not authoritative until methodology is approved.

---

# 45. Liquidity buffer

```text
liquidity_months =
    available_liquid_cash
    / average_monthly_property_cash_outflow
```

Inputs may include:

- offset cash available to household;
- dedicated reserve;
- approved cash balance.

Do not include unavailable redraw or illiquid equity as cash.

---

# 46. Portfolio health score

A portfolio health score must not be implemented as an unexplained AI score.

If used, it must be deterministic and versioned.

Potential components:

- cash-flow resilience;
- LVR;
- liquidity;
- concentration;
- lease stability;
- interest-rate exposure;
- data completeness.

Requirements:

- documented formula;
- weights;
- thresholds;
- missing-data treatment;
- sensitivity testing;
- version.

---

# 47. Performance against benchmark

For metric `M`:

```text
absolute_variance =
    property_metric - benchmark_metric
```

```text
relative_variance =
    property_metric / benchmark_metric - 1
```

Use only when units and periods match.

Do not compare:

- weekly rent to monthly rent;
- one-bedroom benchmark to three-bedroom property;
- different time periods;
- incompatible geography.

---

# 48. Underperformance detection

Underperformance must consider multiple dimensions.

Potential signals:

- negative cash flow versus strategy;
- rent growth below benchmark;
- value growth below benchmark;
- elevated vacancy;
- expense growth;
- high leverage;
- low liquidity;
- poor risk-adjusted contribution.

Do not classify a property as underperforming from one metric alone unless explicitly designed.

---

# 49. Data completeness score

For required fields with weights `w_i`:

```text
completeness_score =
    sum(weight of present valid fields)
    / sum(all required field weights)
```

Use separate profiles for:

- basic property;
- financial analysis;
- sale scenario;
- refinance scenario;
- prediction;
- EOI.

Do not treat a present but stale or invalid field as fully complete.

---

# 50. Calculation confidence

Calculation confidence should be deterministic.

Potential factors:

- input completeness;
- input freshness;
- source quality;
- valuation confidence;
- assumption count;
- unresolved conflicts.

Example conceptual score:

```text
confidence =
    completeness_component
    × freshness_component
    × source_quality_component
    × conflict_component
```

The exact formula must be versioned.

Do not imply confidence equals probability of investment success.

---

# 51. Missing data rules

Return a result only when minimum required inputs exist.

Examples:

## Gross yield requires

- annual rent;
- property value or purchase price.

## LVR requires

- debt;
- value.

## Sale proceeds requires

- sale price;
- sale costs or explicit defaults;
- loan balance.

## Refinance comparison requires

- current loan;
- proposed loan;
- rates;
- term;
- fees.

Missing material inputs must be listed.

---

# 52. Default assumptions

Defaults must be explicit and configurable.

Examples:

- 52 weeks per year;
- 12 months per year;
- no tax included;
- no sale break cost unless supplied;
- no capital growth unless supplied;
- no rental growth unless supplied;
- no vacancy unless supplied or selected;
- AUD currency;
- Australia/Sydney display timezone.

Do not silently apply market assumptions.

---

# 53. Tax calculations

Tax calculations are excluded from the initial authoritative engine unless separately specified and professionally reviewed.

Potential future modules:

- deductible interest;
- operating expense deductions;
- depreciation;
- capital gains tax;
- ownership allocation;
- land tax;
- GST where relevant.

Until then:

```text
tax_not_included = true
```

AI must not invent tax outcomes.

---

# 54. Inflation-adjusted values

Where supported:

```text
real_value =
    nominal_value / inflation_index_ratio
```

For return:

```text
real_return =
    (1 + nominal_return) / (1 + inflation_rate) - 1
```

The inflation index and period must be explicit.

---

# 55. Calculation versioning

Every result must record:

```text
calculation_version
input_version
calculated_at
```

Scenario outputs should also record:

```text
assumption_set_version
valuation_reference
loan_reference
dataset_versions
```

Historical results must remain reproducible.

---

# 56. Calculation API response

Example:

```json
{
  "metric": "property_lvr",
  "value": {
    "decimal": "0.705882",
    "display_percent": "70.59"
  },
  "inputs": {
    "property_value": {
      "amount": "850000.00",
      "currency": "AUD"
    },
    "secured_debt": {
      "amount": "600000.00",
      "currency": "AUD"
    }
  },
  "assumptions": [],
  "calculation_version": "1.0.0",
  "calculated_at": "2026-08-02T10:00:00Z"
}
```

---

# 57. Error handling

Potential errors:

```text
MISSING_REQUIRED_INPUT
INVALID_CURRENCY
INVALID_PERIOD
NON_POSITIVE_DENOMINATOR
UNSUPPORTED_FREQUENCY
NON_CONVERGENT_IRR
INCONSISTENT_LOAN_SECURITY
VALUATION_TOO_STALE
SCENARIO_INPUT_CONFLICT
```

Do not return `0` for unavailable results.

Use `null` plus status or a controlled error.

---

# 58. Required unit tests

Every calculation requires tests for:

- standard case;
- zero;
- negative invalid input;
- missing input;
- very large amount;
- decimal precision;
- rounding;
- boundary dates;
- alternate frequencies;
- currency mismatch;
- stale inputs where relevant.

---

# 59. Financial formula test cases

## Gross yield

```text
weekly rent = 600
annual rent = 31,200
value = 800,000
gross yield = 3.9%
```

## Equity

```text
value = 800,000
debt = 500,000
equity = 300,000
```

## LVR

```text
debt = 500,000
value = 800,000
LVR = 62.5%
```

## Vacancy loss

```text
weekly rent = 600
vacancy = 4 weeks
loss = 2,400
```

## Sale proceeds before tax

```text
sale price = 900,000
sale costs = 25,000
loan discharge = 550,000
net proceeds = 325,000
```

These examples are illustrative test fixtures, not market assumptions.

---

# 60. Loan test cases

Test:

- zero interest;
- monthly payment;
- fortnightly payment;
- weekly payment;
- interest-only;
- transition from interest-only to principal and interest;
- offset greater than loan balance;
- final payment adjustment;
- fixed-rate break cost missing;
- remaining term of one payment;
- high precision rate.

---

# 61. Portfolio test cases

Test:

- one property;
- multiple properties;
- one negative cash-flow property;
- cross-collateralised loan;
- shared facility;
- zero portfolio value;
- portfolio cash flow near zero;
- multiple currencies rejected or converted through explicit policy;
- concentration;
- benchmark period mismatch.

---

# 62. Scenario test cases

Test:

- hold;
- sell;
- refinance;
- sell and repay another loan;
- sale proceeds exceed target debt;
- sale proceeds below debt;
- negative equity;
- positive and negative monthly savings;
- break-even unavailable;
- tax excluded;
- missing break cost;
- sensitivity grids.

---

# 63. Property-based testing

Use property-based testing where valuable.

Examples:

- LVR is non-negative for non-negative debt and positive value;
- equity equals value minus debt;
- amortisation closing balance never increases without additional borrowing;
- total principal paid approximates original principal;
- sale proceeds decrease as costs increase;
- portfolio total equals sum of unique components.

---

# 64. Golden calculation fixtures

Maintain versioned fixtures:

```text
tests/fixtures/calculations/
├── yields.json
├── cash-flow.json
├── loans.json
├── amortisation.json
├── sale-scenarios.json
├── refinance-scenarios.json
├── portfolio.json
└── sensitivity.json
```

Fixtures must be synthetic.

---

# 65. Calculation audit

For consequential scenario results, store:

```text
input snapshot
assumptions
formula identifiers
calculation version
output
timestamp
actor
trace ID
```

This supports reproduction and user trust.

---

# 66. Calculation documentation

For every metric document:

```text
name
purpose
formula
inputs
units
assumptions
excluded items
rounding
minimum data
limitations
examples
version
tests
```

---

# 67. Codex rules

Codex must:

1. implement calculations in backend domain modules;
2. use `Decimal`;
3. centralise rounding;
4. centralise frequency conversion;
5. create typed inputs and outputs;
6. validate currencies and units;
7. never use an LLM for authoritative arithmetic;
8. record calculation versions;
9. add comprehensive unit tests;
10. add scenario integration tests;
11. document assumptions;
12. return unavailable rather than fabricated zero;
13. avoid double counting loans or facilities;
14. distinguish cash flow definitions;
15. preserve historical reproducibility.

---

# 68. Definition of done

The calculation engine is complete when:

- every production metric has a documented formula;
- money uses Decimal;
- units and frequencies are explicit;
- rounding is consistent;
- gross and net yield are distinguished;
- cash-flow variants are named;
- equity and LVR handle shared facilities;
- loan repayment and amortisation are tested;
- offset and redraw are distinct;
- sale and refinance assumptions are visible;
- tax exclusion is explicit;
- portfolio totals avoid double counting;
- scenario sensitivity works;
- calculation versions are persisted;
- errors are controlled;
- unit and integration tests pass;
- AI agents consume calculation outputs rather than reproducing formulas.

---

# 69. Final calculation principle

For every TrackMyProps number, the system must be able to answer:

```text
What formula produced it?
Which inputs were used?
What units were used?
What assumptions were applied?
How was it rounded?
Which calculation version produced it?
Can it be reproduced exactly?
```

If those questions cannot be answered, the number is not authoritative.
