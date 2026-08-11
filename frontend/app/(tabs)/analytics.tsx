import { StyleSheet, View } from 'react-native';

import { BodyText, Message, Page, PageTitle } from '../../src/components/ui';
import { MetricCard } from '../../src/components/metric-card';
import { useAuth } from '../../src/features/auth/auth-context';
import {
  formatSummaryMetric,
  missingSummaryMessage,
} from '../../src/features/portfolio/portfolio-summary';
import { usePortfolioSummary } from '../../src/features/properties/property-api';

export default function AnalyticsScreen() {
  const { session } = useAuth();
  const portfolio = usePortfolioSummary(session);
  const summary = portfolio.data;
  const summaryMessage = summary ? missingSummaryMessage(summary) : null;

  return (
    <Page>
      <PageTitle>Analytics</PageTitle>
      <BodyText>Current totals across active properties using owner-provided values.</BodyText>
      {portfolio.isPending ? <Message>Loading portfolio analytics…</Message> : null}
      {portfolio.isError ? <Message kind="error">{portfolio.error.message}</Message> : null}
      {summaryMessage ? <Message>{summaryMessage}</Message> : null}
      <View style={styles.metrics}>
        <MetricCard
          label="Total properties"
          value={summary ? String(summary.property_count) : '—'}
        />
        <MetricCard
          label="Total assets"
          value={
            summary
              ? formatSummaryMetric(summary.total_asset_value, summary.asset_value_missing_count)
              : '—'
          }
        />
        <MetricCard
          label="Total loans"
          value={
            summary
              ? formatSummaryMetric(
                  summary.total_remaining_loan,
                  summary.loan_balance_missing_count,
                )
              : '—'
          }
        />
        <MetricCard
          label="Total equity"
          value={
            summary ? formatSummaryMetric(summary.total_equity, summary.equity_missing_count) : '—'
          }
        />
        <MetricCard label="Net cash flow" value="—" />
      </View>
      <Message>
        Income and expense analytics will appear after those line items are implemented.
      </Message>
    </Page>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
});
