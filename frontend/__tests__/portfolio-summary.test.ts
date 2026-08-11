import {
  formatAud,
  formatSummaryMetric,
  missingSummaryMessage,
} from '../src/features/portfolio/portfolio-summary';

describe('portfolio summary presentation', () => {
  it('formats decimal strings without binary floating-point conversion', () => {
    expect(formatAud({ amount: '1234567.8', currency: 'AUD' })).toBe('AUD 1,234,567.80');
    expect(formatAud({ amount: '-250.00', currency: 'AUD' })).toBe('-AUD 250.00');
  });

  it('marks known partial totals as incomplete', () => {
    expect(formatSummaryMetric({ amount: '700000.00', currency: 'AUD' }, 1)).toBe(
      'AUD 700,000.00 · Incomplete',
    );
    expect(formatSummaryMetric(null, 1)).toBe('—');
  });

  it('explains missing portfolio inputs', () => {
    expect(
      missingSummaryMessage({
        asset_value_missing_count: 1,
        calculation_version: 'portfolio-summary:1.0.0',
        equity_missing_count: 1,
        loan_balance_missing_count: 0,
        property_count: 2,
        total_asset_value: { amount: '700000.00', currency: 'AUD' },
        total_equity: { amount: '210000.00', currency: 'AUD' },
        total_remaining_loan: { amount: '490000.00', currency: 'AUD' },
      }),
    ).toContain('Missing information is not treated as zero');
  });
});
