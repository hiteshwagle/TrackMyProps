import { z } from 'zod';
const money = z
  .string()
  .regex(/^\d{1,13}(\.\d{1,2})?$/, 'Enter a positive AUD amount with up to 2 decimal places.');
const positiveMoney = money.refine((v) => cents(v) > 0n, 'Amount must be greater than zero.');
const optionalMoney = money.nullable();
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const d = new Date(v + 'T00:00:00Z');
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }, 'Choose a valid date.');
const optionalDate = date.nullable();
const count = z
  .number()
  .min(0)
  .max(100)
  .refine((v) => Number.isInteger(v * 2), 'Use whole or half values.');
export const propertySchema = z
  .object({
    display_name: z.string().trim().min(1).max(120),
    address_line_1: z.string().trim().min(1).max(200),
    address_line_2: z.string().trim().max(200).default(''),
    suburb: z.string().trim().min(1).max(100),
    state: z.enum(['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT']),
    postcode: z.string().regex(/^\d{4}$/),
    property_type: z.enum([
      'house',
      'apartment_unit',
      'townhouse',
      'villa',
      'land',
      'commercial',
      'other',
    ]),
    bedrooms: count,
    bathrooms: count,
    car_spaces: z.number().int().min(0).max(100),
    land_area_sqm: z.number().positive().max(100000000),
    building_area_sqm: z.number().positive().max(10000000),
    purchase_date: date,
    purchase_price: positiveMoney,
    current_value: positiveMoney.nullable(),
    current_value_as_of: optionalDate,
    has_loan: z.boolean().nullable(),
    original_loan_amount: positiveMoney.nullable(),
    remaining_loan_balance: optionalMoney,
    loan_balance_as_of: optionalDate,
    annual_interest_rate: z
      .string()
      .regex(/^\d{1,3}(\.\d{1,6})?$/)
      .refine((v) => Number(v) <= 100)
      .nullable(),
    repayment_amount: positiveMoney.nullable(),
    repayment_frequency: z
      .enum(['weekly', 'fortnightly', 'monthly', 'quarterly', 'annually'])
      .nullable(),
    next_repayment_date: optionalDate,
    notes: z.string().trim().max(2000).default(''),
  })
  .strict()
  .superRefine((v, ctx) => {
    if ((v.current_value === null) !== (v.current_value_as_of === null))
      ctx.addIssue({
        code: 'custom',
        message: 'Current value and its as-of date must be entered together.',
      });
    const loan = [
      v.original_loan_amount,
      v.remaining_loan_balance,
      v.loan_balance_as_of,
      v.annual_interest_rate,
      v.repayment_amount,
      v.repayment_frequency,
      v.next_repayment_date,
    ];
    if (v.has_loan === true && loan.some((x) => x === null))
      ctx.addIssue({
        code: 'custom',
        message: 'Complete all loan details, or select no loan / not recorded.',
      });
    if (v.has_loan !== true && loan.some((x) => x !== null))
      ctx.addIssue({ code: 'custom', message: 'Loan fields require a recorded loan.' });
    if (
      v.original_loan_amount &&
      v.remaining_loan_balance &&
      cents(v.remaining_loan_balance) > cents(v.original_loan_amount)
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Remaining balance cannot exceed the original loan in this basic loan model.',
      });
  });
export const itemSchema = z
  .object({
    property_id: z.string().uuid(),
    name: z.string().trim().min(1).max(100),
    type: z.enum(['income', 'expense']),
    amount: positiveMoney,
    frequency: z.enum(['weekly', 'fortnightly', 'monthly', 'quarterly', 'annually', 'one_off']),
    start_date: optionalDate,
    end_date: optionalDate,
    occurrence_date: optionalDate,
  })
  .strict()
  .superRefine((v, ctx) => {
    if (
      v.frequency === 'one_off'
        ? !v.occurrence_date || v.start_date || v.end_date
        : !v.start_date || v.occurrence_date
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Recurring entries need a start date; one-off entries need an occurrence date.',
      });
    if (v.start_date && v.end_date && v.end_date < v.start_date)
      ctx.addIssue({ code: 'custom', message: 'End date must follow the start date.' });
  });
