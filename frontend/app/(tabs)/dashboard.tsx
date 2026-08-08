import { StyleSheet, View } from 'react-native';

import { BodyText, Card, Message, Page, PageTitle } from '../../src/components/ui';
import { useAuth } from '../../src/features/auth/auth-context';
import { useCurrentUser } from '../../src/features/profile/current-user';
import { MetricCard } from '../../src/components/metric-card';

export default function DashboardScreen() {
  const { session } = useAuth();
  const currentUser = useCurrentUser(session);

  return (
    <Page>
      <PageTitle>Dashboard</PageTitle>
      <BodyText>
        {currentUser.data
          ? `Welcome, ${currentUser.data.name || currentUser.data.email}.`
          : 'A clear summary of your private property portfolio.'}
      </BodyText>
      {currentUser.isError ? <Message kind="error">{currentUser.error.message}</Message> : null}
      <View style={styles.metrics}>
        <MetricCard label="Properties" value="0" />
        <MetricCard label="Asset value" value="—" />
        <MetricCard label="Remaining loan" value="—" />
        <MetricCard label="Equity" value="—" />
      </View>
      <Card>
        <Message>Your portfolio is empty. Property entry is the next vertical slice.</Message>
      </Card>
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
