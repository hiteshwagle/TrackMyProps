import { StyleSheet, Text, View } from 'react-native';

import { colours } from '../theme';

type MetricCardProps = {
  label: string;
  value: string;
};

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colours.card,
    borderColor: colours.border,
    borderRadius: 18,
    borderWidth: 1,
    flexBasis: 190,
    flexGrow: 1,
    gap: 8,
    minHeight: 112,
    padding: 18,
  },
  label: {
    color: colours.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    color: colours.text,
    fontSize: 26,
    fontWeight: '700',
  },
});
