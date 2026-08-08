import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { LoadingScreen } from '../src/components/ui';
import { AuthProvider, useAuth } from '../src/features/auth/auth-context';
import { ServerStateProvider } from '../src/lib/query-client';

function RootNavigator() {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session)}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Screen
        name="reset-password"
        options={{ headerShown: true, title: 'Reset password' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ServerStateProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </ServerStateProvider>
  );
}
