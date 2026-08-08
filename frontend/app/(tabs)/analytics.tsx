import { StyleSheet, View } from 'react-native';

import { BodyText, Message, Page, PageTitle } from '../../src/components/ui';
import { MetricCard } from '../../src/components/metric-card';

export default function AnalyticsScreen() {
  return (
    <Page>
      <PageTitle>Analytics</PageTitle>
      <BodyText>
        Annual portfolio metrics will appear after financial inputs are available.
      </BodyText>
      <Message>Metrics are unavailable—not zero—until properties have complete inputs.</Message>
      <View style={styles.metrics}>
        <MetricCard label="Total assets" value="—" />
        <MetricCard label="Total loans" value="—" />
        <MetricCard label="Total equity" value="—" />
        <MetricCard label="Net cash flow" value="—" />
      </View>
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
