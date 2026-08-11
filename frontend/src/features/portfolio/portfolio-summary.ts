import type { PortfolioSummary } from '../properties/property-api';

type Money = NonNullable<PortfolioSummary['total_asset_value']>;

export function formatAud(money: Money | null): string {
  if (!money) {
    return '—';
  }

  const negative = money.amount.startsWith('-');
  const unsigned = negative ? money.amount.slice(1) : money.amount;
  const [whole, fraction = ''] = unsigned.split('.');
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decimalPlaces = fraction.padEnd(2, '0').slice(0, 2);
  return `${negative ? '-' : ''}AUD ${groupedWhole}.${decimalPlaces}`;
}

export function formatSummaryMetric(money: Money | null, missingCount: number): string {
  const formatted = formatAud(money);
  return money && missingCount > 0 ? `${formatted} · Incomplete` : formatted;
}

export function missingSummaryMessage(summary: PortfolioSummary): string | null {
  const missingCounts = [
    summary.asset_value_missing_count,
    summary.loan_balance_missing_count,
    summary.equity_missing_count,
  ];
  return missingCounts.some((count) => count > 0)
    ? 'Incomplete totals use the available values. Missing information is not treated as zero.'
    : null;
}