export type PropertyInput = z.infer<typeof propertySchema>;
export type Property = PropertyInput & {
  id: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
  photo_id?: string | null;
};
export type CashFlowItem = z.infer<typeof itemSchema> & { id: string };
export function cents(v: string): bigint {
  const [a, b = ''] = v.split('.');
  return BigInt(a) * 100n + BigInt(b.padEnd(2, '0'));
}
export function decimal(v: bigint): string {
  const sign = v < 0n ? '-' : '';
  const a = v < 0n ? -v : v;
  return `${sign}${a / 100n}.${String(a % 100n).padStart(2, '0')}`;
}
export function monthly(v: bigint): bigint {
  const negative = v < 0n;
  const a = negative ? -v : v;
  const out = (a + 6n) / 12n;
  return negative ? -out : out;
}
const multipliers = { weekly: 52n, fortnightly: 26n, monthly: 12n, quarterly: 4n, annually: 1n };
export function summarise(properties: Property[], items: CashFlowItem[], year: number) {
  const active = properties.filter((p) => p.status === 'active');
  const ids = new Set(active.map((p) => p.id));
  let assets = 0n,
    debt = 0n,
    equity = 0n,
    income = 0n,
    expenses = 0n,
    knownValues = 0,
    knownLoans = 0,
    knownEquity = 0;
  const breakdown = active.map((p) => {
    const value = p.current_value === null ? null : cents(p.current_value);
    const balance =
      p.has_loan === false
        ? 0n
        : p.remaining_loan_balance === null
          ? null
          : cents(p.remaining_loan_balance);
    if (value !== null) {
      assets += value;
      knownValues++;
    }
    if (balance !== null) {
      debt += balance;
      knownLoans++;
    }
    if (value !== null && balance !== null) {
      equity += value - balance;
      knownEquity++;
    }
    let pi = 0n,
      pe = 0n;
    for (const item of items.filter((i) => i.property_id === p.id && ids.has(i.property_id))) {
      let amount = 0n;
      if (item.frequency === 'one_off') {
        if (item.occurrence_date?.startsWith(String(year) + '-')) amount = cents(item.amount);
      } else if (
        item.start_date &&
        item.start_date <= `${year}-12-31` &&
        (!item.end_date || item.end_date >= `${year}-01-01`)
      )
        amount = cents(item.amount) * multipliers[item.frequency];
      if (item.type === 'income') pi += amount;
      else pe += amount;
    }
    income += pi;
    expenses += pe;
    return {
      id: p.id,
      name: p.display_name,
      value: value === null ? null : decimal(value),
      debt: balance === null ? null : decimal(balance),
      income: decimal(pi),
      expenses: decimal(pe),
      net: decimal(pi - pe),
    };
  });
  return {
    calculation_version: 'portfolio:sites-1.0.0',
    year,
    currency: 'AUD',
    property_count: active.length,
    assets: knownValues ? decimal(assets) : null,
    debt: knownLoans ? decimal(debt) : null,
    equity: knownEquity ? decimal(equity) : null,
    missing_values: active.length - knownValues,
    missing_loans: active.length - knownLoans,
    missing_equity: active.length - knownEquity,
    income: decimal(income),
    expenses: decimal(expenses),
    net: decimal(income - expenses),
    monthly_net: decimal(monthly(income - expenses)),
    breakdown,
    assumptions: [
      'Annualised recurring definitions; partial-year recurring entries are not prorated.',
      'One-off entries are included only in the selected calendar year.',
      'Monthly view is the annual total divided by 12, rounded half up.',
      'Only entered income and expenses are included; loan repayments, tax, vacancy and other costs are not automatically deducted.',
    ],
  };
}
export type Summary = ReturnType<typeof summarise>;
