import { StyleSheet, View } from 'react-native';

import { BodyText, Card, Message, Page, PageTitle } from '../../src/components/ui';
import { useAuth } from '../../src/features/auth/auth-context';
import { useCurrentUser } from '../../src/features/profile/current-user';
import { MetricCard } from '../../src/components/metric-card';
import {
  formatSummaryMetric,
  missingSummaryMessage,
} from '../../src/features/portfolio/portfolio-summary';
import { usePortfolioSummary } from '../../src/features/properties/property-api';

export default function DashboardScreen() {
  const { session } = useAuth();
  const currentUser = useCurrentUser(session);
  const portfolio = usePortfolioSummary(session);
  const summary = portfolio.data;
  const summaryMessage = summary ? missingSummaryMessage(summary) : null;

  return (
    <Page>
      <PageTitle>Dashboard</PageTitle>
      <BodyText>
        {currentUser.data
          ? `Welcome, ${currentUser.data.name || currentUser.data.email}.`
          : 'A clear summary of your private property portfolio.'}
      </BodyText>
      {currentUser.isError ? <Message kind="error">{currentUser.error.message}</Message> : null}
      {portfolio.isError ? <Message kind="error">{portfolio.error.message}</Message> : null}
      <View style={styles.metrics}>
        <MetricCard label="Properties" value={summary ? String(summary.property_count) : '—'} />
        <MetricCard
          label="Asset value"
          value={
            summary
              ? formatSummaryMetric(summary.total_asset_value, summary.asset_value_missing_count)
              : '—'
          }
        />
        <MetricCard
          label="Remaining loan"
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
          label="Equity"
          value={
            summary ? formatSummaryMetric(summary.total_equity, summary.equity_missing_count) : '—'
          }
        />
      </View>
      {portfolio.isPending ? <Message>Loading portfolio totals…</Message> : null}
      {summary?.property_count === 0 ? (
        <Card>
          <Message>Your portfolio is empty. Add a property from the Properties tab.</Message>
        </Card>
      ) : null}
      {summaryMessage ? <Message>{summaryMessage}</Message> : null}
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
