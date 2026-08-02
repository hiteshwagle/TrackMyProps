import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          TrackMyProps
        </Text>
        <Text style={styles.subtitle}>Phase 0 application scaffold</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: 8,
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    flex: 1,
    justifyContent: 'center',
  },
  subtitle: {
    color: '#475569',
    fontSize: 16,
  },
  title: {
    color: '#0F172A',
    fontSize: 32,
    fontWeight: '700',
  },
});
